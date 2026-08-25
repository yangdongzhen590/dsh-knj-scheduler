# dsh-knj-scheduler

定时任务调度器插件：按 Cron 自动**新建 DSH 会话**并注入提示词执行。
Scheduled tasks for DeepSeek Harness — create a new session with your prompt on a cron schedule.

- 入口：左侧栏底部「更多 → 调度器」（菜单入口由 dsh-knj-menu 提供，需一并安装）
- 面板：**任务列表 / 执行记录**双页签，各自带刷新按钮
- 任务列表与执行记录均**分页显示**（每页 10/25/50/100 条），分页条固定在面板底部
- 触发方式：Cron 表达式 / 指定时间（一次性，触发后自动停用）/ 间隔分钟数；表单实时预览下次执行时间
- 任务可配置**工作目录**：执行创建的会话落在指定工作区，执行记录可一键「打开会话」直达
- 执行状态流转：执行中 → 成功 / 失败 / 跳过（上一次未结束自动跳过，防重入），记录耗时
- 任务定义持久化于 profile 目录，重启自动恢复；执行历史保留上限 500 条

## 安装

```sh
dsh plugin --profile web add dsh-scheduler
```

> npm 包 [`dsh-scheduler`](https://www.npmjs.com/package/dsh-scheduler)，源码仓库 [dsh-knj-scheduler](https://github.com/yangdongzhen590/dsh-knj-scheduler)。
> 入口菜单由 [dsh-knj-menu](https://github.com/yangdongzhen590/dsh-knj-menu) 提供，未安装时请一并安装。

## 使用

1. 左侧栏「更多 → 调度器」打开面板
2. 「新建任务」：填写任务名称、工作目录（可选，默认宿主工作区）、触发方式、提示词
3. 保存后按计划调度；到点自动新建会话并把提示词作为首条消息注入
4. 任务行可：编辑 / 启停 / 立即执行 / 查看单任务历史 / 删除
5. 「执行记录」页签查看所有任务的执行历史，点「打开会话」跳到该次执行创建的会话

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
- 任务定义写前校验（名称/提示词非空、Cron 可解析），原子写入（写坏保留旧文件）
- 执行历史不记录提示词原文与会话内容，仅记录状态/耗时/会话 id
- 任务执行真实消耗模型额度，且每个任务默认不并发执行（防重入）

## License

MIT
