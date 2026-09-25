# PROJECTHELLO 项目编号与跨项目规则

> 本文件定义 Project01–Project100 的编号、项目边界、目录内容与跨项目引用方式。
> 目标：让人和 AI 都能快速判断“这个东西应该放哪里”“这个项目依赖谁”“以后改名会不会断”。

---

# 1. 编号规则

## 1.1 ProjectXX 是永久身份

- `Project01` 到 `Project100` 是固定项目槽位。
- **编号是身份，不是排名。**
- 项目重要性、成熟度、活跃程度变化时，不需要换编号。
- 项目可以改名字，但原则上不改编号。

例如：

```text
Project07
旧名：PVZPlayer
新名：PVZAgent
```

仍然是同一个项目：

```text
Project07-PVZAgent
```

## 1.2 编号一旦使用，不轻易复用

如果 Project23 被废弃：

```text
Project23 — Archived
```

不要立刻把 Project23 分配给完全无关的新项目。

原因：

- 旧聊天可能引用它；
- Git commit / issue / 文档可能引用它；
- 其他项目可能已经链接它；
- AI 的长期上下文可能仍然认识这个编号。

如果真的要永久回收编号，必须先确认不存在有效引用。

## 1.3 空槽位

未使用编号统一表示：

```text
Project23 — Empty
```

不要把“暂时不知道是什么”写成 Empty。

不知道时写：

```text
Project23 — Unknown / To verify
```

## 1.4 项目名格式

GitHub repository 和本地项目文件夹统一使用：

```text
ProjectXX-ProjectName
```

其中 `ProjectXX` 是永久编号，`ProjectName` 是简短、可读的项目名。例如：

```text
Project07-PVZPlayer
Project09-PrivatePulse
Project12-VPS-VPN-Manager
Project18-LinuxLab
```

新建正式项目必须遵循这个格式。旧项目在确认链接、部署路径和自动化不会被破坏后，逐步迁移到同一格式。项目改名时只改 `ProjectName`，不改 `ProjectXX`。

---

# 2. 什么应该成为一个独立 Project

一个东西满足以下任意几条时，适合成为独立 Project：

- 有自己的长期目标；
- 可以单独运行、部署或测试；
- 未来可能被多个其他项目复用；
- 有独立技术栈或运行环境；
- 有自己的 secrets / infrastructure；
- 有明显独立生命周期；
- 即使主项目停止，它仍然有价值。

例如：

```text
HitoriMJ
VPN Manager
Linux Environment / Lab
CyberEternity
PVZPlayer
```

都可以是独立 Project。

反之，下面通常不需要独立编号：

- 一个小脚本；
- 单个实验 notebook；
- 一次性数据处理；
- 某个项目内部的小组件；
- 只服务于一个项目、没有独立生命周期的 helper。

---

# 3. 每个 Project 里面应该放什么

正式 Project repo 推荐最小结构：

```text
ProjectXX-Name/
├── README.md
├── AGENTS.md
├── PROJECT.md
├── STATUS.md
├── ROADMAP.md
│
├── src/            # 正式代码
├── tests/          # 测试
├── scripts/        # 可重复运行的脚本
├── docs/           # 详细文档
└── .github/        # CI / issue / workflow（需要时）
```

不要求所有项目都强制拥有所有目录。

## README.md

给人看的快速入口：

- 这是什么；
- 怎么安装；
- 怎么运行；
- 当前是否可用；
- 最重要的链接。

## PROJECT.md

项目身份证：

- Project ID；
- 项目名称；
- 核心目标；
- 项目边界；
- 技术栈；
- 关键约束；
- 依赖哪些其他 Project。

## AGENTS.md

给 AI / Coding Agent 的工作规则：

- 先读什么；
- 哪些东西不能乱改；
- 如何测试；
- secrets 规则；
- 完成任务后应该更新什么。

## STATUS.md

当前真实状态：

- Working；
- In progress；
- Broken；
- Known issues；
- Last verified；
- Next recommended task。

## ROADMAP.md

未来方向。

只写计划，不要把 roadmap 中的内容误写成已经实现。

---

# 4. PROJECTHELLO 与正式项目的边界

PROJECTHELLO 负责：

- Project01–Project100 registry；
- 项目简介；
- 项目原始想法；
- 总 Prompt；
- 项目之间的关系；
- 新项目启动规则；
- 被暂缓、否决或尚未进入开发的构思。

PROJECTHELLO **不负责**：

- 正式生产代码；
- 大型模型文件；
- 数据集；
- private keys；
- VPN 配置 secret；
- API tokens；
- 正式部署配置；
- 项目运行产生的大量数据。

原则：

> PROJECTHELLO 知道“项目是什么、为什么存在、和谁有关”，
> 正式 repo 知道“项目现在怎么运行”。

---

# 5. 跨项目链接：不要复制，要引用

这是整个体系最重要的规则之一。

如果 HitoriMJ 使用了 VPN 或 Linux 环境，不要把 VPN 管理逻辑复制进 HitoriMJ。

应该写成依赖：

```md
## Related Projects

- Project?? — VPN Manager
  - Role: remote access to training machine
  - Dependency type: infrastructure

- Project?? — Linux Lab
  - Role: CUDA / training runtime
  - Dependency type: runtime environment
```

当编号确认后，把 `Project??` 替换成真实编号。

例如：

```md
## Related Projects

- Project12 — VPN Manager
  - Role: remote access to HitoriMJ training host
  - Dependency type: infrastructure

- Project18 — Linux Lab
  - Role: reproducible CUDA/PyTorch environment
  - Dependency type: runtime
```

---

# 6. 跨项目依赖类型

推荐使用以下类型。

## infrastructure

底层基础设施：

- VPN；
- reverse proxy；
- VPS；
- networking；
- storage。

例：

```text
HitoriMJ -> VPN Manager
```

## runtime

运行环境：

- Linux image；
- CUDA；
- Python environment；
- Docker base。

例：

```text
HitoriMJ -> Linux Lab
```

## library

代码级依赖：

- 公共 Python package；
- JS package；
- 自己写的 shared SDK。

## data

数据来源：

- dataset；
- replay archive；
- logs；
- model registry。

## service

一个项目调用另一个项目提供的服务/API。

## tooling

开发工具依赖：

- benchmark runner；
- deployment helper；
- monitoring UI；
- code generator。

## conceptual

只是理念、研究或设计上的关联，没有运行时依赖。

---

# 7. 链接格式

任何正式项目的 `PROJECT.md` 建议加入：

```md
## Related Projects

| Project | Relation | Purpose | Required |
|---|---|---|---|
| Project12 — VPN Manager | infrastructure | Remote access | No |
| Project18 — Linux Lab | runtime | Training environment | Yes |
```

如果有 GitHub repo，再补：

```md
- Project12 — VPN Manager
  - Repo: <GitHub repository URL>
  - Relation: infrastructure
  - Purpose: secure remote access
```

**引用优先使用 ProjectXX。**

因为：

- 名字可以改；
- repo 可以迁移；
- ProjectXX 应保持不变。

---

# 8. 依赖不是所有权

如果：

```text
HitoriMJ -> VPN Manager
```

并不表示 VPN Manager 是 HitoriMJ 的子项目。

它表示：

> HitoriMJ 使用 VPN Manager 提供的能力。

VPN Manager 可以同时服务：

```text
HitoriMJ
CyberEternity
PVZPlayer
Linux machine
personal devices
```

这样可以避免重复建设。

---

# 9. 一个项目可以有子模块，但不要滥用 ProjectXX

例如 HitoriMJ 内部：

```text
simulation
training
evaluation
league
web UI
reporting
```

这些默认都是 HitoriMJ 的模块，不需要：

```text
Project31-HitoriTraining
Project32-HitoriUI
Project33-HitoriEvaluation
```

除非某个模块真的演变成独立、可复用、有自己生命周期的系统。

---

# 10. Secrets 与跨项目配置

跨项目共享能力时，**不要通过复制 secrets 实现**。

错误：

```text
HitoriMJ/
  vpn-private-key.conf

PVZPlayer/
  vpn-private-key.conf
```

推荐：

```text
Project12-VPS-VPN-Manager/
  管理 peer / config 生成 / revoke

HitoriMJ/
  只记录：
  "remote access provided by Project12"
```

private key、token、密码等应该留在：

- 本机安全存储；
- secrets manager；
- private server；
- GitHub Actions Secrets；
- 明确不会进入 public repo 的位置。

---

# 11. AI 接手项目时如何处理跨项目关系

AI 开始工作前：

1. 阅读当前项目的 `PROJECT.md`。
2. 找到 `Related Projects`。
3. 判断本次任务是否涉及这些依赖。
4. 如果只是使用依赖，不要随便修改依赖项目。
5. 如果问题来自依赖项目，应明确指出：
   ```text
   Root cause appears to belong to Project12-VPS-VPN-Manager.
   ```
6. 需要跨 repo 修改时，把修改拆开并分别验证。

---

# 12. 推荐的思维方式

不要把 Project01–Project100 理解成一百个孤岛。

更接近：

```text
                    ProjectHELLO
                         |
        +----------------+----------------+
        |                |                |
     HitoriMJ       CyberEternity     PVZPlayer
        |                |                |
        +-------> VPN Manager <-----------+
        |
        +-------> Linux Lab
        |
        +-------> Shared Evaluation Tools
```

ProjectHELLO 保存这张“项目图”。

每个正式项目只负责自己的代码与状态。

---

# 13. 最核心的三条

如果以后规则很多，只记住：

1. **ProjectXX 是稳定身份。**
2. **代码属于负责它的项目，不要跨项目复制。**
3. **项目之间通过明确的 Related Projects / dependency links 连接。**
