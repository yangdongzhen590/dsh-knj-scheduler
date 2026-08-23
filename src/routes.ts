/**
 * HTTP routes bridging the browser scheduler panel to the host. This layer
 * only parses requests, calls the store/scheduler/executor, and serializes
 * responses. Security: every mutating route accepts same-origin POST/PUT/
 * DELETE only and validates the body against a whitelist (see validateTask).
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { Cron } from 'croner'
import type { TaskStore } from './store.ts'
import { buildCronPattern } from './scheduler.ts'
import type { TaskScheduler } from './scheduler.ts'
import { executeTask } from './executor.ts'
import type { TaskDef, TaskInput } from './types.ts'
import { validateTask, validateTaskInput } from './types.ts'

export interface WebServerService {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (request: IncomingMessage, response: ServerResponse) => void | Promise<void>
  }): () => void
}

export interface SchedulerHost {
  webServer: WebServerService
}

const BASE = '/dsh-scheduler'
const MAX_BODY_BYTES = 64 * 1024

export function mountSchedulerRoutes(
  host: SchedulerHost,
  ctx: Context,
  store: TaskStore,
  scheduler: TaskScheduler,
): () => void {
  /** Fire a task through the executor and record the outcome. */
  const onFire = async (task: TaskDef): Promise<void> => {
    const id = store.appendHistory({ taskId: task.id, at: new Date().toISOString(), status: 'running' })
    const result = await executeTask(ctx, task)
    if (id !== null) {
      store.updateHistory(id, {
        status: result.status,
        sessionId: result.sessionId,
        ms: result.ms,
        error: result.error,
      })
    }
    // One-shot tasks auto-disable after firing.
    if (task.type === 'once') {
      store.setEnabled(task.id, false)
      scheduler.unschedule(task.id)
    }
  }

  /** Resync every task into the scheduler (idempotent; safe on boot). */
  const syncAll = (): void => {
    for (const task of store.list()) {
      if (task.enabled) scheduler.schedule(task, onFire)
      else scheduler.unschedule(task.id)
    }
  }

  const syncOne = (task: TaskDef): void => {
    scheduler.unschedule(task.id)
    if (task.enabled) scheduler.schedule(task, onFire)
  }

  syncAll()

  const handler = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    const path = url.pathname
    const method = request.method ?? 'GET'
    try {
      if (path === `${BASE}/preview` && method === 'GET') {
        const type = url.searchParams.get('type') ?? 'cron'
        const cron = url.searchParams.get('cron') ?? ''
        const runAt = url.searchParams.get('runAt') ?? ''
        const everyMinutes = url.searchParams.get('everyMinutes') ?? ''
        let nextRun: string | null = null
        let nextRuns: string[] = []
        try {
          const pattern = buildCronPattern({
            type: type === 'once' || type === 'interval' ? type : 'cron',
            cron,
            ...(type === 'once' ? { runAt } : {}),
            ...(type === 'interval' ? { everyMinutes: Number(everyMinutes) } : {}),
          })
          const job = new Cron(pattern, {})
          nextRun = job.nextRun()?.toISOString() ?? null
          nextRuns = job.nextRuns(5).map((d) => d.toISOString())
        } catch {
          nextRun = null
          nextRuns = []
        }
        sendJson(response, 200, { nextRun, nextRuns })
        return
      }

      if (path === `${BASE}/history` && method === 'GET') {
        sendJson(response, 200, { history: store.historyAll() })
        return
      }

      if (path === `${BASE}/tasks`) {
        if (method === 'GET') {
          const tasks = store.list().map((task) => ({
            ...task,
            nextRun: task.enabled ? (scheduler.nextRun(task.id)?.toISOString() ?? null) : null,
          }))
          sendJson(response, 200, { tasks })
          return
        }
        if (method === 'POST') {
          if (!sameOrigin(request)) return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' })
          const body = await readJsonBody(request)
          const result = validateTask(body as TaskInput)
          if (!result.ok) return sendJson(response, 400, { error: result.message })
          const task = store.create(body as TaskInput)
          if (!task) return sendJson(response, 400, { error: '创建失败 / create failed' })
          syncOne(task)
          sendJson(response, 200, { ok: true, task })
          return
        }
        sendJson(response, 405, { error: 'method not allowed' })
        return
      }

      const match = /^\/dsh-scheduler\/tasks\/([^/]+)$/.exec(path)
      const toggleMatch = /^\/dsh-scheduler\/tasks\/([^/]+)\/toggle$/.exec(path)
      const runMatch = /^\/dsh-scheduler\/tasks\/([^/]+)\/run$/.exec(path)
      const historyMatch = /^\/dsh-scheduler\/tasks\/([^/]+)\/history$/.exec(path)

      if (toggleMatch !== null && method === 'POST') {
        if (!sameOrigin(request)) return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' })
        const body = await readJsonBody(request)
        const enabled = (body as { enabled?: unknown })?.enabled === true
        const task = store.setEnabled(toggleMatch[1] as string, enabled)
        if (!task) return sendJson(response, 404, { error: 'task not found / 任务不存在' })
        syncOne(task)
        sendJson(response, 200, { ok: true, task: withNextRun(task, scheduler) })
        return
      }

      if (runMatch !== null && method === 'POST') {
        if (!sameOrigin(request)) return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' })
        const task = store.get(runMatch[1] as string)
        if (!task) return sendJson(response, 404, { error: 'task not found / 任务不存在' })
        const id = store.appendHistory({ taskId: task.id, at: new Date().toISOString(), status: 'running' })
        const result = await executeTask(ctx, task)
        if (id !== null) {
          store.updateHistory(id, {
            status: result.status,
            sessionId: result.sessionId,
            ms: result.ms,
            error: result.error,
          })
        }
        sendJson(response, 200, { ok: true, result })
        return
      }

      if (historyMatch !== null && method === 'GET') {
        const task = store.get(historyMatch[1] as string)
        if (!task) return sendJson(response, 404, { error: 'task not found / 任务不存在' })
        const history = store.history(task.id)
        sendJson(response, 200, { history })
        return
      }

      if (match !== null) {
        if (method === 'PUT') {
          if (!sameOrigin(request)) return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' })
          const body = await readJsonBody(request)
          const result = validateTask(body as TaskInput)
          if (!result.ok) return sendJson(response, 400, { error: result.message })
          const task = store.update(match[1] as string, body as TaskInput)
          if (!task) return sendJson(response, 404, { error: 'task not found / 任务不存在' })
          syncOne(task)
          sendJson(response, 200, { ok: true, task: withNextRun(task, scheduler) })
          return
        }
        if (method === 'DELETE') {
          if (!sameOrigin(request)) return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' })
          const removed = store.remove(match[1] as string)
          if (!removed) return sendJson(response, 404, { error: 'task not found / 任务不存在' })
          scheduler.unschedule(match[1] as string)
          sendJson(response, 200, { ok: true })
          return
        }
        sendJson(response, 405, { error: 'method not allowed' })
        return
      }

      sendJson(response, 404, { error: 'not found' })
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const disposer = host.webServer.register({
    kind: 'prefix',
    path: BASE,
    handler,
  })

  return () => {
    disposer()
    scheduler.clear()
  }
}

function withNextRun(task: TaskDef, scheduler: TaskScheduler): TaskDef & { nextRun: string | null } {
  return {
    ...task,
    nextRun: task.enabled ? (scheduler.nextRun(task.id)?.toISOString() ?? null) : null,
  }
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(payload))
}

/** Reject cross-origin writes; a missing Origin (curl, same-origin navigation) passes. */
function sameOrigin(request: IncomingMessage): boolean {
  const origin = request.headers.origin
  if (origin === undefined) return true
  const host = request.headers.host
  if (host === undefined) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of request) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buf.length
    if (total > MAX_BODY_BYTES) {
      const error = new Error('request body too large / 请求体过大')
      ;(error as Error & { code?: string }).code = 'PAYLOAD_TOO_LARGE'
      throw error
    }
    chunks.push(buf)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (raw === '') return {}
  try {
    return JSON.parse(raw)
  } catch {
    const error = new Error('invalid JSON body / JSON 解析失败')
    ;(error as Error & { code?: string }).code = 'BAD_JSON'
    throw error
  }
}
