export type TaskType = 'cron' | 'once' | 'interval';
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
    /** Working directory for the session this task creates (absolute path of a workspace; omitted = host process cwd). */
    cwd?: string;
    /** The prompt injected as the first message of a newly created session. */
    prompt: string;
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
    prompt: string;
    enabled?: boolean;
}
/** Validation result: pass, or a stable machine-readable error code. */
export type ValidateResult = {
    ok: true;
} | {
    ok: false;
    code: 'name_required' | 'prompt_required' | 'invalid_cron' | 'invalid_run_at' | 'invalid_interval';
    message: string;
};
/** Loose structural validation for fields that do not need cron parsing. */
export declare function validateTaskInput(input: TaskInput): ValidateResult;
/** Parse a cron expression, returning an error message when invalid. */
export declare function describeCronError(cron: string): string | null;
/** Normalize the effective type, defaulting legacy records to cron. */
export declare function effectiveType(input: TaskInput): TaskType;
/** Validate a full task input, including the type-specific trigger field. */
export declare function validateTask(task: TaskInput): ValidateResult;
