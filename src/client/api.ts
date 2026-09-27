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
/** One declared task input of a workflow (the workflow plugin owns this declaration). */
export interface WorkflowInputDecl { name: string; label: string; required: boolean; type: 'text' | 'file' }
export interface WorkflowChoice { id: string; name: string; revision?: number; inputs?: WorkflowInputDecl[] }

/**
 * One attachment stored by the scheduler (persisted under `<dataDir>/attachments/<uploadId>/`).
 * Unlike the declared file inputs (`workflowPathInputs`) these are **snapshots**: the stored
 * bytes are what every fire receives, so they work for files outside the workspace.
 */
export interface WorkflowAttachmentRef { uploadId: string; name: string; size?: number }

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
  workflowPathInputs?: Record<string, string>
  workflowAttachments?: WorkflowAttachmentRef[]
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
  /** Optional: the workflow plugin derives the task title from the description when absent. */
  workflowTitle?: string
  workflowDescription?: string
  workflowStoryCode?: string
  workflowPathInputs?: Record<string, string>
  workflowAttachments?: WorkflowAttachmentRef[]
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

/**
 * Upload one attachment into the scheduler's persistent store (not the workflow plugin's
 * 24h staging area): a scheduled task fires repeatedly and needs the bytes to survive.
 * Returns the stored reference to put on the task input.
 */
export function uploadAttachment(name: string, dataBase64: string): Promise<WorkflowAttachmentRef> {
  return api('/dsh-scheduler/attachments', { method: 'POST', body: JSON.stringify({ name, dataBase64 }) })
}

export function toggleTask(id: string, enabled: boolean): Promise<{ ok: boolean; task: TaskView }> {
  return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/toggle`, { method: 'POST', body: JSON.stringify({ enabled }) })
}

export function runTask(id: string): Promise<{ ok: boolean; result: { status: string; sessionId?: string; workflowTaskId?: string; error?: string } }> {
  return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/run`, { method: 'POST' })
}

export function taskHistory(id: string): Promise<{ history: HistoryEntry[] }> {
  return api(`/dsh-scheduler/tasks/${encodeURIComponent(id)}/history`)}

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
