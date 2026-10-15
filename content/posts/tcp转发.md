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

```plain
TCP 中转 · 旁路方案
```

# 赞比亚星链出口：国内 Linux 中转

Starlink 无法公网入站、软路由装不了 Tailscale 时，用国内 Linux 做 **单端口 TCP 转发**：PassWall → Linux:20152 → Tailscale → 赞比亚 Xray → 星链出口。

```plain
中转 192.168.0.108端口 20152不改默认路由 / DNS / 财务
```

## 1方案一句话

国内 Linux（同时跑财务）只充当 **Tailscale 客户端 + socat 端口转发**， 把软路由打来的 Shadowsocks TCP 流量转到赞比亚 Windows 上的 Xray； 全程旁路，禁止 Exit Node / 子网路由 / DNS 接管。

**允许做的只有三件事：** ① 安装 Tailscale（关 DNS/路由）　 ② 新增专用端口转发（如 20152）　 ③ 防火墙仅放行软路由 `192.168.0.100`

## 2流量路径

```plain
[办公设备]
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

## 3关键速查

国内 Linux

```plain
192.168.0.108
```

软路由 WAN

```plain
192.168.0.100
```

转发端口

```plain
20152
```

协议

```plain
SS / aes-128-gcm
```

PassWall 地址

```plain
192.168.0.108
```

Tailscale 安全参数

```plain
--accept-dns=false --accept-routes=false
```

## 4执行顺序

1. 注册 Tailscale + `openssl rand -base64 24` 生成强密码
2. 赞比亚：Tailscale + Xray（listen 仅绑 TS IP）+ 防火墙 + 自启
3. 国内 Linux：Tailscale（必须关 DNS/路由）
4. 国内 Linux：socat systemd 转发 + 防火墙只放行 `192.168.0.100`
5. 财务系统回归测试（必过）
6. 软路由 PassWall：赞比亚节点改为 `192.168.0.108:20152`，伪装改 `none`
7. 验收 ip.sb = Zambia；用访问控制指定设备走赞比亚

## 5关键命令

生成密码

bash · 任意机器复制

```plain
openssl rand -base64 24
```

国内 Linux · 安装 Tailscale（关接管）

bash · 192.168.0.108复制

```plain
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --accept-dns=false --accept-routes=false
```

国内 Linux · socat 转发服务（把赞比亚 TS IP 换成真实值）

bash · zambia-forward.service复制

```plain
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

防火墙 · 仅放行软路由（ufw 示例）

bash · ufw复制

```plain
sudo ufw allow from 192.168.0.100 to any port 20152 proto tcp comment 'passwall-to-zambia-forward'
```

赞比亚 · Xray 监听（listen 填真实 TS IP，勿用 0.0.0.0）

json · C:\xray\config.json复制

```plain
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

财务异常 · 立即回滚

bash · 回滚复制

```plain
sudo systemctl disable --now zambia-forward.service
# 仍异常再执行：
sudo tailscale down
```

## 6PassWall 节点改动

| 字段 | 旧 | 新 |
| --- | --- | --- |
| 地址 | `0415zby.live66.live` | `192.168.0.108` |
| 端口 | 20152 | 20152 |
| 密码 | 旧密码 | 新强密码 |
| 加密 | aes-128-gcm | aes-128-gcm |
| 伪装 | http | **none** |
| TLS | 关 | 关 |

日常用访问控制指定设备走赞比亚，避免全局切换影响全网。

## 7验收与红线

| \# | 检查 | 预期 |
| --- | --- | --- |
| 1–2 | 两边 Tailscale | Connected |
| 3 | `tailscale ping 赞比亚TS_IP` | 通 |
| 4–5 | Xray + zambia-forward | 监听 / active |
| 6 | `nc -zv 192.168.0.108 20152` | 通 |
| 7–8 | PassWall + ip.sb | 有延迟 / Zambia |
| 9–10 | 财务 / Docker / VM | **完全正常** |

**禁止：** Exit Node、advertise-routes、accept-routes、accept-dns、改默认网关/netplan、动 Docker 网桥、占用 80/443/3306/8080、对 0.0.0.0 开放 20152。

## 8故障速查

| 现象 | 先查什么 |
| --- | --- |
| PassWall 超时 | `systemctl status zambia-forward`；防火墙源 IP 是否为 192.168.0.100 |
| 有连通但非 ZM IP | 是否真走赞比亚节点 / 访问控制是否生效 |
| tailscale ping 不通 | 同一账号；星链 / 国内网络 |
| 财务异常 | **立刻回滚**，再排查 |
| 赞比亚 TS IP 变了 | 改 service 目标 IP → daemon-reload && restart |

bash · 看转发日志复制

```plain
journalctl -u zambia-forward -e --no-pager
```

源自《赞比亚-国内Linux中转实施方案》· 2026-07-17 · 「复制全文」拷贝整页纯文本 · 各块「复制」拷贝单条命令
