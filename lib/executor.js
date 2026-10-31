/**
 * TaskExecutor: on fire, create a brand-new DSH session + agent and inject
 * the task prompt as its first message (`agent.followup` wakes the driver).
 * The new session is published through the session store, so it appears in
 * the Web session list like any manually created conversation.
 */
import { randomUUID } from 'node:crypto';
import { createMessage } from '@deepseek-ai/dsh-llm';
import { installModelSelection } from '@deepseek-ai/dsh-agent';
/**
 * The preset a GUI-created session would run.
 *
 * The registry owns that choice as `defaultId`; fall back to its config for
 * registries that predate the getter, unwrapping the volatile ref first.
 *
 * Resolving the id is not enough on its own: the host composes an agent's tool
 * plane only when that preset is mounted (see {@link resolvePresetId} and the
 * `setup` callback in {@link executeTask}).
 */
export function defaultAgentPreset(ctx) {
    const registry = ctx.get('agentPresets');
    if (registry === undefined)
        return undefined;
    if (typeof registry.defaultId === 'string' && registry.defaultId.trim() !== '') {
        return registry.defaultId;
    }
    const config = registry.config;
    const selected = config?.selectedDefault;
    const selectedId = typeof selected === 'string' ? selected : selected?.get();
    if (selectedId !== undefined && selectedId.trim() !== '')
        return selectedId;
    const fallback = config?.default;
    return fallback !== undefined && fallback.trim() !== '' ? fallback : undefined;
}
/**
 * The host preset roster, or an actionable error.
 *
 * Without this service a created session only sees host-plane plugin tools —
 * no `skill` tool, no skill catalog, no filesystem or shell tools — because the
 * host's web surface keeps those rows behind an agent preset. Producing such a
 * session on a schedule looks successful ("created") while every task prompt is
 * unable to act, so the run fails loudly instead.
 */
function presetService(ctx) {
    const registry = ctx.get('agentPresets');
    if (registry === undefined
        || typeof registry.resolve !== 'function'
        || typeof registry.mount !== 'function') {
        throw new Error('宿主未提供 agentPresets 的 resolve/mount，无法为定时会话挂载 agent preset'
            + '（需 dsh-agent-presets 0.1.x 或 dsh-agent-preset-registry 0.2.x）'
            + ' / host agentPresets service with resolve+mount is required to mount the agent preset');
    }
    return registry;
}
/**
 * Resolve the preset id BEFORE the session exists, the way the host's own
 * `composeAgent` does.
 *
 * The id is snapshotted into the session header (`meta.agentPreset`), so a
 * resolve performed later — inside `setup`, for instance — could never reach
 * the header. A broken or deleted deployment preset is reported with its name
 * rather than yielding a session that silently has no tools.
 */
async function resolvePresetId(presets, requested) {
    try {
        return (await presets.resolve(requested)).id;
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`定时任务无法解析 agent preset「${requested ?? '部署默认'}」`
            + ` / cannot resolve agent preset "${requested ?? 'deployment default'}": ${reason}`);
    }
}
export async function executeTask(ctx, task, attachments) {
    const started = Date.now();
    let agents;
    try {
        if (task.executionKind === 'knj-workflow') {
            const workflow = ctx.get('knjWorkflowScheduler');
            if (workflow === undefined || typeof workflow.createAndStartScheduledTask !== 'function') {
                return { status: 'failed', ms: Date.now() - started, error: 'dsh-knj-workflow scheduler service is unavailable' };
            }
            // 附件：调度器存的是持久化文件，workflow 插件的暂存是**一次性交接**，所以每次触发都要
            // 重新把文件放回它的暂存区换一份新的 uploadId；否则第二次触发会因暂存已清而拒绝启动。
            let fireAttachments;
            const refs = task.workflowAttachments ?? [];
            if (refs.length > 0) {
                if (attachments === undefined) {
                    return { status: 'failed', ms: Date.now() - started, error: '附件存储不可用 / attachment store unavailable' };
                }
                if (typeof workflow.stageAttachments !== 'function') {
                    return { status: 'failed', ms: Date.now() - started, error: 'dsh-knj-workflow 缺少 stageAttachments（请更新该插件后重启 dsh web）' };
                }
                const files = [];
                for (const ref of refs) {
                    const found = await attachments.resolve(ref.uploadId);
                    if (found === null) {
                        return { status: 'failed', ms: Date.now() - started, error: `附件已丢失：${ref.name}（${ref.uploadId}）。请重新在调度器里选择文件` };
                    }
                    files.push({ path: found.path, name: ref.name || found.name });
                }
                fireAttachments = await workflow.stageAttachments({ files });
            }
            const launch = await workflow.createAndStartScheduledTask({
                workflowId: task.workflowId,
                // 标题可缺省：留空时由 workflow 插件按描述派生（与「新建任务」表单同口径）
                ...(task.workflowTitle ? { title: task.workflowTitle } : {}),
                ...(task.workflowDescription ? { description: task.workflowDescription } : {}),
                storyCode: task.workflowStoryCode,
                cwd: task.cwd,
                // Path-typed file inputs: forwarded verbatim — the workflow plugin resolves relative
                // paths against the task's cwd and verifies the file exists before the run starts.
                ...(task.workflowPathInputs ? { pathInputs: task.workflowPathInputs } : {}),
                ...(fireAttachments ? { attachments: fireAttachments, attachmentsAreReusable: true } : {}),
            });
            return { status: 'created', workflowTaskId: launch.taskId, ms: Date.now() - started };
        }
        agents = ctx.get('agents');
        if (agents === undefined || typeof agents.create !== 'function') {
            return {
                status: 'failed',
                ms: Date.now() - started,
                error: '宿主 agents 服务不可用（dsh-agent 未组合） / agents service unavailable',
            };
        }
        const sessionId = randomUUID();
        // Mirror the host's own `composeAgent` (api-session-controller): the preset
        // id is resolved BEFORE the session exists because the header snapshots
        // `meta.agentPreset`, and the composition is mounted inside `setup`.
        // `agents.create` composes no preset on its own, and a top-level
        // `agentPreset` option is ignored by the host — without this the session
        // would only see host-plane plugin tools (no `skill` tool or catalog, no
        // filesystem/shell tools) while still reporting a successful "created".
        const presets = presetService(ctx);
        const presetId = await resolvePresetId(presets, defaultAgentPreset(ctx));
        // `agents.create` installs no model selection either, not even when it
        // composes an agent preset (presets only contribute persona, tools and
        // packaging). Without a selection the system prompt's `{{model}}` variable
        // has no value and prompt assembly throws.
        const defaultModel = ctx.get('agentDefaultModel')?.currentSelection?.();
        const { agent } = await agents.create({
            sessionId,
            // The session's working directory feeds the system prompt's `{{cwd}}`
            // variable. Use the task's chosen workspace when set (so the session
            // lands in that workspace and stays openable from the panel), else the
            // host process cwd (the same default the ApiProxy uses for cwd-less
            // session creation).
            meta: { cwd: task.cwd ?? process.cwd(), agentPreset: presetId },
            // Same order as the host controller: model selection, then the preset.
            // A mount failure rolls the whole creation back and surfaces as `failed`.
            setup: async (agentCtx) => {
                if (defaultModel !== undefined) {
                    installModelSelection(agentCtx, { current: defaultModel, assembled: undefined });
                }
                await presets.mount(agentCtx, presetId);
            },
        });
        const message = createMessage({
            role: 'user',
            content: [{ type: 'text', text: task.prompt }],
            // 这是用户自己写的提示词，按真实用户消息投递：宿主的会话标题只从「人类消息」
            // 生成，若用注入类 source（旧写法是宿主 schedule producer kind）投递，会话会
            // 一直是「未命名」，面板里也看不到用户气泡。会话格式 v4 只拒绝已下线的 plugin
            // 包装 kind，'user' 是 MessageSourceMap 里的原生人类来源。
            source: { kind: 'user' },
        });
        agent.followup(message);
        const sessionIdOut = String(agent.id);
        // The low-level agents.create path does not register the new session with
        // the host workspace registry (the high-level session.create flow does),
        // so a session with a task-configured cwd would otherwise show under
        // "unassigned" in the session tree. Attach it explicitly — best-effort,
        // a registration hiccup must never fail the execution itself.
        if (task.cwd !== undefined) {
            await attachToWorkspace(ctx, task.cwd, sessionIdOut);
        }
        return { status: 'created', sessionId: sessionIdOut, ms: Date.now() - started };
    }
    catch (error) {
        return {
            status: 'failed',
            ms: Date.now() - started,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
/**
 * Register a freshly created session with the workspace whose path matches
 * `cwd`, so the session tree groups it under that workspace. Never throws:
 * failures are logged and the execution result is unaffected.
 */
async function attachToWorkspace(ctx, cwd, sessionId) {
    try {
        const registry = ctx.get('workspaceRegistry');
        if (registry === undefined || typeof registry.resolveByPath !== 'function')
            return;
        const workspace = await registry.resolveByPath(cwd);
        if (workspace === undefined)
            return;
        await workspace.attachSession(sessionId);
    }
    catch (error) {
        console.error('[dsh-scheduler] 会话挂载到工作区失败（不影响执行）:', error);
    }
}
