import type { WorkflowAttachmentRef } from './attachments.ts';
export type { WorkflowAttachmentRef };
export type TaskType = 'cron' | 'once' | 'interval';
export type ExecutionKind = 'prompt-session' | 'knj-workflow';
export interface TaskDef {
    /** Stable unique id (uuid). */
    id: string;
    /** Human-readable task name. */
    name: string;
    /** Whether the task is currently scheduled. */
    enabled: boolean;
    /** Trigger type. */
    type: TaskType;
    /** Cron expression (cron type; empty string otherwise). */
    cron: string;
    /** ISO date-time (once type). */
    runAt?: string;
    /** Repeat interval in minutes (interval type). */
    everyMinutes?: number;
    /** Working directory for the execution (required for workflow tasks). */
    cwd?: string;
    /** Execution behavior, independent of the trigger. Missing persisted values mean prompt-session. */
    executionKind: ExecutionKind;
    /** The prompt injected as the first message of a newly created session. */
    prompt?: string;
    /** Selected KNJ workflow and the development-task title/description. */
    workflowId?: string;
    workflowTitle?: string;
    workflowDescription?: string;
    /** Optional user-story code forwarded to the workflow task as storyCode. */
    workflowStoryCode?: string;
    /**
     * File-typed workflow inputs given by PATH (parameter name → path), forwarded as `pathInputs`.
     * Paths are read when the schedule fires (no snapshot): relative paths are resolved by the
     * workflow plugin against the task's working directory, and a missing file fails the launch.
     */
    workflowPathInputs?: Record<string, string>;
    /**
     * Attachments uploaded from the browser and persisted in the scheduler's own data directory
     * (`<dataDir>/attachments/<id>/<name>`). Forwarded as `attachments` on every fire;
     * the workflow plugin materializes them into the task workspace under `inputs.附件`.
     *
     * Difference from `workflowPathInputs`: these are **snapshots** — the stored bytes are what
     * the run receives, so they are suitable for files that live outside the workspace. Paths keep
     * reading whatever exists at fire time.
     */
    workflowAttachments?: WorkflowAttachmentRef[];
    createdAt: string;
    updatedAt: string;
}
export interface TaskInput {
    name: string;
    type?: TaskType;
    cron?: string;
    runAt?: string;
    everyMinutes?: number;
    cwd?: string;
    executionKind?: ExecutionKind;
    prompt?: string;
    workflowId?: string;
    /**
     * Optional task title. When absent the workflow plugin derives it from the description
     * (`deriveTaskTitle`), exactly like the "new task" form — so a scheduled task no longer
     * forces the user to invent a title before saving.
     */
    workflowTitle?: string;
    workflowDescription?: string;
    /** Optional user-story code forwarded to the workflow task as storyCode. */
    workflowStoryCode?: string;
    /** File-typed workflow inputs given by path (parameter name → path); see TaskDef. */
    workflowPathInputs?: Record<string, string>;
    /** Persisted attachment references to hand to every fire; see TaskDef. */
    workflowAttachments?: WorkflowAttachmentRef[];
    enabled?: boolean;
}
/** Validation result: pass, or a stable machine-readable error code. */
export type ValidateResult = {
    ok: true;
} | {
    ok: false;
    code: 'name_required' | 'prompt_required' | 'workflow_id_required' | 'cwd_required' | 'invalid_cron' | 'invalid_run_at' | 'invalid_interval' | 'invalid_workflow_path_inputs' | 'invalid_workflow_attachments';
    message: string;
};
/** Loose structural validation for fields that do not need cron parsing. */
export declare function effectiveExecutionKind(input: Pick<TaskInput, 'executionKind'>): ExecutionKind;
/**
 * Normalize `workflowPathInputs`: trim keys and values, drop blanks, and return `undefined`
 * when nothing usable remains — so a stored task's shape stays stable and legacy records are
 * untouched.
 */
export declare function normalizeWorkflowPathInputs(value: unknown): Record<string, string> | undefined;
/**
 * Why a `workflowPathInputs` value is unusable, or `null` when it is fine.
 *
 * Shape-only, and deliberately lenient about blanks: a blank path means "not provided" and is
 * dropped by {@link normalizeWorkflowPathInputs} — the same convention the sibling optional
 * fields follow (`workflowStoryCode: '   '` is treated as absent). *Whether the path exists* is a
 * fire-time concern (another job may produce the file later) and is verified by the workflow
 * plugin before a run starts.
 */
export declare function describeWorkflowPathInputsError(value: unknown, kind: ExecutionKind): string | null;
export declare function validateTaskInput(input: TaskInput): ValidateResult;
/** Parse a cron expression, returning an error message when invalid. */
export declare function describeCronError(cron: string): string | null;
/** Normalize the effective type, defaulting legacy records to cron. */
export declare function effectiveType(input: TaskInput): TaskType;
/** Validate a full task input, including the type-specific trigger field. */
export declare function validateTask(task: TaskInput): ValidateResult;
