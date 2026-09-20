# WireGuard Manager

> 类型：个人 VPN / 多设备 WireGuard 配置管理  
> 状态：Idea → Active planning  
> 正式代码：待独立项目槽位确认

## 一句话

把目前散落在 VPS、多个 iPhone 和电脑上的 WireGuard 配置变成一个清楚、可维护、可追踪的个人设备管理系统。

## 当前需求

已有多个 WireGuard peer，需要把设备真正分开管理，而不是继续共享模糊配置。

目标体验应该接近：

- 一个主服务端；
- 多个独立客户端；
- 每台 iPhone / PC 都有自己的 peer、IP 和名称；
- 可以知道哪个 peer 属于哪台设备；
- 新设备可以快速加入；
- 旧设备可以单独撤销，不影响其他设备。

## 重要想法

1. **一设备一 peer**
   - 每台设备独立 key；
   - 独立 AllowedIPs；
   - 独立标签与备注；
   - 独立 revoke。

2. **配置 registry**
   - 维护设备名、IP、public key、创建时间、状态；
   - private key 不进入公开仓库。

3. **ProjectHello 只存方案**
   - 真正 server configs、private keys、QR secrets 不应放进 PROJECTHELLO。
   - 正式管理代码与私密配置应放独立 private repo / 安全存储。

4. **未来可以有小型可视化管理界面**
   - peers 列表；
   - 最近 handshake；
   - transfer；
   - active / revoked；
   - 添加新设备；
   - 导出客户端配置 / QR。

5. **先 CLI，后 UI**
   - 第一版只要能安全地：
     - list
     - add-device
     - revoke-device
     - export-config
     - sync-server
   - CLI 稳定后再做 Web UI。

## 第一版应该证明

> 能否在不手工复制粘贴 key 和 IP 的情况下，可靠地新增/撤销一台设备，而且不会破坏其他 peer。

## 不要做

- 不要把 private key 提交到 public GitHub；
- 不要让多个实际设备共用同一个 peer；
- 不要一开始为了 UI 引入过重架构；
- 不要自动修改服务器配置而没有备份和 dry-run。

## 下一步

确认该项目应使用哪个 ProjectXX 槽位，然后在独立 private repo 建立最小 CLI 与 registry。
