/**
 * Thin fetch wrapper for the plugin's own routes.
 */

export interface ApiError {
  error?: string
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...init,
  })
  const body = (await response.json().catch(() => null)) as (T & ApiError) | null
  if (!response.ok) {
    throw new Error(body?.error ?? `HTTP ${response.status}`)
  }
  return body as T
}

export type TaskType = 'cron' | 'once' | 'interval'
export type ExecutionKind = 'prompt-session' | 'knj-workflow'
export interface WorkflowChoice { id: string; name: string; revision?: number }

export interface TaskView {
  id: string
  name: string
  enabled: boolean
  type: TaskType
  cron: string
  runAt?: string
  everyMinutes?: number
  cwd?: string
  executionKind: ExecutionKind
  prompt?: string
  workflowId?: string
  workflowTitle?: string
  workflowDescription?: string
  workflowStoryCode?: string
  createdAt: string
  updatedAt: string
  nextRun: string | null
}

export interface TaskInput {
  name: string
  type?: TaskType
  cron?: string
  runAt?: string
  everyMinutes?: number
  cwd?: string
  executionKind?: ExecutionKind
  prompt?: string
  workflowId?: string
  workflowTitle?: string
  workflowDescription?: string
  workflowStoryCode?: string
  enabled?: boolean
}

export interface HistoryEntry {
  id?: string
  taskId: string
  at: string
  status: 'running' | 'created' | 'failed' | 'skipped'
  sessionId?: string
  workflowTaskId?: string
  ms?: number
  error?: string
}

export function listTasks(): Promise<{ tasks: TaskView[] }> {
  return api('/dsh-scheduler/tasks')
}

export function listWorkflows(): Promise<{ workflows: WorkflowChoice[] }> {
  return api('/dsh-scheduler/workflows')
}

export function createTask(input: TaskInput): Promise<{ ok: boolean; task: TaskView }> {
  return api('/dsh-scheduler/tasks', { method: 'POST', body: JSON.stringify(input) })
}

export function updateTask(id: string, input: TaskInput): Promise<{ ok: boolean; task: TaskView }> {
  return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deleteTask(id: string): Promise<{ ok: boolean }> {
  return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function toggleTask(id: string, enabled: boolean): Promise<{ ok: boolean; task: TaskView }> {
  return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/toggle`, { method: 'POST', body: JSON.stringify({ enabled }) })
}

export function runTask(id: string): Promise<{ ok: boolean; result: { status: string; sessionId?: string; workflowTaskId?: string; error?: string } }> {
  return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/run`, { method: 'POST' })
}

export function taskHistory(id: string): Promise<{ history: HistoryEntry[] }> {
  return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/history`)
}

/** List recent executions across ALL tasks. */
export function listHistory(): Promise<{ history: HistoryEntry[] }> {
  return api('/dsh-scheduler/history')
}

/** Compute the next run time for a draft (unsaved) schedule. */
export function previewSchedule(params: { type: string; cron?: string; runAt?: string; everyMinutes?: number }): Promise<{ nextRun: string | null; nextRuns: string[] }> {
  const q = new URLSearchParams()
  q.set('type', params.type)
  if (params.cron) q.set('cron', params.cron)
  if (params.runAt) q.set('runAt', params.runAt)
  if (params.everyMinutes !== undefined) q.set('everyMinutes', String(params.everyMinutes))
  return api(`/dsh-scheduler/preview?${q.toString()}`)
}
