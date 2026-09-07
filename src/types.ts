/**
 * Task definitions: the durable, validated shape of a scheduled task.
 * A task is one of three trigger types:
 *   - cron:     Vixie-cron expression (5/6/7 segments, seconds optional)
 *   - once:     one-shot at a specific ISO date-time (auto-disabled after firing)
 *   - interval: repeat every N minutes
 */
import { Cron } from 'croner'

export type TaskType = 'cron' | 'once' | 'interval'
export type ExecutionKind = 'prompt-session' | 'knj-workflow'

export interface TaskDef {
  /** Stable unique id (uuid). */
  id: string
  /** Human-readable task name. */
  name: string
  /** Whether the task is currently scheduled. */
  enabled: boolean
  /** Trigger type. */
  type: TaskType
  /** Cron expression (cron type; empty string otherwise). */
  cron: string
  /** ISO date-time (once type). */
  runAt?: string
  /** Repeat interval in minutes (interval type). */
  everyMinutes?: number
  /** Working directory for the execution (required for workflow tasks). */
  cwd?: string
  /** Execution behavior, independent of the trigger. Missing persisted values mean prompt-session. */
  executionKind: ExecutionKind
  /** The prompt injected as the first message of a newly created session. */
  prompt?: string
  /** Selected KNJ workflow and the development-task title/description. */
  workflowId?: string
  workflowTitle?: string
  workflowDescription?: string
  /** Optional user-story code forwarded to the workflow task as storyCode. */
  workflowStoryCode?: string
  createdAt: string
  updatedAt: string
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
  /** Optional user-story code forwarded to the workflow task as storyCode. */
  workflowStoryCode?: string
  enabled?: boolean
}

/** Validation result: pass, or a stable machine-readable error code. */
export type ValidateResult =
  | { ok: true }
  | { ok: false; code: 'name_required' | 'prompt_required' | 'workflow_id_required' | 'workflow_title_required' | 'cwd_required' | 'invalid_cron' | 'invalid_run_at' | 'invalid_interval'; message: string }

/** Loose structural validation for fields that do not need cron parsing. */
export function effectiveExecutionKind(input: Pick<TaskInput, 'executionKind'>): ExecutionKind {
  return input.executionKind === 'knj-workflow' ? 'knj-workflow' : 'prompt-session'
}

export function validateTaskInput(input: TaskInput): ValidateResult {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (name === '') {
    return { ok: false, code: 'name_required', message: '任务名称不能为空 / task name is required' }
  }
  if (input.executionKind !== undefined && input.executionKind !== 'prompt-session' && input.executionKind !== 'knj-workflow') {
    return { ok: false, code: 'workflow_id_required', message: '执行类型无效 / execution kind is invalid' }
  }
  if (effectiveExecutionKind(input) === 'knj-workflow') {
    if (typeof input.workflowId !== 'string' || input.workflowId.trim() === '') return { ok: false, code: 'workflow_id_required', message: '请选择工作流 / workflow is required' }
    if (typeof input.workflowTitle !== 'string' || input.workflowTitle.trim() === '') return { ok: false, code: 'workflow_title_required', message: '流程任务标题不能为空 / workflow task title is required' }
    if (typeof input.cwd !== 'string' || input.cwd.trim() === '') return { ok: false, code: 'cwd_required', message: '流程任务必须选择工作目录 / workflow task cwd is required' }
    return { ok: true }
  }
  if (typeof input.prompt !== 'string' || input.prompt.trim() === '') {
    return { ok: false, code: 'prompt_required', message: '提示词不能为空 / prompt is required' }
  }
  return { ok: true }
}

/** Parse a cron expression, returning an error message when invalid. */
export function describeCronError(cron: string): string | null {
  const trimmed = typeof cron === 'string' ? cron.trim() : ''
  if (trimmed === '') return 'Cron 表达式不能为空 / cron expression is required'
  try {
    new Cron(trimmed)
    return null
  } catch (error) {
    return `Cron 表达式无效: ${error instanceof Error ? error.message : String(error)}`
  }
}

/** Normalize the effective type, defaulting legacy records to cron. */
export function effectiveType(input: TaskInput): TaskType {
  return input.type === 'once' || input.type === 'interval' ? input.type : 'cron'
}

/** Validate a full task input, including the type-specific trigger field. */
export function validateTask(task: TaskInput): ValidateResult {
  const base = validateTaskInput(task)
  if (!base.ok) return base
  const type = effectiveType(task)
  if (type === 'cron') {
    const cronError = describeCronError(task.cron ?? '')
    if (cronError !== null) {
      return { ok: false, code: 'invalid_cron', message: cronError }
    }
  } else if (type === 'once') {
    const t = typeof task.runAt === 'string' ? new Date(task.runAt) : new Date(NaN)
    if (Number.isNaN(t.getTime())) {
      return { ok: false, code: 'invalid_run_at', message: '执行时间无效 / runAt must be a valid date' }
    }
  } else {
    const m = Number(task.everyMinutes)
    if (!Number.isInteger(m) || m < 1) {
      return { ok: false, code: 'invalid_interval', message: '间隔分钟数必须是正整数 / everyMinutes must be a positive integer' }
    }
  }
  return { ok: true }
}
