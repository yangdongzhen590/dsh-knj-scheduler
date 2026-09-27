# dsh-knj-scheduler

定时任务调度器插件：按 Cron 自动启动**提示词会话**或（可选）**KNJ 工作流任务**。
Scheduled tasks for DeepSeek Harness — start a prompt session or, optionally, a KNJ workflow task on a cron schedule.

- 入口：左侧栏底部「更多 → 调度器」（菜单入口由 dsh-knj-menu 提供，已声明为 npm 依赖，安装命令见下）
- 面板：**任务列表 / 执行记录**双页签，各自带刷新按钮
- 任务列表与执行记录均**分页显示**（每页 10/25/50/100 条），分页条固定在面板底部
- 触发方式：Cron 表达式 / 指定时间（一次性，触发后自动停用）/ 间隔分钟数；表单实时预览下次执行时间
- 任务可配置**工作目录**：提示词会话可指定工作区；工作流任务必须指定工作目录
- 可选集成 `dsh-knj-workflow`：选择已保存的工作流后，到点按**当时最新定义**创建并启动流程任务
- **工作流的「文件」入参支持按路径引用**：工作流里声明了文件类型入参时，表单会为每个这样的参数渲染一个**路径输入框**（必填项标 `*`）。路径在**每次触发时读取**（不做快照）：相对路径由工作流插件按任务工作目录解析成绝对路径，文件不存在会导致**本次启动失败**并记录可操作错误（历史里可见）。值随任务定义持久化，切换回「提示词会话」时自动清除
- 执行历史仅记录工作流「已成功启动」或启动失败；详细阶段/最终状态在「流程运行」中查看，并可点「查看流程任务」直达
- 执行状态流转：执行中 → 成功 / 失败 / 跳过（上一次未结束自动跳过，防重入），记录耗时
- 任务定义持久化于 profile 目录，重启自动恢复；执行历史保留上限 500 条

## 安装

```sh
dsh plugin --profile web add dsh-scheduler dsh-knj-menu
```

> npm 包 [`dsh-scheduler`](https://www.npmjs.com/package/dsh-scheduler)，源码仓库 [dsh-knj-scheduler](https://github.com/yangdongzhen590/dsh-knj-scheduler)。
> 侧边栏入口由 [dsh-knj-menu](https://github.com/yangdongzhen590/dsh-knj-menu) 提供，上面一条命令同时安装两者（已作为 npm 依赖声明，版本自动配套）。

## 使用

1. 左侧栏「更多 → 调度器」打开面板
2. 「新建任务」：选择「提示词会话」并填写提示词；或选择「KNJ 工作流」、工作流、流程任务标题、必填工作目录、可选的用户故事编码，以及所选工作流声明的**文件入参路径**（有声明时才出现；相对路径按工作目录解析，触发时读取）
3. 保存后按计划调度；提示词模式创建会话，工作流模式通过已安装的 `dsh-knj-workflow` 启动流程任务
4. 工作流每次触发均解析最新已保存的定义；调度器不会等待或镜像流程最终状态
5. 任务行可：编辑 / 启停 / 立即执行 / 查看单任务历史 / 删除
6. 「执行记录」中，提示词任务可点「打开会话」；工作流任务可点「查看流程任务」直达流程运行详情

## 配置（可选）

在 `cordis.yml` 的插件行中可覆盖：

```yaml
- id: dsh-scheduler
  config:
    dataDir: /path/to/custom/data   # 默认 $DSH_HOME/profiles/<profile>/dsh-scheduler
    historyRetention: 500           # 执行历史保留条数
    timezone: Asia/Shanghai         # Cron 时区（默认系统本地时区）
```

## 数据位置

- 任务定义：`$DSH_HOME/profiles/<profile>/dsh-scheduler/tasks.json`
- 执行历史：`$DSH_HOME/profiles/<profile>/dsh-scheduler/history.jsonl`

## 安全

- 写操作仅接受同源 POST/PUT/DELETE（Origin 与 Host 校验）
- 任务定义写前校验（提示词模式需提示词；工作流模式需工作流、标题和工作目录；文件入参必须是「参数名 → 非空字符串」的对象，且只适用于工作流任务；Cron 可解析），原子写入（写坏保留旧文件）
- 文件入参只校验形状，**不校验路径是否存在**（该文件可能稍后才由别的流程产出）；存在性由 `dsh-knj-workflow` 在启动前校验，缺文件时本次启动失败
- 执行历史不记录提示词原文与会话内容，仅记录状态/耗时/会话 id 或工作流任务 id
- 任务执行真实消耗模型额度，且每个任务默认不并发执行（防重入）

## License

MIT
