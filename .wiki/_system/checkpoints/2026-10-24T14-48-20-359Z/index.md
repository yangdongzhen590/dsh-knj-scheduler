# Wiki Index

> 由 dsh-knj-obsidian 维护。概念页 / 实体页 / 参考 / 综合 / 项目知识。

## 概念页

- [[croner-protect-与非重入触发]] croner 的 protect 与非重入触发 — 调度层用 croner protect:true 试图丢弃同任务重叠触发，执行层与手动立即执行均绕过它；protect 是否生效待运行时验证。
- [[dsh-会话创建-agentpreset-与模型选择]] DSH 会话创建：agentPreset 与模型选择 — 定时会话要像 GUI 会话一样有工具，必须 resolve preset → 写 meta.agentPreset → setup 里 mount；顶层 agentPreset 参数被宿主静默忽略。另含模型选择、消息 source、cwd 工作区三个坑及 2026-10-24 实测证据。
- [[tasks-json-原子写入与加载白名单]] tasks.json 原子写入与加载白名单 — tmp+rename 同步原子写、Windows EPERM 退避重试与原地覆盖兜底；加载端 isTaskDef 白名单会静默丢弃无标题工作流任务。

## 实体页


## 字典


## 数据结构


## 参考资料


## 综合


## 项目知识

- [[capability-任务定义与持久化]] 任务定义与持久化 — 调度器任务的 TaskDef 契约、validateTask 校验链与 TaskStore 的原子持久化；含创建/编辑/删除路由到 tasks.json 的完整链路。
- [[capability-到点执行与提示词会话]] 到点执行与提示词会话 — cron 触发与立即执行两条入口如何进入 executeTask、如何创建带 preset 与模型选择的 DSH 会话，以及历史 running→终态的回填时机。
- [[capability-执行历史与状态流转]] 执行历史与状态流转 — history.jsonl 的 running→终态回填、全局 500 条裁剪、两个只读接口的硬上限，以及 skipped 状态不可达与 running 行不会自愈。
- [[capability-触发计划与下次执行]] 触发计划与下次执行 — 三种触发类型如何编译成 croner pattern、预览路由怎么算 nextRun、时区在哪里生效，以及预览与实际调度的时区差异。
- [[capability-边栏面板与表单]] 边栏面板与表单 — 侧栏 slot 入口、面板四视图与表单状态、保存按钮的真实校验口径，以及会话导航的降级路径与两处口径不一致。
- [[capability-附件与工作流联动]] 附件与工作流联动 — KNJ 工作流任务的启动链路，以及文件交给流程的两条通道：调度器持久化附件快照（每次重新 stage）与触发时才读的路径入参。
