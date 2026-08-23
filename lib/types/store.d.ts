import type { TaskDef, TaskInput } from './types.ts';
export type HistoryStatus = 'running' | 'created' | 'failed' | 'skipped';
export interface HistoryEntry {
    /** Stable unique id; present on entries appended after v0.1.11 (needed to flip running → final). */
    id?: string;
    taskId: string;
    at: string;
    status: HistoryStatus;
    sessionId?: string;
    ms?: number;
    error?: string;
}
export interface StoreFile {
    version: 1;
    tasks: TaskDef[];
}
export declare class TaskStore {
    private readonly dataDir;
    private readonly historyRetention;
    private tasks;
    constructor(dataDir: string, historyRetention?: number);
    private tasksFile;
    private historyFile;
    /** Load persisted tasks (idempotent; safe to call on every boot). */
    load(): void;
    list(): TaskDef[];
    get(id: string): TaskDef | undefined;
    /** Create a task; validation is the caller's job (see validateTask). */
    create(input: TaskInput, now?: string): TaskDef | null;
    /** Update a task in place; validation is the caller's job. */
    update(id: string, input: TaskInput): TaskDef | null;
    remove(id: string): boolean;
    setEnabled(id: string, enabled: boolean): TaskDef | null;
    /**
     * Append one history entry and trim beyond the retention cap.
     * Returns the entry id (generated when absent) so the caller can later
     * flip a `running` entry into its final status via updateHistory.
     * Returns null when the write failed.
     */
    appendHistory(entry: HistoryEntry): string | null;
    /** Flip an in-flight `running` entry to its final status (id from appendHistory). */
    updateHistory(id: string, patch: Partial<HistoryEntry>): void;
    history(taskId: string, limit?: number): HistoryEntry[];
    /** Read the most recent execution history across ALL tasks. */
    historyAll(limit?: number): HistoryEntry[];
    private trimHistory;
    /** Atomic write: temp file + rename. A failed write keeps the old file. */
    private persist;
}
