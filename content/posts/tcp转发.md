---
title: tcp转发
date: 2026-10-15T14:40:00
slug: tcp
draft: false
showToc: false
TocOpen: false
hideSummary: true
hideMeta: false
searchHidden: false
disableShare: false
cover: null
tags: []
---

````markdown
# 赞比亚星链出口：国内 Linux 中转（总结）


> **场景**：Starlink 无法公网入站 + 软路由装不了 Tailscale  
> **做法**：国内 Linux（`192.168.0.108`）做 **Tailscale + 单端口 TCP 转发**  
> **原则**：旁路通道，不改默认路由 / DNS / Docker / 财务端口  
> **完整文档**：`赞比亚-国内Linux中转实施方案.md`


---


## 1. 方案一句话


软路由 PassWall → `192.168.0.108:20152`（socat）→ Tailscale → 赞比亚 Xray（SS :20152）→ Starlink → **ZM IP**。


**允许做的只有：**


1. 安装 Tailscale（关闭 DNS / 路由接管）
2. 新增专用端口转发（如 `20152`）
3. 防火墙仅放行软路由 `192.168.0.100`


---


## 2. 流量路径


```text
[国内办公设备]
      ↓ 网关 192.168.10.1
[软路由 PassWall]  ──TCP──→  192.168.0.108:20152
  WAN: 192.168.0.100              ↑
                           [国内 Linux 中转]
                           · 财务系统（不动）
                           · Tailscale + socat
                                      ↓ Tailscale
                           [赞比亚 Windows]
                           · Xray SS :20152
                                      ↓ Starlink
                           互联网（ZM IP）
```


| 设备 | IP | 作用 |
|---|---|---|
| 赞比亚 Windows | 星链 + Tailscale IP | Xray 服务端，统一出口 |
| 国内 Linux | `192.168.0.108` | Tailscale + 端口转发 |
| 软路由 | WAN `192.168.0.100` / LAN `192.168.10.1` | PassWall，**不装 Tailscale** |


---


## 3. 参数速查


| 参数 | 值 |
|---|---|
| 国内 Linux | `192.168.0.108` |
| 软路由 WAN | `192.168.0.100` |
| 转发端口 | `20152` |
| 协议 | Shadowsocks / `aes-128-gcm` |
| PassWall 地址 | `192.168.0.108` |
| 赞比亚 Xray listen | `赞比亚TS_IP`（勿用 `0.0.0.0`） |
| Tailscale 参数 | `--accept-dns=false --accept-routes=false` |


---


## 4. 执行顺序


1. 注册 Tailscale + 生成强密码：`openssl rand -base64 24`
2. 赞比亚：Tailscale + Xray（listen 仅绑 TS IP）+ 防火墙 + 自启
3. 国内 Linux：Tailscale（必须关 DNS/路由）
4. 国内 Linux：socat systemd 转发 + 防火墙只放行 `192.168.0.100`
5. **财务系统回归测试**
6. 软路由 PassWall：赞比亚节点改为 `192.168.0.108:20152`，伪装改 `none`
7. 验收 ip.sb = Zambia；用访问控制指定设备走赞比亚


---


## 5. 关键命令


### 5.1 生成密码


```bash
openssl rand -base64 24
```


### 5.2 国内 Linux · Tailscale


```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --accept-dns=false --accept-routes=false
```


### 5.3 国内 Linux · socat 转发


> 把 `赞比亚TS_IP` 换成真实值。监听只绑 `192.168.0.108`，不要 `0.0.0.0`。


```bash
sudo tee /etc/systemd/system/zambia-forward.service >/dev/null <<EOF
[Unit]
Description=Forward 192.168.0.108:20152 to Zambia Tailscale Xray
After=network-online.target tailscaled.service
Wants=network-online.target


[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:20152,bind=192.168.0.108,fork,reuseaddr TCP:赞比亚TS_IP:20152
Restart=always
RestartSec=3


[Install]
WantedBy=multi-user.target
EOF


sudo systemctl daemon-reload
sudo systemctl enable --now zambia-forward.service
```


### 5.4 防火墙 · 仅放行软路由（ufw）


```bash
sudo ufw allow from 192.168.0.100 to any port 20152 proto tcp comment 'passwall-to-zambia-forward'
```


**不要**执行 `ufw allow 20152`（对全网开放）。


### 5.5 赞比亚 · Xray `config.json`


> `listen` 必须填赞比亚 Tailscale IP。


```json
{
  "log": { "loglevel": "warning" },
  "inbounds": [
    {
      "tag": "ss-zambia",
      "listen": "赞比亚TS_IP",
      "port": 20152,
      "protocol": "shadowsocks",
      "settings": {
        "method": "aes-128-gcm",
        "password": "你的强密码",
        "network": "tcp,udp"
      }
    }
  ],
  "outbounds": [
    { "tag": "direct", "protocol": "freedom" }
  ]
}
```


### 5.6 财务异常 · 立即回滚


```bash
sudo systemctl disable --now zambia-forward.service
# 仍异常再执行：
sudo tailscale down
```


---


## 6. PassWall 节点改动


| 字段 | 旧 | 新 |
|---|---|---|
| 地址 | `0415zby.live66.live` | **`192.168.0.108`** |
| 端口 | `20152` | `20152` |
| 密码 | 旧密码 | **新强密码** |
| 加密 | `aes-128-gcm` | `aes-128-gcm` |
| 伪装 | `http` | **`none`** |
| TLS | 关 | 关 |


日常建议用访问控制指定设备走赞比亚，避免全局切换。


---


## 7. 验收清单


| # | 检查 | 预期 |
|---|---|---|
| 1–2 | 两边 Tailscale | Connected |
| 3 | `tailscale ping 赞比亚TS_IP` | 通 |
| 4–5 | Xray + `zambia-forward` | 监听 / active |
| 6 | `nc -zv 192.168.0.108 20152` | 通 |
| 7–8 | PassWall + ip.sb | 有延迟 / **Zambia** |
| 9–10 | 财务 / Docker / VM | **完全正常** |


---


## 8. 红线（禁止）


- Exit Node / `--advertise-routes` / `--accept-routes=true` / `--accept-dns=true`
- 改默认网关、netplan、NetworkManager 主路由
- 动 Docker 网桥 / libvirt
- 占用财务端口（80/443/3306/8080 等）
- 对 `0.0.0.0` 开放 `20152`


---


## 9. 故障速查


| 现象 | 先查 |
|---|---|
| PassWall 超时 | `systemctl status zambia-forward`；防火墙源 IP 是否为 `192.168.0.100` |
| 有连通但非 ZM IP | 是否真走赞比亚节点 / 访问控制是否生效 |
| `tailscale ping` 不通 | 同一账号；星链 / 国内网络 |
| 财务异常 | **立刻回滚**，再排查 |
| 赞比亚 TS IP 变了 | 改 service 目标 IP → `daemon-reload && restart` |


```bash
journalctl -u zambia-forward -e --no-pager
```


---


**版本**：2026-07-17（总结稿）  
**定位**：当前推荐方案；软路由直装 Tailscale / 公网 DDNS 已不适用。
````
