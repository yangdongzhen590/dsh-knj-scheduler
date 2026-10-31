---
id: croner-protect-与非重入触发
title: croner 的 protect 与非重入触发
category: concepts
tags: [concept]
summary: 调度层用 croner protect:true 试图丢弃同任务重叠触发，执行层与手动立即执行均绕过它；protect 是否生效待运行时验证。
tier: supporting
source: capability-mining:support-croner-protect
confidence: inferred
created: 2026-10-24T13:47:47.438Z
updated: 2026-10-24T13:52:27.968Z
---

## 一句话

调度器的「非重入」只存在于调度层：`TaskScheduler` 把每个任务包成一个 croner `Cron`，用 `protect: true` 试图丢弃重叠触发；执行层（`executeTask`）没有锁，手动「立即执行」路由也绕过调度器。

## 1. 内核结构

`TaskScheduler` 的全部状态是一个 `Map<string, Cron>`（`src/scheduler.ts:21-22`）。`schedule()` 先 `unschedule(task.id)` 再建 job（`src/scheduler.ts:32-34`），因此对同一任务重复 schedule 是幂等替换，不会累积 job。

关键选项只有两个（`src/scheduler.ts:36-42`）：

| 选项 | 值 | 作用 |
|---|---|---|
| `protect` | `true` | 交给 croner 抑制同一 job 的重叠触发 |
| `timezone` | 来自插件 Config，缺省不传（= croner 用系统本地时区） | cron 表达式按该时区求值 |

`timezone` 的透传链：插件 Config 的 `timezone?`（`src/index.ts:20-21`）→ `new TaskScheduler(config?.timezone)`（`src/index.ts:39`）→ 构造参数（`src/scheduler.ts:24-29`）→ `new Cron(..., { timezone })`。

## 2. pattern 的唯一编译点

`buildCronPattern`（`src/scheduler.ts:15-19`）把三种 trigger 统一成 croner 可接受的 pattern：

| type | 编译结果 | 行 |
|---|---|---|
| `once` | `new Date(task.runAt)`（croner 接受 Date，只触发一次） | `src/scheduler.ts:16` |
| `interval` | 字符串 `` `*/${everyMinutes} * * * *` ``（分钟步进） | `src/scheduler.ts:17` |
| `cron` | `task.cron` 原样返回 | `src/scheduler.ts:18` |

两个可观察后果：

- 预览与实调度共用该函数，但预览只建临时 `new Cron(pattern, {})` 取 `nextRun()/nextRuns(5)`，不注册进 `jobs`（`src/routes.ts:89-97`）——预览不改变调度状态。
- `interval` 的上界不在校验里：`validateTask` 只要求 `everyMinutes` 是 ≥1 的正整数（`src/types.ts:209-213`），超过 59 就交给 croner 判非法；`schedule()` 把构造异常吞成 `return false`（`src/scheduler.ts:44-47`），而 `/tasks` 的 POST 不检查这个返回值（`src/routes.ts:146-149`）。所以「保存成功但任务永不触发」在静态路径上是存在的。

## 3. protect 的证据强度：待运行时验证

传给 croner 的回调是 `() => { onFire(task) }`（`src/scheduler.ts:39-41`），而 `onFire` 是 async 函数（`src/routes.ts:42`）。回调体用花括号且没有 `return`，async 结果（Promise）没有交回 croner。

若 croner 的 `protect` 依赖回调返回的 Promise 判断「上一轮是否仍在执行」，这层保护就会立即失效。本仓库的开发依赖树里没有安装 croner（`node_modules` 下无该包），无法离线核对实现，故此处标注为**待验证**（confidence: inferred，需运行时验证）。不要仅凭注释或 `protect: true` 断言「已防重入」。

## 4. 谁能绕过 protect

- **立即执行**：`POST /dsh-scheduler/tasks/:id/run` 直接 `executeTask(ctx, task, attachments)`，既不经 job，也不检查该任务是否在跑（`src/routes.ts:172-189`）。前端只在当前面板内用 `runningTaskId` 防连点（`src/client/SchedulerPanel.tsx:410-412`、`src/client/SchedulerPanel.tsx:521`），跨页面/跨客户端无效。
- **不同任务之间**没有任何互斥：每个任务是独立的 Cron 实例，`protect` 只对同一 job 生效。

## 5. 生命周期

- `unschedule`：`job.stop()` + 从 Map 删除（`src/scheduler.ts:50-56`）。
- `nextRun`：直接读 `job.nextRun()`（`src/scheduler.ts:58-60`）。
- `clear`：遍历停表（`src/scheduler.ts:63-66`），由路由 disposer 与插件 cleanup 调用（`src/routes.ts:245-248`、`src/index.ts:41-44`）。
- 开机同步：`syncAll()` 把 store 里 enabled 的任务逐条 schedule（`src/routes.ts:62-67`、`src/routes.ts:74`）。
- 一次性任务：触发后 `store.setEnabled(id, false)` + `scheduler.unschedule(id)`（`src/routes.ts:54-58`）；再次启用走 toggle 的 `syncOne`（`src/routes.ts:160-168`）。

## Sources

- `src/scheduler.ts:15-19`（`buildCronPattern` 三型编译）
- `src/scheduler.ts:21-22`（`jobs` Map）
- `src/scheduler.ts:32-42`（`schedule` 与 `protect: true`）
- `src/scheduler.ts:44-47`（`catch` 把构造异常吞成 false）
- `src/routes.ts:89-97`（preview 的临时 Cron 与 `nextRun`/`nextRuns`）
- `src/routes.ts:172-189`（`runMatch` 路由直调 `executeTask`）
- `src/index.ts:39`（`new TaskScheduler(config?.timezone)`）
- `src/types.ts:209-213`（`everyMinutes` 校验）

## 相关功能页

- 功能页：[[capability-任务定义与持久化]] — 任务触发字段与校验入口
- 功能页：[[capability-触发计划与下次执行]] — pattern 编译与预览
- 功能页：[[capability-到点执行与提示词会话]] — 触发回调与执行链路
