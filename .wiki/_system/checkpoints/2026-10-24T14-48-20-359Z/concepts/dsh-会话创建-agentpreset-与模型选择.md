---
id: dsh-会话创建-agentpreset-与模型选择
title: DSH 会话创建：agentPreset 与模型选择
category: concepts
tags: [pitfall]
summary: 定时会话要像 GUI 会话一样有工具，必须 resolve preset → 写 meta.agentPreset → setup 里 mount；顶层 agentPreset 参数被宿主静默忽略。另含模型选择、消息 source、cwd 工作区三个坑及 2026-10-24 实测证据。
tier: supporting
source: capability-mining:support-session-create
confidence: extracted
created: 2026-10-24T13:47:47.583Z
updated: 2026-10-24T14:48:01.752Z
---

## 一句话

定时任务新建会话要“长成真会话”，必须自己完成宿主 `composeAgent` 的三步：先 `agentPresets.resolve()` 拿 id，把 id 写进 `meta.agentPreset`，再在 `agents.create` 的 `setup` 里 `agentPresets.mount(agentCtx, id)`。只把 `agentPreset` 当顶层参数传进去是无效的——宿主会静默忽略，会话照样没有任何标准工具（也就没有 `skill`）。

## 结论速览（2026-10-24 复核，DSH 0.2.1-rc.2）

| 曾经的结论 | 核实结果 |
|---|---|
| 传 `agents.create({ agentPreset })` 就能让会话有标准工具 | **错误**。`CreateAgentOptions` 里没有顶层 `agentPreset`，`createAgent` 只读 `sessionId/seed/meta/inheritedEventCount/agentOptions/setup/signal/parentAgent`，多传的字段被静默丢弃 |
| 有 preset 也不会自动装模型选择 | 正确，仍然成立：preset 只贡献 persona/tools/packaging，`{{model}}` 需要 `installModelSelection` |
| 消息 source 决定标题 | 正确，仍成立 |
| 带 cwd 的会话要挂工作区 | 正确，仍成立 |

## 坑 1：preset 不是“传个参数”，而是 resolve + meta + mount

宿主自己的会话控制器 `composeAgent`（`dsh-api-session-controller/lib/index.js:351-363`）做三件事：

1. `const resolvedId = (await presets.resolve(presetId)).id` —— 必须在创建会话**之前**，因为 header 在 session 边界就把 `meta.agentPreset` 快照定型；
2. `meta: { ..., agentPreset: resolvedId }` —— 这是宿主唯一记录的 preset 通道；
3. `setup: async (agentCtx) => { installSelection(agentCtx); await presets.mount(agentCtx, resolvedId) }` —— preset 组合真正装进 agent 的隔离 realm。

全宿主只有 `api-session-controller` 调 `presets.mount`；`dsh-web-app/cordis.patch.yml:505-518` 又把宿主级 `skill-filesystem` / `tool-skill` 显式 disable，注释写明 *“tool-skill is what a preset mounts to give its agent the catalog and loader at all”*。所以**没挂 preset = 没有 skill 工具、没有 catalog、没有 read/write/pwsh**。

`src/executor.ts` 的正确写法（`presetService` 见 145-168、`resolvePresetId` 见 170-181、创建现场见 241-264）：

```ts
const presets = presetService(ctx)                                  // 缺 resolve/mount → failed
const presetId = await resolvePresetId(presets, defaultAgentPreset(ctx))
const { agent } = await agents.create({
  sessionId,
  meta: { cwd: task.cwd ?? process.cwd(), agentPreset: presetId },
  setup: async (agentCtx) => {
    if (defaultModel !== undefined) installModelSelection(agentCtx, { current: defaultModel, assembled: undefined })
    await presets.mount(agentCtx, presetId)
  },
})
```

两条失败语义是刻意的：解析不到（preset 被删/坏了）或 mount 抛错 → 整次执行 `status: 'failed'` 且错误点名 preset；不再静默创建一个“创建成功但什么工具都没有”的会话。

## 坑 2：即使有 preset 也不会自动装模型选择

`agents.create` 不装模型选择，preset 只贡献 persona/tools/packaging。没有选择时系统提示词的 `{{model}}` 没有值，prompt 组装直接抛错（历史的 6fe8637b 会话就是这样：`prompt variable "{{model}}" has no value for this assembly (section "deployment:persona-prefix")`）。

解法：读 `agentDefaultModel.currentSelection()`（`src/executor.ts:249`），存在时在同一个 `setup` 里 `installModelSelection(agentCtx, ...)`（`src/executor.ts:259-262`）。

关键约束：**install 不能以“有 preset”为条件**——preset 与模型选择是两件事，`test/executor-model-selection.test.mjs` 有专门回归。

## 坑 3：消息 source 决定会话标题

prompt 用 `createMessage({ role: 'user', source: { kind: 'user' } })` 投递（`src/executor.ts:266-275`），再 `agent.followup(message)` 唤醒 driver。会话标题只从“人类消息”生成；用注入类 source（旧写法是已下线的 `schedule` producer kind）会让会话一直是「未命名」，面板里也看不到用户气泡。

## 坑 4：带 cwd 的会话要挂进工作区

低层 `agents.create` 不像高层 session.create 那样注册进宿主 workspace 注册表；任务配了 cwd 时会显示在「未分配」。`attachToWorkspace` 从 `workspaceRegistry.resolveByPath(cwd)` 找到工作区再 `attachSession`（`src/executor.ts:307-323`），整段吞错只打日志——挂载失败不影响执行结果。

## 实测证据（2026-10-24）

修复前的构建（顶层 `agentPreset` 方案）在本机 DSH 0.2.1-rc.2 上跑探针任务，结果：

- 探针会话 `79d66ff4-3c31-4e76-8a9c-afa1041b9715`：session header 没有 `agentPreset`（projection 为 `null`）；模型可用工具只有宿主平面插件工具（`list_agents`、`working_directory`、`wiki_*`、`pilot_*`、`team_*`、`doublecheck_*`）；模型自述 `skill: MISSING / read: MISSING / pwsh: MISSING / todo_write: MISSING`。
- `history.jsonl` 中调度器创建的会话（`010e8796`、`170ef1b6`、`372b7611`、`87257401`、`c132153d`、`6fe8637b`）header 全部 `preset: null`；其中 `372b7611` 只调到 `list_agents` / `working_directory`。
- 对照：GUI 创建的会话 header 是 `preset: standard`，`skill` 工具调用正常。

修复后由 `test/executor-preset-mount.test.mjs` 守护：`resolve`/`meta.agentPreset`/`setup` 内 `mount` 的行为断言，加上解析失败、缺 preset 服务、mount 失败三种失败语义。

## 对照组：工作流任务是正确的

`dsh-knj-workflow` 早就按宿主同构写法挂 preset（`dsh-knj-workflow/lib/index.js:1115-1145`：`resolve` → `meta.agentPreset` → `setup` 里 `mount`），注释也点名了同一个坑。所以「KNJ 工作流」类型的定时任务会话 header 是 `preset: standard`，`skill` 与标准工具齐全；缺工具的只有「提示词会话」通道——修复前的那条。

## 证据

- `src/executor.ts:145-168` — `presetService`：缺 resolve/mount 直接给可操作错误
- `src/executor.ts:170-181` — `resolvePresetId`：创建前解析，失败点名 preset
- `src/executor.ts:241-264` — `meta.agentPreset` + `setup`（模型选择 → mount）
- `test/executor-preset-mount.test.mjs:117-209` — 六条行为回归（含三种失败语义）
- `test/scheduled-session.test.mjs` / `test/executor-model-selection.test.mjs` — 源码与构建产物守卫
- 宿主侧：`dsh-agent/lib/types/index.d.ts:48-104`（无顶层 agentPreset）、`dsh-agent-loop/lib/index.js:1893-1912`（createAgent 读取字段白名单）、`dsh-api-session-controller/lib/index.js:351-363`（composeAgent）、`dsh-web-app/cordis.patch.yml:505-518`（宿主级 skill 行被 disable）

## 相关功能页

- [[capability-到点执行与提示词会话]] — 这条调用链的完整功能视图

