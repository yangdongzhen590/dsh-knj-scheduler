---
id: tasks-json-原子写入与加载白名单
title: tasks.json 原子写入与加载白名单
category: concepts
tags: [pitfall]
summary: tmp+rename 同步原子写、Windows EPERM 退避重试与原地覆盖兜底；加载端 isTaskDef 白名单会静默丢弃无标题工作流任务。
tier: supporting
source: capability-mining:support-tasks-json
confidence: inferred
created: 2026-10-24T13:47:47.504Z
updated: 2026-10-24T13:52:28.072Z
---

## 一句话

`tasks.json` 用「临时文件 + rename」同步原子写，Windows 上 rename 遇到 EPERM/EACCES/EBUSY 会退避重试、最终退回原地覆盖；加载端是一道白名单 `isTaskDef`，不合规的记录会被静默丢弃——这让「标题可留空」的几种口径出现分歧。

## 1. 写入路径 persist()

- 文件名常量 `TASKS_FILE = 'tasks.json'`、`HISTORY_FILE = 'history.jsonl'`（`src/store.ts:11-12`）。
- 文本形态：`JSON.stringify({ version: 1, tasks }, null, 2) + '\n'`（`src/store.ts:284-286`）。
- tmp 文件 = `${file}.tmp`（`src/store.ts:288`），先 `writeFileSync(tmp, text, 'utf8')`（`src/store.ts:289`），再 `renameSync(tmp, file)`（`src/store.ts:291`）。
- 重试退避表 `delaysMs = [10, 20, 40, 80, 160, 320]`（`src/store.ts:294`），循环上限 7 次尝试（`src/store.ts:295`）。
- 只重试瞬时错误码 `EPERM`/`EACCES`/`EBUSY`（`src/store.ts:300-301`）；`ENOENT` 视为「tmp 已被另一个写者拿走」直接返回（`src/store.ts:303`）。
- 最终兜底：原地 `writeFileSync(file)` + 删除 tmp（`src/store.ts:309-314`）——牺牲原子性换「保存不丢」。
- `sleepSync` 用 `Atomics.wait` 做同步 sleep（`src/store.ts:319-322`），因为 `persist` 必须同步、没有 `await` 可用（`src/store.ts:318` 注释）。

## 2. 加载路径 load()

- 文件不存在 → `tasks = []`（`src/store.ts:61-63`）。
- JSON 损坏 → 打印错误并保留内存状态，不让插件崩（`src/store.ts:72-76`）。
- 逐条过 `isTaskDef` 后再归一化缺省：`type` 不是 once/interval 的按 cron；`executionKind` 不是 knj-workflow 的按 prompt-session（`src/store.ts:67-71`）。

## 3. 白名单 `isTaskDef` 的口径分歧（静态推断）

`isTaskDef` 要求：`id`/`name`/`cron`/`createdAt`/`updatedAt` 是 string，`enabled` 是 boolean；执行类型为 `knj-workflow` 时**必须** `workflowId` 与 `workflowTitle` 同时是 string（`src/store.ts:324-338`，关键在 `src/store.ts:331-333`）。

但 `create()`/`update()` 在标题留空时**不写该字段**（`src/store.ts:106`、`src/store.ts:148`），`validateTaskInput` 也确实不再要求标题（`src/types.ts:156-165`），executor 还专门支持缺省标题（`src/executor.ts:147-148`）。

由此推断：一个通过 HTTP API 创建（绕过 UI 校验）的无标题工作流任务，在下次 `load()` 时会被 `filter` 静默丢弃（`src/store.ts:67`）。前端目前用 `executionValid` 强制标题非空（`src/client/SchedulerPanel.tsx:442-444`），所以该路径在 UI 下不可达；但「后端允许留空 / 加载端要求存在 / 前端强制非空」三种口径并存是真实存在的。

## 4. 历史文件不走同一套持久化

`history.jsonl` 是逐行 append（`src/store.ts:193-203`），读取时逐行 `JSON.parse`、坏行跳过（`src/store.ts:231-248`）；保留上限来自构造参数 `historyRetention = 500`（`src/store.ts:43-46`），由 `trimHistory` 在每次 append 后裁剪（`src/store.ts:270-281`）。它没有 tmp+rename，也不在 `tasks.json` 的白名单约束内。

## Sources

- `src/store.ts:11-12`（`TASKS_FILE` 与 `HISTORY_FILE`）
- `src/store.ts:284-291`（`persist` 的 tmp 写入与 rename）
- `src/store.ts:294-308`（`delaysMs` 退避与 `EPERM`/`EACCES`/`EBUSY` 判定）
- `src/store.ts:309-314`（兜底 `writeFileSync` + 清理 tmp）
- `src/store.ts:324-338`（`isTaskDef` 白名单）
- `src/store.ts:67-71`（load 的 `filter` 与缺省归一化）
- `src/types.ts:156-165`（`effectiveExecutionKind` 分支只校验 `workflowId` 与 `cwd`，不校验标题）
- `src/store.ts:193-203`（`appendHistory`）

## 相关功能页

- 功能页：[[capability-任务定义与持久化]] — tasks.json 的写入方
- 功能页：[[capability-执行历史与状态流转]] — history.jsonl 的另一套持久化
- 功能页：[[capability-附件与工作流联动]] — 附件目录的持久化边界
- 功能页：[[capability-边栏面板与表单]] — 表单标题口径与加载白名单冲突
