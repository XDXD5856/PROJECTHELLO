# Linux Compute Node

> 编号：Project08  
> 类型：个人基础设施 / Linux 计算节点  
> 状态：Active  
> 正式仓库：XDXD5856/Project08

## 一句话

把闲置的 ASUS ROG Zephyrus G14 变成一台可以长期在线、由主电脑远程控制、独立执行 CPU/GPU 长任务的 Ubuntu Server 计算节点。

## 为什么值得做

主电脑不应该为了长时间训练、推理和后台任务一直保持在线。独立 Linux 节点可以承接持续运行的任务，同时把远程访问、GPU、系统服务、监控和未来容器环境统一管理。

## 已经证明

- Ubuntu Server 24.04.5 已干净安装并稳定启动；
- Intel AX200 Wi-Fi 正常；
- Windows → G14 的 SSH 与 ED25519 免密认证正常；
- GTX 1660 Ti 6GB + NVIDIA 驱动正常；
- Ollama 已完成真实 GPU 推理；
- tmux 可以让任务脱离 SSH 持续运行；
- HitoriMJ 的 active generation 已从 Windows 断点迁移到 Linux，并从原 generation 继续推进，没有重新开代。

## 第一版应该证明什么

> 这台机器能否成为可靠的“扔在旁边不用碰”的个人计算节点：主电脑只负责下发和查看任务，G14 独立持续运行，并能安全承接项目级 checkpoint。

## 明确不做

- 不在公开仓库保存密码、private key 或其他 secrets；
- 不把某个具体项目的业务逻辑塞进 Project08；
- 不把 DHCP 地址当永久身份；
- 不为了迁移方便而修改项目本身的训练统计语义；
- 不把大模型/checkpoint 默认提交进 Git。

## 当前关系

第一个正式使用 Project08 的项目是 HitoriMJ。HitoriMJ 只记录“如何使用 Linux 节点以及迁移/恢复边界”；机器本身的系统、驱动、SSH、Ollama、tmux、电源和未来 Docker/Tailscale 管理都归 Project08。

## 下一步

- 让当前迁移的 HitoriMJ generation 完整结束；
- 单独验证 CUDA PyTorch 环境；
- 考虑 Tailscale；
- 考虑 Docker + NVIDIA Container Toolkit；
- 增加轻量监控；
- 决定稳定 LAN 地址/主机发现方案。

完整机器状态与操作说明见 Project08 自己的 README / STATUS / OPERATIONS。
