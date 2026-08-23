/**
 * TaskExecutor: on fire, create a brand-new DSH session + agent and inject
 * the task prompt as its first message (`agent.followup` wakes the driver).
 * The new session is published through the session store, so it appears in
 * the Web session list like any manually created conversation.
 */
import { randomUUID } from 'node:crypto';
import { createMessage } from '@deepseek-ai/dsh-llm';
import { installModelSelection } from '@deepseek-ai/dsh-agent';
export async function executeTask(ctx, task) {
    const started = Date.now();
    let agents;
    try {
        agents = ctx.get('agents');
        if (agents === undefined || typeof agents.create !== 'function') {
            return {
                status: 'failed',
                ms: Date.now() - started,
                error: '宿主 agents 服务不可用（dsh-agent 未组合） / agents service unavailable',
            };
        }
        const sessionId = randomUUID();
        // The low-level `agents.create` path does not install a model selection, so
        // the system prompt's `{{model}}` variable would be undefined and assembly
        // would fail. Install the deployment default model selection explicitly.
        const defaultModel = ctx.get('agentDefaultModel')?.currentSelection?.();
        const { agent } = await agents.create({
            sessionId,
            // The session's working directory feeds the system prompt's `{{cwd}}`
            // variable. Use the task's chosen workspace when set (so the session
            // lands in that workspace and stays openable from the panel), else the
            // host process cwd (the same default the ApiProxy uses for cwd-less
            // session creation).
            meta: { cwd: task.cwd ?? process.cwd() },
            ...(defaultModel ? {
                setup: (agentCtx) => {
                    installModelSelection(agentCtx, { current: defaultModel, assembled: undefined });
                },
            } : {}),
        });
        const message = createMessage({
            role: 'user',
            content: [{ type: 'text', text: task.prompt }],
            source: { kind: 'plugin', plugin: 'dsh-scheduler' },
        });
        agent.followup(message);
        return { status: 'created', sessionId: String(agent.id), ms: Date.now() - started };
    }
    catch (error) {
        return {
            status: 'failed',
            ms: Date.now() - started,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
