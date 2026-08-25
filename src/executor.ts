/**
 * TaskExecutor: on fire, create a brand-new DSH session + agent and inject
 * the task prompt as its first message (`agent.followup` wakes the driver).
 * The new session is published through the session store, so it appears in
 * the Web session list like any manually created conversation.
 */
import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import { createMessage } from '@deepseek-ai/dsh-llm'
import type { SessionId } from '@deepseek-ai/dsh-session'
import { installModelSelection } from '@deepseek-ai/dsh-agent'
import type { TaskDef } from './types.ts'

export interface ExecuteResult {
  status: 'created' | 'failed'
  sessionId?: string
  ms: number
  error?: string
}

/** The default model selection the deployment provides for model-less agents. */
interface DefaultModelSelection {
  provider: string
  model: string
  reasoningEffort?: any
}

/** Structural subset of the host `agents` service we use (see dsh-agent). */
export interface AgentsServiceLike {
  create(options: { sessionId: SessionId; meta?: { cwd: string }; setup?: (agentCtx: Context) => void }): Promise<{ agent: { id: SessionId; followup(message: unknown): void } }>
}

export async function executeTask(ctx: Context, task: TaskDef): Promise<ExecuteResult> {
  const started = Date.now()
  let agents: AgentsServiceLike | undefined
  try {
    agents = ctx.get('agents') as AgentsServiceLike | undefined
    if (agents === undefined || typeof agents.create !== 'function') {
      return {
        status: 'failed',
        ms: Date.now() - started,
        error: '宿主 agents 服务不可用（dsh-agent 未组合） / agents service unavailable',
      }
    }
    const sessionId = randomUUID() as SessionId
    // The low-level `agents.create` path does not install a model selection, so
    // the system prompt's `{{model}}` variable would be undefined and assembly
    // would fail. Install the deployment default model selection explicitly.
    const defaultModel = (ctx.get('agentDefaultModel') as { currentSelection?: () => DefaultModelSelection } | undefined)?.currentSelection?.()
    const { agent } = await agents.create({
      sessionId,
      // The session's working directory feeds the system prompt's `{{cwd}}`
      // variable. Use the task's chosen workspace when set (so the session
      // lands in that workspace and stays openable from the panel), else the
      // host process cwd (the same default the ApiProxy uses for cwd-less
      // session creation).
      meta: { cwd: task.cwd ?? process.cwd() },
      ...(defaultModel ? {
        setup: (agentCtx: Context): void => {
          installModelSelection(agentCtx, { current: defaultModel, assembled: undefined })
        },
      } : {}),
    })
    const message = createMessage({
      role: 'user',
      content: [{ type: 'text', text: task.prompt }],
      source: { kind: 'plugin', plugin: 'dsh-scheduler' },
    })
    agent.followup(message)
    const sessionIdOut = String(agent.id)
    // The low-level agents.create path does not register the new session with
    // the host workspace registry (the high-level session.create flow does),
    // so a session with a task-configured cwd would otherwise show under
    // "unassigned" in the session tree. Attach it explicitly — best-effort,
    // a registration hiccup must never fail the execution itself.
    if (task.cwd !== undefined) {
      await attachToWorkspace(ctx, task.cwd, sessionIdOut)
    }
    return { status: 'created', sessionId: sessionIdOut, ms: Date.now() - started }
  } catch (error) {
    return {
      status: 'failed',
      ms: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/** Structural subset of the host workspace registry (see dsh-workspace). */
interface WorkspaceRegistryLike {
  resolveByPath?(path: string): Promise<{ attachSession(sessionId: string): Promise<void> } | undefined> | { attachSession(sessionId: string): Promise<void> } | undefined
}

/**
 * Register a freshly created session with the workspace whose path matches
 * `cwd`, so the session tree groups it under that workspace. Never throws:
 * failures are logged and the execution result is unaffected.
 */
async function attachToWorkspace(ctx: Context, cwd: string, sessionId: string): Promise<void> {
  try {
    const registry = ctx.get('workspaceRegistry') as WorkspaceRegistryLike | undefined
    if (registry === undefined || typeof registry.resolveByPath !== 'function') return
    const workspace = await registry.resolveByPath(cwd)
    if (workspace === undefined) return
    await workspace.attachSession(sessionId)
  } catch (error) {
    console.error('[dsh-scheduler] 会话挂载到工作区失败（不影响执行）:', error)
  }
}
