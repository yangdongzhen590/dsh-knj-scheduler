# dsh-scheduler

定时任务调度器插件：按 Cron 自动**新建 DSH 会话**并注入提示词执行。
Scheduled tasks for DeepSeek Harness — create a new session with your prompt on a cron schedule.

- 界面**右侧工具栏**新增「⏰ 调度器」竖条入口（贴右边缘、垂直居中，body portal 挂载）
- 任务 = Cron 表达式 + 提示词；到点自动新建会话并把提示词作为首条消息注入（`ctx.agents.create()` + `agent.followup()`）
- 新会话自动出现在 Web 会话列表，可随时点开查看执行过程与结果
- 任务定义持久化于 profile 目录，重启自动恢复；执行历史可查（保留上限 500 条/任务，列表分页显示）

## 安装

```sh
dsh plugin --profile web add dsh-scheduler
```

或手动安装（zip 补丁包方式）：将本包解压到
`$DSH_HOME/profiles/web/node_modules/dsh-scheduler/`，并在 profile 的
`cordis.patch.yml` 中追加：

```yaml
- insert:
    - id: dsh-scheduler
      name: 'dsh-scheduler'
```

刷新页面后，界面**右侧边缘**出现「⏰ 调度器」工具栏竖条。

> 要求：`dsh web` >= 0.1.0-rc.7（rc.8 已验证）。入口通过 body portal 挂载，
> 不依赖宿主 slot、不需要修改宿主文件。

## 使用

1. 点击右侧工具栏竖条「⏰ 调度器」
2. 「＋ 新建任务」：填写任务名称、Cron 表达式（如 `0 9 * * *`）、提示词
3. 保存后任务按 Cron 调度；到点自动新建会话并执行提示词
4. 任务行可：编辑 / 启停 / 立即执行 / 查看历史 / 删除

## 配置（可选）

在 `cordis.yml` 的插件行中可覆盖：

```yaml
- id: dsh-scheduler
  config:
    dataDir: /path/to/custom/data   # 默认 $DSH_HOME/profiles/<profile>/dsh-scheduler
    historyRetention: 500           # 每任务执行历史保留条数
```

## 数据位置

- 任务定义：`$DSH_HOME/profiles/<profile>/dsh-scheduler/tasks.json`
- 执行历史：`$DSH_HOME/profiles/<profile>/dsh-scheduler/history.jsonl`

## 卸载

```sh
dsh plugin --profile web remove dsh-scheduler
```

任务定义与历史文件**保留**在 profile 目录（手动删除即彻底清除）。

## 安全

- 写操作仅接受同源 POST/PUT/DELETE（Origin 与 Host 校验）
- 任务定义写前校验（名称/提示词非空、Cron 可解析），原子写入（写坏保留旧文件）
- 执行历史不记录提示词原文与会话内容，仅记录状态/耗时/会话 id
- 任务执行真实消耗模型额度，且每个任务默认不并发执行（防重入）

## License

MIT
