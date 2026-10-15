# 赞比亚星链出口方案（国内 Linux 中转版）

> **适用场景**：赞比亚 Starlink（无法公网入站）+ 国内软路由装不了 Tailscale  
> **中转设备**：国内长期在线 Linux（`192.168.0.108`，同时跑财务系统）  
> **原则**：只增加旁路通道，不改默认路由 / DNS / Docker / 财务端口  
> **日期**：2026-07-17

---

## 〇、绝对不要动的配置（财务系统保护）

在国内 Linux（`192.168.0.108`）上，**禁止**做以下操作：

| 禁止项 | 原因 |
|---|---|
| 开启 Tailscale Exit Node | 会劫持整机出站流量 |
| `--advertise-routes` / 子网路由 | 可能改路由表，影响财务访问 |
| `--accept-routes=true` | 可能引入异常路由 |
| `--accept-dns=true`（默认可能开） | 可能改 DNS，影响财务域名解析 |
| 修改默认网关 / `/etc/netplan` / NetworkManager 主路由 | 断网风险 |
| 改动 Docker 网桥（`172.17.0.1` / `172.18.x`） | 可能影响容器化财务组件 |
| 改动 `192.168.122.1`（libvirt） | 可能影响虚拟机 |
| 占用财务常用端口（80/443/3306/8080 等） | 服务冲突 |
| 对 `0.0.0.0` 大范围开放端口 | 安全与误伤风险 |
| 卸载 / 重启与财务相关的服务 | 业务中断 |

**允许做的只有：**

1. 安装 Tailscale（关闭 DNS/路由接管）
2. 新增一个专用端口转发服务（如 `20152`）
3. 防火墙仅放行软路由 `192.168.0.100` 访问该端口

---

## 一、架构说明

```text
[国内办公设备]
      ↓ 网关 192.168.10.1
[软路由 PassWall]  ──连──→  192.168.0.108:20152
      WAN: 192.168.0.100              ↑
                               [国内 Linux 中转]
                               IP: 192.168.0.108
                               · 财务系统（原样不动）
                               · Tailscale
                               · socat 转发 20152 → 赞比亚 100.x:20152
                                      ↓ Tailscale 隧道
                               [赞比亚 Windows]
                               · Tailscale
                               · Xray (Shadowsocks :20152)
                                      ↓ Starlink
                               互联网（显示赞比亚 IP）
```

### 设备角色

| 设备 | IP | 作用 |
|---|---|---|
| 赞比亚 Windows | 星链上网 + Tailscale IP | Xray 服务端，统一出口 |
| 国内 Linux | `192.168.0.108` | Tailscale + 端口转发中转 |
| 软路由 | WAN `192.168.0.100` / LAN `192.168.10.1` | PassWall 客户端，**不装 Tailscale** |

---

## 二、阶段 0：准备

### 0.1 注册 Tailscale

1. 打开 https://tailscale.com 注册账号  
2. 免费版即可  
3. Admin：https://login.tailscale.com/admin/machines  

### 0.2 生成 Xray 强密码

在任意电脑执行：

```bash
openssl rand -base64 24
```

记下结果，下文用 `你的强密码` 表示。  
**不要**再用旧节点里已暴露的密码。

### 0.3 确认端口空闲（国内 Linux）

```bash
sudo ss -lntup | grep -E ':20152|:80|:443|:3306|:8080'
```

- 若 `20152` 已被占用 → 改用 `45201` 等，全文统一替换  
- 财务相关端口有监听属正常，**不要动**

### 0.4 安装后回归测试清单（每次变更后必做）

在国内 Linux / 财务客户端上确认：

- [ ] 财务系统网页/客户端能打开  
- [ ] 数据库/接口访问正常  
- [ ] Docker 容器（如有）状态正常：`docker ps`  
- [ ] 本机上网正常  

---

## 三、阶段 1：赞比亚 Windows（服务端）

### 1.1 环境要求

- 长期开机、接网线  
- 关闭睡眠：设置 → 系统 → 电源 → 从不睡眠  
- 可装远程工具便于国内运维  

### 1.2 安装 Tailscale

1. 下载：https://tailscale.com/download/windows  
2. 安装并用**同一账号**登录  
3. 查看 Tailscale IP：

```powershell
tailscale ip -4
```

记录为：`赞比亚TS_IP`（例：`100.64.12.34`）

### 1.3 安装 Xray

1. 打开 https://github.com/XTLS/Xray-core/releases  
2. 下载 `Xray-windows-64.zip`  
3. 解压到 `C:\xray\`  

### 1.4 配置 `C:\xray\config.json`

> **listen 必须填赞比亚 Tailscale IP，不要填 `0.0.0.0`**

```json
{
  "log": { "loglevel": "warning" },
  "inbounds": [
    {
      "tag": "ss-zambia",
      "listen": "100.64.12.34",
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

把 `100.64.12.34` 换成真实 `赞比亚TS_IP`。

### 1.5 启动与自启

先测试：

```powershell
cd C:\xray
.\xray.exe run -c config.json
```

另开窗口：

```powershell
Test-NetConnection -ComputerName 100.64.12.34 -Port 20152
```

`TcpTestSucceeded : True` 即成功。

用 NSSM 设开机自启（推荐）：

1. 下载 https://nssm.cc/download  
2. 管理员运行 `nssm install Xray`  
3. Path: `C:\xray\xray.exe`  
4. Startup directory: `C:\xray`  
5. Arguments: `run -c config.json`  
6. `nssm start Xray`  

### 1.6 Windows 防火墙（仅放行 Tailscale 网段）

```powershell
New-NetFirewallRule -DisplayName "Xray-TS-20152-TCP" `
  -Direction Inbound -Action Allow -Protocol TCP -LocalPort 20152 `
  -RemoteAddress 100.64.0.0/10

New-NetFirewallRule -DisplayName "Xray-TS-20152-UDP" `
  -Direction Inbound -Action Allow -Protocol UDP -LocalPort 20152 `
  -RemoteAddress 100.64.0.0/10
```

### 1.7 确认赞比亚出口

浏览器打开 https://ip.sb ，应显示 **Zambia / ZM**。

---

## 四、阶段 2：国内 Linux 中转（`192.168.0.108`）

### 2.1 安装 Tailscale（关闭 DNS/路由接管）

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --accept-dns=false --accept-routes=false
```

浏览器打开输出的链接，用**同一账号**登录。

验证：

```bash
tailscale ip -4
tailscale ping 赞比亚TS_IP
```

能 ping 通再继续。

> 若以后重登，务必仍带：`--accept-dns=false --accept-routes=false`

### 2.2 安装 socat

```bash
# Debian / Ubuntu
sudo apt update
sudo apt install -y socat

# CentOS / RHEL（若适用）
# sudo yum install -y socat
```

### 2.3 创建端口转发服务（只绑 192.168.0.108）

```bash
sudo tee /etc/systemd/system/zambia-forward.service >/dev/null <<EOF
[Unit]
Description=Forward 192.168.0.108:20152 to Zambia Tailscale Xray
After=network-online.target tailscaled.service
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:20152,bind=192.168.0.108,fork,reuseaddr TCP:100.100.215.19:20152
Restart=always
RestartSec=3
# 不使用 root 以外的网络命名空间，避免碰 Docker

[Install]
WantedBy=multi-user.target
EOF
```

**务必**把上面的 `赞比亚TS_IP` 换成真实值。

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now zambia-forward.service
sudo systemctl status zambia-forward.service --no-pager
```

检查监听：

```bash
sudo ss -lntup | grep 20152
```

应看到绑定在 `192.168.0.108:20152`，**不是** `0.0.0.0:20152`（更安全）。

### 2.4 防火墙：只允许软路由访问

#### 若使用 ufw

```bash
sudo ufw allow from 192.168.0.100 to any port 20152 proto tcp comment 'passwall-to-zambia-forward'
sudo ufw status | grep 20152
```

#### 若使用 firewalld

```bash
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.0.100" port protocol="tcp" port="20152" accept'
sudo firewall-cmd --reload
```

#### 若使用 iptables

```bash
sudo iptables -I INPUT -p tcp -s 192.168.0.100 --dport 20152 -j ACCEPT
# 持久化方法按你系统现有习惯（iptables-save / netfilter-persistent）
```

**不要**执行 `ufw allow 20152`（对全网开放）。

### 2.5 中转侧自测

在国内 Linux 上：

```bash
# 到赞比亚 Xray
nc -zv 赞比亚TS_IP 20152

# 本机转发端口
nc -zv 192.168.0.108 20152
```

### 2.6 财务系统回归（必做）

- [ ] 财务系统登录 / 查账 / 打单正常  
- [ ] `docker ps`（如有）无异常重启  
- [ ] 虚拟机（如有）网络正常  
- [ ] 本机访问外网正常  

若任何一项异常：**立刻**执行回滚（见文末）。

---

## 五、阶段 3：软路由 PassWall（只改节点，不装 Tailscale）

> 需要有软路由写权限的人操作。当前若只能查看，请交有权限同事执行。

### 5.1 修改「赞比亚」节点

路径：PassWall → 节点列表 → 赞比亚（`myshunt`）

| 字段 | 旧值 | 新值 |
|---|---|---|
| 地址 | `0415zby.live66.live` | **`192.168.0.108`** |
| 端口 | `20152` | `20152` |
| 密码 | 旧密码 | **`你的强密码`** |
| 加密 | `aes-128-gcm` | `aes-128-gcm` |
| 传输 | TCP | TCP |
| 伪装 | `http` | **`none`** |
| TLS | 关 | 关 |

保存。

### 5.2 启用与分流

1. PassWall → 基本设置 → **主开关**打开  
2. 测试：临时把 TCP 节点切到「赞比亚」，测延迟 / 谷歌连接  
3. 日常建议：用**访问控制**让指定设备走赞比亚，避免全局切换影响全网  
4. 也可继续用 Socks `192.168.10.1:1081`（若仍映射赞比亚节点）  

### 5.3 验收

走赞比亚节点的设备访问 https://ip.sb ：

- 国家应为 **Zambia / ZM**

---

## 六、完整验收清单

| # | 检查项 | 预期 |
|---|---|---|
| 1 | 赞比亚 Tailscale 在线 | Admin Console Connected |
| 2 | 国内 Linux Tailscale 在线 | Connected |
| 3 | `tailscale ping 赞比亚TS_IP` | 通 |
| 4 | 赞比亚 Xray 监听 | `Test-NetConnection` 成功 |
| 5 | Linux `zambia-forward` 运行 | `systemctl status` active |
| 6 | `nc -zv 192.168.0.108 20152` | 通 |
| 7 | PassWall 赞比亚节点延迟 | 有数值 |
| 8 | ip.sb 出口国家 | Zambia |
| 9 | 财务系统 | **完全正常** |
| 10 | Docker / 虚拟机 | **无异常** |

---

## 七、故障排查

| 现象 | 排查 |
|---|---|
| PassWall 超时 | Linux 上 `systemctl status zambia-forward`；防火墙是否只放行了错误 IP |
| 转发正常但无赞比亚 IP | PassWall 是否真走赞比亚节点；访问控制是否生效 |
| `tailscale ping` 不通 | 两边是否同一账号；星链/国内网络是否正常 |
| 财务异常 | **立刻回滚**（停转发、可选停 Tailscale） |
| 赞比亚 TS IP 变更 | 极少见；若变了，改 `zambia-forward.service` 里的目标 IP 后 `daemon-reload && restart` |

查看转发日志：

```bash
journalctl -u zambia-forward -e --no-pager
```

---

## 八、回滚（财务异常时立即执行）

在国内 Linux：

```bash
# 1. 停止并禁用转发（优先）
sudo systemctl disable --now zambia-forward.service

# 2. 如仍异常，暂时断开 Tailscale（一般不必）
sudo tailscale down

# 3. 确认财务恢复后，再排查，不要急着重开
```

软路由：把赞比亚节点切回其他可用节点，或关闭相关访问控制。

删除转发服务（确认不用后）：

```bash
sudo systemctl disable --now zambia-forward.service
sudo rm -f /etc/systemd/system/zambia-forward.service
sudo systemctl daemon-reload
```

---

## 九、日常维护

| 项目 | 建议 |
|---|---|
| 国内 Linux | 保持开机，关闭休眠 |
| 赞比亚 Windows | 保持开机，Xray + Tailscale 自启 |
| 密码 | 定期更换，两边同步 |
| Tailscale 设备列表 | 定期清理陌生设备 |
| 财务变更窗口 | 不要与开通/升级转发同一天叠做 |

---

## 十、执行顺序（抄作业）

```text
Day 1  注册 Tailscale + 生成密码
Day 1  赞比亚：Tailscale + Xray + 防火墙 + 自启
Day 1  国内 Linux：Tailscale（--accept-dns=false --accept-routes=false）
Day 1  国内 Linux：socat 转发服务 + 防火墙仅放行 192.168.0.100
Day 1  财务系统回归测试
Day 2  软路由：PassWall 赞比亚节点改为 192.168.0.108:20152
Day 2  验收 ip.sb = Zambia
Day 2  配置访问控制（指定设备走赞比亚）
```

---

## 十一、参数速查表

| 参数 | 值 |
|---|---|
| 国内 Linux 内网 IP | `192.168.0.108` |
| 软路由 WAN IP | `192.168.0.100` |
| 转发端口 | `20152` |
| 协议 | Shadowsocks / aes-128-gcm |
| PassWall 地址 | `192.168.0.108` |
| 赞比亚 Xray listen | `赞比亚TS_IP` |
| Tailscale 参数 | `--accept-dns=false --accept-routes=false` |

---

## 十二、与旧方案关系

| 方案 | 状态 |
|---|---|
| 软路由直接装 Tailscale | **已放弃**（无 tun、空间不足、源失效） |
| 公网端口转发 / DDNS | **不适用**（Starlink） |
| 租 VPS + frp | 可选备胎，当前不需要 |
| **国内 Linux 中转** | **当前推荐方案** |

旧文档 `赞比亚星链Tailscale实施方案.md` 中「软路由装 Tailscale」部分作废；以本文为准。

---

**文档版本**：2026-07-17  
**维护**：国内网络负责人
