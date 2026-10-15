---
title: 赞比亚-TCP转发
date: 2026-09-23T14:17:00
slug: Zambia-tcp
draft: false
showToc: true
TocOpen: false
hideSummary: true
hideMeta: false
searchHidden: false
disableShare: false
cover: null
tags: []
---

# 将赞比亚公司电脑设置成节点，做 TCP 转发

# 赞比亚星链出口：国内 Linux 中转

Starlink 无法公网入站、软路由装不了 Tailscale 时，用国内 Linux 做 **单端口 TCP 转发**：PassWall → Linux:20152 → Tailscale → 赞比亚 Xray → 星链出口。

```plain
中转 192.168.0.108端口 20152不改默认路由 / DNS / 财务
```

## 1方案

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

源自[2652bb2b-5014-49e4-9895-bcfac811334d](files/uploads/%E8%B5%9E%E6%AF%94%E4%BA%9A-%E5%9B%BD%E5%86%85Linux%E4%B8%AD%E8%BD%AC%E5%AE%9E%E6%96%BD%E6%96%B9%E6%A1%88.md)

### 内网地址查询

Windows：`ipconfig`，看「IPv4 地址」

Linux：`ip -4 addr` 或 `hostname -I`

### 确保端口没有被已有服务占用

<!-- 这是一张图片，ocr 内容为：E.判断端口是否被占用(你问的重点) 在赞比亚LINX 电脑执行: SS -1NTUP | RG ":20000\B|:20152\B" 有输出:端口已被占用(会显示进程名/PID) 无输出:端口当前空闲,可用 再精确查某个端口 (例如 2000): ITCP:20000 -P -STCP:LISTEN-N SUDO LSOF 有结果被占用 空结果没被占用 F.开放端口后外网连通性检查(可选) 配置转发后,从外网机器测试: NC-VZ你的公网IP2000 或用在线端口检测站. 若不通,常见是:防火墙未放行,双NAT,CGNAT,映射到错误内网IP. -->
![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1783073788852-ea93ae40-3c29-41a6-8bfc-9401fff62bb1.png)

## 四种网络场景选型

情况一：若赞比亚有公网静态 IP，且为单层 NAT，直接进行端口转发 + 安装配置 xray + 强密码，国内这边直接用软路由连接

情况二：若赞比亚有公网静态 IP，为双层 NAT，尝试光猫桥接模式，再进行端口转发 + 安装配置 xray + 强密码，国内这边直接用软路由连接

情况三：若赞比亚非静态 IP，单层 NAT，配置 DDNS，域名指向公网 IP，再进行端口转发 + 安装配置 xray + 强密码，国内这边直接用软路由连接

情况四：若赞比亚非静态 IP，双层 NAT，配置 DDNS，域名指向公网 IP，尝试光猫桥接模式，再进行端口转发 + 安装配置 xray + 强密码，国内这边直接用软路由连接（或不使用光猫桥接，而是使用建立隧道，在隧道内进行端口转发）

[流量转发全部情况-方案.md](https://www.yuque.com/attachments/yuque/0/2026/markdown/57443523/1783910492889-6ac07bd9-cdac-4ad1-ae76-938ca59cab5f.markdown)

## Tailscale / 现场参数与附件

<!-- 这是一张图片，ocr 内容为：SUPPORTED 74.244.129.132 -->
![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1784543753312-48aab120-8c38-4a43-af60-d93f80b8fcd5.png)

linux，内网 192.168.0.108

<!-- 这是一张图片，ocr 内容为：字段 含义 你的值 这台LINUX在虚拟网里的地址 TAILSCALE IP 100.117.230.96 主机名是LOCALHOST, TAILSCALE 自动加了后缓 设备名 LOCALHOST-0 已登录的 TAILNET 账号 YUEHAI0422 正常 LINUX 系统 末尾 赞比亚还没装 TAILSCALE,所以还没有 PEER 无其他在线节点 -->
![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1784543767933-d27f782c-240e-4a97-ae1c-a30b147cbd00.png)

赞比亚 Tailscale IP：100.100.215.10

软路由 WAN IP：192.169.0.100（对外）　192.168.10.1（对内）

强密码：<font style="color:#000000;">M/nFvKnMyYnV00PHf2S6raANm/TV5XX1</font>

[cursor_ssh_connection_to_zambia_pc.md](https://www.yuque.com/attachments/yuque/0/2026/markdown/57443523/1784604395085-ab4f2b8a-aed9-47c8-99ac-f3bd59baa712.markdown)

## 软路由节点分配与链式代理

### 软路由节点分配

1. 状态-概览，将设备 MAC 地址设为静态
2. 网络-DNS-静态地址分配，添加刚刚设为静态的 MAC 地址
3. 服务-Passwall-访问控制，TCP 节点设置想要分配的节点，UDP 与 TCP 节点相同即可

### 软路由使用 IP 服务商的 IP（只支持海外环境使用）

1. Passwall-节点列表，新增节点，备注链式代理，类型选择 Xray，Xray 通常会出现「前置代理」字段，可以选一个已有的海外节点做跳板（链式代理相当于一个跳板/中间件）
2. 若 Passwall 版本过旧，没有前置代理功能，可以使用 Xray 的「分流节点」做链式代理。Xray 类型下，可以选择分流协议，之后会弹出前置代理选项
3. 在访问控制中对相应设备配置链式代理即可
4. 前置代理和默认代理尽量使用相同类型，eg：都是 Xray

<!-- 这是一张图片，ocr 内容为：菲律宾链式 节点备注 XRAY 类型 协议 分流 前置代理 XRAY SHADOWSOCKS:[赞比亚] 前置代理节点 设置用作前置代理的节点.每条规则(包括默认)都有独立开关控制本规则是否使用前置代理. 关闭 STEAM 关闭 \* AD -->
![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1785394972566-0be83924-8901-4252-82a5-7495dfcf3283.png)

<!-- 这是一张图片，ocr 内容为：没有分流规则?点我前往去添加. XRAY SOCKS:[菲律宾原生IP] 默认 前置代理节点 默认前置代理 当使用时,本机将首先连接到此节点,然后再使用此节点连接到默认节点落地. 域名解析策略 IPONDEMAND ASLS:只使用域名进行路由选择.默认值. IPIFNONMATCH:当域名没有匹配任何规则时,将域名解析成IP(A 记录或AA 记录)再次进行匹配 IPONDEMAND:当匹配时碰到任何基于IP的规则,将域名立即解析为IP进行匹配. HYBRID 域名匹配算法 -->
![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1785394992812-dd041019-1169-441a-aa73-9b38f692e0fe.png)
