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
    workflowTitle?: string;
    workflowDescription?: string;
    /** Optional user-story code forwarded to the workflow task as storyCode. */
    workflowStoryCode?: string;
    enabled?: boolean;
}
/** Validation result: pass, or a stable machine-readable error code. */
export type ValidateResult = {
    ok: true;
} | {
    ok: false;
    code: 'name_required' | 'prompt_required' | 'workflow_id_required' | 'workflow_title_required' | 'cwd_required' | 'invalid_cron' | 'invalid_run_at' | 'invalid_interval';
    message: string;
};
/** Loose structural validation for fields that do not need cron parsing. */
export declare function effectiveExecutionKind(input: Pick<TaskInput, 'executionKind'>): ExecutionKind;
export declare function validateTaskInput(input: TaskInput): ValidateResult;
/** Parse a cron expression, returning an error message when invalid. */
export declare function describeCronError(cron: string): string | null;
/** Normalize the effective type, defaulting legacy records to cron. */
export declare function effectiveType(input: TaskInput): TaskType;
/** Validate a full task input, including the type-specific trigger field. */
export declare function validateTask(task: TaskInput): ValidateResult;
