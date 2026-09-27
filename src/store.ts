/**
 * TaskStore: durable task definitions (tasks.json, atomic write) plus an
 * append-only execution history (history.jsonl) with a retention cap.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { TaskDef, TaskInput } from './types.ts'
import { validateTask, effectiveExecutionKind, effectiveType, normalizeWorkflowPathInputs } from './types.ts'
import { normalizeWorkflowAttachments } from './attachments.ts'

const TASKS_FILE = 'tasks.json'
const HISTORY_FILE = 'history.jsonl'

export type HistoryStatus = 'running' | 'created' | 'failed' | 'skipped'

export interface HistoryEntry {
  /** Stable unique id; present on entries appended after v0.1.11 (needed to flip running → final). */
  id?: string
  taskId: string
  at: string
  status: HistoryStatus
  sessionId?: string
  workflowTaskId?: string
  ms?: number
  error?: string
}

export interface StoreFile {
  version: 1
  tasks: TaskDef[]
}

export class TaskStore {
  private tasks: TaskDef[] = []

  /**
   * Called with attachment ids that no longer belong to any task (edit replaced them,
   * or the task was deleted) so their stored bytes can be reclaimed. Best-effort:
   * a reclaim failure must never fail the store operation itself.
   */
  onAttachmentDrop?: (uploadIds: string[]) => void

  constructor(
    private readonly dataDir: string,
    private readonly historyRetention = 500,
  ) {
    mkdirSync(dataDir, { recursive: true })
  }

  private tasksFile(): string {
    return join(this.dataDir, TASKS_FILE)
  }

  private historyFile(): string {
    return join(this.dataDir, HISTORY_FILE)
  }

  /** Load persisted tasks (idempotent; safe to call on every boot). */
  load(): void {
    try {
      if (!existsSync(this.tasksFile())) {
        this.tasks = []
        return
      }
      const parsed = JSON.parse(readFileSync(this.tasksFile(), 'utf8')) as Partial<StoreFile>
      const raw = Array.isArray(parsed.tasks) ? parsed.tasks : []
      this.tasks = raw.filter((t): t is TaskDef => isTaskDef(t)).map((t) => ({
        ...t,
        type: t.type === 'once' || t.type === 'interval' ? t.type : 'cron',
        executionKind: t.executionKind === 'knj-workflow' ? 'knj-workflow' : 'prompt-session',
      }))
    } catch (error) {
      // A corrupt file must never take the plugin down; keep the previous state.
      console.error('[dsh-scheduler] tasks.json 读取失败（保留内存状态）:', error)
      this.tasks = this.tasks ?? []
    }
  }

  list(): TaskDef[] {
    return [...this.tasks]
  }

  get(id: string): TaskDef | undefined {
    return this.tasks.find((t) => t.id === id)
  }

  /** Create a task; validation is the caller's job (see validateTask). */
  create(input: TaskInput, now = new Date().toISOString()): TaskDef | null {
    const result = validateTask(input)
    if (!result.ok) return null
    const type = effectiveType(input)
    const executionKind = effectiveExecutionKind(input)
    const task: TaskDef = {
      id: randomId(),
      name: input.name.trim(),
      enabled: input.enabled !== false,
      type,
      cron: type === 'cron' ? (input.cron ?? '').trim() : '',
      ...(type === 'once' ? { runAt: new Date(input.runAt as string).toISOString() } : {}),
      ...(type === 'interval' ? { everyMinutes: Number(input.everyMinutes) } : {}),
      ...(typeof input.cwd === 'string' && input.cwd.trim() !== '' ? { cwd: input.cwd.trim() } : {}),
      executionKind,
      ...(executionKind === 'prompt-session' ? { prompt: input.prompt!.trim() } : {
        workflowId: input.workflowId!.trim(),
        // 标题可缺省（由 workflow 插件按描述派生）；显式给了才存，保持老记录形状不变
        ...(typeof input.workflowTitle === 'string' && input.workflowTitle.trim() !== '' ? { workflowTitle: input.workflowTitle.trim() } : {}),
        ...(typeof input.workflowDescription === 'string' && input.workflowDescription.trim() !== '' ? { workflowDescription: input.workflowDescription.trim() } : {}),
        ...(typeof input.workflowStoryCode === 'string' && input.workflowStoryCode.trim() !== '' ? { workflowStoryCode: input.workflowStoryCode.trim() } : {}),
        ...(normalizeWorkflowPathInputs(input.workflowPathInputs) ? { workflowPathInputs: normalizeWorkflowPathInputs(input.workflowPathInputs)! } : {}),
        ...(normalizeWorkflowAttachments(input.workflowAttachments) ? { workflowAttachments: normalizeWorkflowAttachments(input.workflowAttachments)! } : {}),
      }),
      createdAt: now,
      updatedAt: now,
    }
    this.tasks.push(task)
    this.persist()
    return task
  }

  /** Update a task in place; validation is the caller's job. */
  update(id: string, input: TaskInput): TaskDef | null {
    const result = validateTask(input)
    if (!result.ok) return null
    const task = this.get(id)
    if (!task) return null
    const type = effectiveType(input)
    task.name = input.name.trim()
    task.type = type
    task.cron = type === 'cron' ? (input.cron ?? '').trim() : ''
    task.runAt = type === 'once' ? new Date(input.runAt as string).toISOString() : undefined
    task.everyMinutes = type === 'interval' ? Number(input.everyMinutes) : undefined
    task.cwd = typeof input.cwd === 'string' && input.cwd.trim() !== '' ? input.cwd.trim() : undefined
    task.executionKind = effectiveExecutionKind(input)
    const orphaned: string[] = []
    if (task.executionKind === 'prompt-session') {
      task.prompt = input.prompt!.trim()
      task.workflowId = undefined
      task.workflowTitle = undefined
      task.workflowDescription = undefined
      task.workflowStoryCode = undefined
      task.workflowPathInputs = undefined
      // 切到提示词任务：workflow 附件不再有任何意义，必须清掉并回收（漏了这步会留下孤儿文件）
      orphaned.push(...(task.workflowAttachments ?? []).map((a) => a.uploadId))
      task.workflowAttachments = undefined
    } else {
      task.prompt = undefined
      task.workflowId = input.workflowId!.trim()
      task.workflowTitle = typeof input.workflowTitle === 'string' && input.workflowTitle.trim() !== '' ? input.workflowTitle.trim() : undefined
      task.workflowDescription = typeof input.workflowDescription === 'string' && input.workflowDescription.trim() !== '' ? input.workflowDescription.trim() : undefined
      task.workflowStoryCode = typeof input.workflowStoryCode === 'string' && input.workflowStoryCode.trim() !== '' ? input.workflowStoryCode.trim() : undefined
      task.workflowPathInputs = normalizeWorkflowPathInputs(input.workflowPathInputs)
      const nextAttachments = normalizeWorkflowAttachments(input.workflowAttachments)
      // 被替换掉的附件要顺手回收存储，否则编辑一次就多留一份永不清理的文件
      orphaned.push(...(task.workflowAttachments ?? [])
        .map((a) => a.uploadId)
        .filter((id) => !(nextAttachments ?? []).some((a) => a.uploadId === id)))
      task.workflowAttachments = nextAttachments
    }
    if (orphaned.length > 0) this.onAttachmentDrop?.(orphaned)
    if (typeof input.enabled === 'boolean') task.enabled = input.enabled
    task.updatedAt = new Date().toISOString()
    this.persist()
    return { ...task }
  }

  remove(id: string): boolean {
    const before = this.tasks.length
    const removed = this.tasks.find((t) => t.id === id)
    this.tasks = this.tasks.filter((t) => t.id !== id)
    if (this.tasks.length === before) return false
    this.persist()
    // 删任务顺手回收它的附件（否则附件目录会永久积攒孤儿文件）
    const orphaned = (removed?.workflowAttachments ?? []).map((a) => a.uploadId)
    if (orphaned.length > 0) this.onAttachmentDrop?.(orphaned)
    return true
  }

  setEnabled(id: string, enabled: boolean): TaskDef | null {
    const task = this.get(id)
    if (!task) return null
    task.enabled = enabled
    task.updatedAt = new Date().toISOString()
    this.persist()
    return { ...task }
  }

  /**
   * Append one history entry and trim beyond the retention cap.
   * Returns the entry id (generated when absent) so the caller can later
   * flip a `running` entry into its final status via updateHistory.
   * Returns null when the write failed.
   */
  appendHistory(entry: HistoryEntry): string | null {
    const id = entry.id ?? randomId()
    try {
      writeFileSync(this.historyFile(), `${JSON.stringify({ ...entry, id })}\n`, { flag: 'a' })
      this.trimHistory()
      return id
    } catch (error) {
      console.error('[dsh-scheduler] 写入执行历史失败:', error)
      return null
    }
  }

  /** Flip an in-flight `running` entry to its final status (id from appendHistory). */
  updateHistory(id: string, patch: Partial<HistoryEntry>): void {
    try {
      const file = this.historyFile()
      if (!existsSync(file)) return
      const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean)
      let changed = false
      const updated = lines.map((line) => {
        try {
          const entry = JSON.parse(line) as HistoryEntry
          if (entry.id === id) {
            changed = true
            return JSON.stringify({ ...entry, ...patch, id })
          }
          return line
        } catch {
          return line
        }
      })
      if (!changed) return
      writeFileSync(file, `${updated.join('\n')}\n`)
    } catch (error) {
      console.error('[dsh-scheduler] 更新执行历史失败:', error)
    }
  }

  history(taskId: string, limit = 100): HistoryEntry[] {
    try {
      if (!existsSync(this.historyFile())) return []
      const lines = readFileSync(this.historyFile(), 'utf8').split('\n').filter(Boolean)
      const entries: HistoryEntry[] = []
      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as HistoryEntry
          if (entry && entry.taskId === taskId) entries.push(entry)
        } catch {
          // skip malformed lines
        }
      }
      return entries.slice(-limit).reverse()
    } catch {
      return []
    }
  }

  /** Read the most recent execution history across ALL tasks. */
  historyAll(limit = 200): HistoryEntry[] {
    try {
      if (!existsSync(this.historyFile())) return []
      const lines = readFileSync(this.historyFile(), 'utf8').split('\n').filter(Boolean)
      const entries: HistoryEntry[] = []
      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as HistoryEntry
          if (entry && typeof entry.taskId === 'string') entries.push(entry)
        } catch {
          // skip malformed lines
        }
      }
      return entries.slice(-limit).reverse()
    } catch {
      return []
    }
  }

  private trimHistory(): void {
    try {
      if (!existsSync(this.historyFile())) return
      const file = this.historyFile()
      const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean)
      if (lines.length <= this.historyRetention) return
      const kept = lines.slice(-this.historyRetention)
      writeFileSync(file, `${kept.join('\n')}\n`)
    } catch {
      // best-effort
    }
  }

  /** Atomic write: temp file + rename. A failed write keeps the old file. */
  private persist(): void {
    const payload: StoreFile = { version: 1, tasks: this.tasks }
    const text = `${JSON.stringify(payload, null, 2)}\n`
    const file = this.tasksFile()
    const tmp = `${file}.tmp`
    writeFileSync(tmp, text, 'utf8')
    // Atomic swap. On Windows the replace can transiently fail with EPERM/EACCES/
    // EBUSY when a scanner or the search indexer holds the target open — observed
    // as an intermittent `rename tasks.json.tmp -> tasks.json` failure in tests.
    // Retry briefly, then fall back to an in-place write so a save is never lost.
    const delaysMs = [10, 20, 40, 80, 160, 320]
    for (let attempt = 0; attempt <= delaysMs.length; attempt += 1) {
      try {
        renameSync(tmp, file)
        return
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code
        const transient = code === 'EPERM' || code === 'EACCES' || code === 'EBUSY'
        if (!transient || attempt === delaysMs.length) {
          if (code === 'ENOENT') return // tmp vanished (another writer won) — nothing to do
          break
        }
        sleepSync(delaysMs[attempt])
      }
    }
    try {
      writeFileSync(file, text, 'utf8')
      rmSync(tmp, { force: true })
    } catch (error) {
      console.error('[dsh-scheduler] tasks.json 写入失败:', error)
    }
  }
}

/** Blocking sleep: `persist` must stay synchronous, so no `await` is available here. */
function sleepSync(ms: number): void {
  if (ms <= 0) return
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function isTaskDef(value: unknown): value is TaskDef {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.cron === 'string' &&
    (t.executionKind === 'knj-workflow'
      ? typeof t.workflowId === 'string' && typeof t.workflowTitle === 'string'
      : typeof t.prompt === 'string') &&
    typeof t.enabled === 'boolean' &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string'
  )
}

function randomId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
