# Project09 — PrivatePulse

> 类型：多设备隐私心跳与保护控制
>
> 状态：Active, read-only milestone
>
> 正式仓库：`XDXD5856/Project09-PrivatePulse`

## 一句话

用一个中央签到按钮管理电脑、外接硬盘和两部 iPhone 的隐私保护状态。

## 当前边界

- 服务器记录 owner heartbeat、设备状态和审计事件。
- Windows agent 当前只上报在线状态。
- `expired` 只是超时状态，不会改动文件。
- 文件删除、密钥销毁和不可逆操作尚未启用。

## Related Projects

| Project | Relation | Purpose | Required |
|---|---|---|---|
| Project12 — VPS VPN Manager | infrastructure | 提供 VPS 和私有设备访问通道 | No |

## 下一步

在 VPS 上部署只读 heartbeat server，先用分钟级测试倒计时验证电脑与 iPhone 的签到流程。
