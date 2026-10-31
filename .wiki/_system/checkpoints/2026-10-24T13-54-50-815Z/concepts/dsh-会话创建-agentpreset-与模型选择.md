---
id: dsh-会话创建-agentpreset-与模型选择
title: DSH 会话创建：agentPreset 与模型选择
category: concepts
tags: [pitfall]
summary: agents.create 不装 preset 也不装模型选择；缺 preset 无标准工具、缺 selection 则 {{model}} 组装抛错，消息 source 还决定会话标题。
tier: supporting
source: capability-mining:support-session-create
confidence: inferred
created: 2026-10-24T13:47:47.583Z
updated: 2026-10-24T13:52:28.151Z
---

## 一句话

到点新建会话有四道容易踩的坑：没传 `agentPreset` 的会话没有标准工具；有 preset 也不会自动装模型选择（`{{model}}` 会炸）；消息 source 决定会话标题；带 cwd 的会话还要显式挂进工作区。仓库里三条回归测试就是这四件事的证据。

## 坑 1：没有 agentPreset 的会话没有标准工具

`agents.create` 只组合传入的 preset。没有 preset 时，新会话只有全局注册的插件工具——没有 `skill`，没有文件/命令工具，任务提示词根本触达不到（`test/scheduled-session.test.mjs:3-13` 的注释描述宿主事实，断言在 `test/scheduled-session.test.mjs:26-36`）。

解法是 `defaultAgentPreset(ctx)` 从宿主 `agentPresets` 注册表取默认值（`src/executor.ts:101-113`），三级回退：

1. `registry.defaultId`（公开 getter，`src/executor.ts:104-106`）；
2. `config.selectedDefault`——它是 `z.string().volatile()` 引用，**必须 `.get()` 解包**（`src/executor.ts:107-110`）；
3. `config.default`（`src/executor.ts:111-112`）。

解析出的 id 按条件传给 `agents.create({ agentPreset })`（`src/executor.ts:184`）。

## 坑 2：即使有 preset 也不会自动装模型选择

`agents.create` 不装模型选择，标准 preset 只贡献 persona/tools/packaging。没有选择时系统提示词的 `{{model}}` 没有值，prompt 组装的 waterfall 直接抛错（`test/executor-model-selection.test.mjs:1-15` 注释，断言在 `test/executor-model-selection.test.mjs:31-49`）。

解法：读 `agentDefaultModel.currentSelection()`（`src/executor.ts:175`），存在时传 `setup`，在 agentCtx 上 `installModelSelection(agentCtx, ...)`（`src/executor.ts:185-189`）。

关键约束：**install 不能以「有 preset」为条件**——那正是旧 bug（`test/executor-model-selection.test.mjs:34-38` 断言 `agentPreset === undefined && defaultModel` 这种写法必须消失）。

## 坑 3：消息 source 决定会话标题

prompt 用 `createMessage({ role: 'user', source: { kind: 'user' } })` 投递（`src/executor.ts:191-200`），再 `agent.followup(message)` 唤醒 driver（`src/executor.ts:200`）。原因是会话标题只从「人类消息」生成；用注入类 source（旧写法是已下线的 `schedule` kind）会让会话一直是「未命名」，面板里也看不到用户气泡（`test/scheduled-session.test.mjs:38-48`）。

## 坑 4：带 cwd 的会话要挂进工作区

低层 `agents.create` 不像高层 session.create 那样把新会话注册进宿主 workspace 注册表；任务配了 cwd 时会显示在「未分配」。所以 `attachToWorkspace` 从 `workspaceRegistry.resolveByPath(cwd)` 找到工作区再 `attachSession`（`src/executor.ts:230-240`），且整段吞错只打日志（`src/executor.ts:237-239`）——挂载失败不影响执行结果（`src/executor.ts:207-209` 的调用点也在 try/catch 之外，靠函数自身兜底）。

## 证据

- `test/scheduled-session.test.mjs:26-36` — 断言 executor 读 `agentPresets` 并把 `agentPreset` 传进 `agents.create`。
- `test/executor-model-selection.test.mjs:110-131` — 行为测试：带 preset 的运行仍必须传 `setup`，且 preset 是 id 而不是 volatile ref。
- `test/executor-model-selection.test.mjs:133-144` — 老注册表（只有 volatile ref）也要解出 preset id。

## Sources

- `src/executor.ts:101-113`（`defaultAgentPreset` 三级回退）
- `src/executor.ts:167-190`（sessionId/agentPreset/defaultModel 与 `agents.create`）
- `src/executor.ts:191-200`（`createMessage` 的 user source 与 `followup`）
- `src/executor.ts:207-209`（带 cwd 时调 `attachToWorkspace`）
- `src/executor.ts:230-240`（`attachToWorkspace` 吞错）
- `test/scheduled-session.test.mjs:26-36`（`agentPresets` 与 `agentPreset` 断言）
- `test/executor-model-selection.test.mjs:31-49`（`installModelSelection` 不得依赖 preset）

## 相关功能页

- 功能页：[[capability-到点执行与提示词会话]] — 这四个坑的调用现场
