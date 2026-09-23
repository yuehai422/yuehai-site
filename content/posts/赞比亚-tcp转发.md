---
title: 赞比亚-TCP转发
date: 2026-09-23T14:17:00
slug: Zambia-tcp
draft: false
showToc: true
TocOpen: false
hideSummary: false
hideMeta: false
searchHidden: false
disableShare: false
cover: null
tags: []
---

# 将赞比亚公司电脑设置成节点，做 TCP 转发

## 前置条件

1. 静态公网 IP（IPv4）
2. 赞比亚网络支持端口转发

（避免双 NAT，查看方式：1. 路由器中是否有端口转发功能；2. 路由器后台找到 WAN IP（路由器概览里网络区域的 IPv4 地址 == [https://ifconfig.me/](https://ifconfig.me/) 查到的地址））

若不支持，优先 Tailscale + Xray 只监听 Tailscale IP，不要公网裸暴露端口

端口转发只影响入站（从外面连进来），国内是出站（上网）不影响

双 NAT 只影响入站（从外面连进来），不影响出站（上网）

## 双 NAT / 内网 · WAN · 公网 IP

设备内网，WAN IP 区别：

<!-- 这是一张图片，ocr 内容为：和公网IP的关系 很多人还会混淆第三个概念: 概念 你家里的例子 谁拥有 某台电脑 电脑内网地址 192.168.10.50 192.168.0.100 路由器WANIP 路由器朝外一侧 整个网络对外的出口 公网IP 209.33.173.183 电脑内网地址:最里面一层 路由器WANIP:中间一层(朝外) 公网IP:最外面,真正对互联网可见的出口 你之前做的对比: WANIP三 192.168.0.100(私网) (公网) IFCONFIG公网209.33.173.183 说明软路由还在上级路由后面,所以从公网连不进软路由后面的设备,但从内往外上网没问题. -->
![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1783074717811-6f74a408-1aba-405f-815a-a677751b6eb6.png)

3. 若双 NAT，使用 VPN（WireGuard）打通隧道
4. 配置 xray，等一系列设置，让 xray 在隧道中监听

## 端口转发步骤

### 路由器端口转发

<!-- 这是一张图片，ocr 内容为：1.进路由器管理页 HTTP://192.168.10.1 2.网络防火墙口转发 3.新增一条: 名称:XRAY-20152 协议:TCP  (如要 UDP 也用就选 TCP+UDP) 外部区域: WAN 外部端口:20152 内部区域:LAN 内部IP:赞比亚 LINX 电脑内网地址(如 192.168.10.50) 内部端口:20152 4.保存并应用 5.同时确保LINX 电脑本机防火墙放行 2 行20152 -->
![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1783073676799-670c4257-3f52-4e8e-8c2e-71e04d9ddaed.png)

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

### 相关文档

- [赞比亚静态ip方案.md](./赞比亚静态ip方案.md)
- [赞比亚星链Tailscale实施方案.md](./赞比亚星链Tailscale实施方案.md)
- [赞比亚链路故障排查手册.md](./赞比亚链路故障排查手册.md)
- [赞比亚现场排查检查表.md](./赞比亚现场排查检查表.md)
- [赞比亚-TCP转发操作手册.md](./赞比亚-TCP转发操作手册.md)（步骤化重写版）
