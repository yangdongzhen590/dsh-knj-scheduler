import type { TaskDef } from './types.ts';
/** Build the croner pattern (string for cron/interval, Date for once) from a task. */
export declare function buildCronPattern(task: {
    type: string;
    cron: string;
    runAt?: string;
    everyMinutes?: number;
}): string | Date;
export declare class TaskScheduler {
    private readonly timezone?;
    private jobs;
    /**
     * @param timezone IANA timezone for cron evaluation (e.g. 'Asia/Shanghai').
     *        Omit to use the system local timezone — what a user expects when
     *        they write a cron like `0 9 * * *`.
     */
    constructor(timezone?: string | undefined);
    /** Register (or re-register after an edit) one task. Returns false on an invalid schedule. */
    schedule(task: TaskDef, onFire: (task: TaskDef) => void): boolean;
    unschedule(id: string): void;
    nextRun(id: string): Date | null;
    /** Dispose: stop every timer (plugin unload / HMR safety). */
    clear(): void;
}
