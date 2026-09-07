/**
 * TaskStore: durable task definitions (tasks.json, atomic write) plus an
 * append-only execution history (history.jsonl) with a retention cap.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateTask, effectiveExecutionKind, effectiveType } from "./types.js";
const TASKS_FILE = 'tasks.json';
const HISTORY_FILE = 'history.jsonl';
export class TaskStore {
    dataDir;
    historyRetention;
    tasks = [];
    constructor(dataDir, historyRetention = 500) {
        this.dataDir = dataDir;
        this.historyRetention = historyRetention;
        mkdirSync(dataDir, { recursive: true });
    }
    tasksFile() {
        return join(this.dataDir, TASKS_FILE);
    }
    historyFile() {
        return join(this.dataDir, HISTORY_FILE);
    }
    /** Load persisted tasks (idempotent; safe to call on every boot). */
    load() {
        try {
            if (!existsSync(this.tasksFile())) {
                this.tasks = [];
                return;
            }
            const parsed = JSON.parse(readFileSync(this.tasksFile(), 'utf8'));
            const raw = Array.isArray(parsed.tasks) ? parsed.tasks : [];
            this.tasks = raw.filter((t) => isTaskDef(t)).map((t) => ({
                ...t,
                type: t.type === 'once' || t.type === 'interval' ? t.type : 'cron',
                executionKind: t.executionKind === 'knj-workflow' ? 'knj-workflow' : 'prompt-session',
            }));
        }
        catch (error) {
            // A corrupt file must never take the plugin down; keep the previous state.
            console.error('[dsh-scheduler] tasks.json 读取失败（保留内存状态）:', error);
            this.tasks = this.tasks ?? [];
        }
    }
    list() {
        return [...this.tasks];
    }
    get(id) {
        return this.tasks.find((t) => t.id === id);
    }
    /** Create a task; validation is the caller's job (see validateTask). */
    create(input, now = new Date().toISOString()) {
        const result = validateTask(input);
        if (!result.ok)
            return null;
        const type = effectiveType(input);
        const executionKind = effectiveExecutionKind(input);
        const task = {
            id: randomId(),
            name: input.name.trim(),
            enabled: input.enabled !== false,
            type,
            cron: type === 'cron' ? (input.cron ?? '').trim() : '',
            ...(type === 'once' ? { runAt: new Date(input.runAt).toISOString() } : {}),
            ...(type === 'interval' ? { everyMinutes: Number(input.everyMinutes) } : {}),
            ...(typeof input.cwd === 'string' && input.cwd.trim() !== '' ? { cwd: input.cwd.trim() } : {}),
            executionKind,
            ...(executionKind === 'prompt-session' ? { prompt: input.prompt.trim() } : {
                workflowId: input.workflowId.trim(),
                workflowTitle: input.workflowTitle.trim(),
                ...(typeof input.workflowDescription === 'string' && input.workflowDescription.trim() !== '' ? { workflowDescription: input.workflowDescription.trim() } : {}),
                ...(typeof input.workflowStoryCode === 'string' && input.workflowStoryCode.trim() !== '' ? { workflowStoryCode: input.workflowStoryCode.trim() } : {}),
            }),
            createdAt: now,
            updatedAt: now,
        };
        this.tasks.push(task);
        this.persist();
        return task;
    }
    /** Update a task in place; validation is the caller's job. */
    update(id, input) {
        const result = validateTask(input);
        if (!result.ok)
            return null;
        const task = this.get(id);
        if (!task)
            return null;
        const type = effectiveType(input);
        task.name = input.name.trim();
        task.type = type;
        task.cron = type === 'cron' ? (input.cron ?? '').trim() : '';
        task.runAt = type === 'once' ? new Date(input.runAt).toISOString() : undefined;
        task.everyMinutes = type === 'interval' ? Number(input.everyMinutes) : undefined;
        task.cwd = typeof input.cwd === 'string' && input.cwd.trim() !== '' ? input.cwd.trim() : undefined;
        task.executionKind = effectiveExecutionKind(input);
        if (task.executionKind === 'prompt-session') {
            task.prompt = input.prompt.trim();
            task.workflowId = undefined;
            task.workflowTitle = undefined;
            task.workflowDescription = undefined;
            task.workflowStoryCode = undefined;
        }
        else {
            task.prompt = undefined;
            task.workflowId = input.workflowId.trim();
            task.workflowTitle = input.workflowTitle.trim();
            task.workflowDescription = typeof input.workflowDescription === 'string' && input.workflowDescription.trim() !== '' ? input.workflowDescription.trim() : undefined;
            task.workflowStoryCode = typeof input.workflowStoryCode === 'string' && input.workflowStoryCode.trim() !== '' ? input.workflowStoryCode.trim() : undefined;
        }
        if (typeof input.enabled === 'boolean')
            task.enabled = input.enabled;
        task.updatedAt = new Date().toISOString();
        this.persist();
        return { ...task };
    }
    remove(id) {
        const before = this.tasks.length;
        this.tasks = this.tasks.filter((t) => t.id !== id);
        if (this.tasks.length === before)
            return false;
        this.persist();
        return true;
    }
    setEnabled(id, enabled) {
        const task = this.get(id);
        if (!task)
            return null;
        task.enabled = enabled;
        task.updatedAt = new Date().toISOString();
        this.persist();
        return { ...task };
    }
    /**
     * Append one history entry and trim beyond the retention cap.
     * Returns the entry id (generated when absent) so the caller can later
     * flip a `running` entry into its final status via updateHistory.
     * Returns null when the write failed.
     */
    appendHistory(entry) {
        const id = entry.id ?? randomId();
        try {
            writeFileSync(this.historyFile(), `${JSON.stringify({ ...entry, id })}\n`, { flag: 'a' });
            this.trimHistory();
            return id;
        }
        catch (error) {
            console.error('[dsh-scheduler] 写入执行历史失败:', error);
            return null;
        }
    }
    /** Flip an in-flight `running` entry to its final status (id from appendHistory). */
    updateHistory(id, patch) {
        try {
            const file = this.historyFile();
            if (!existsSync(file))
                return;
            const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
            let changed = false;
            const updated = lines.map((line) => {
                try {
                    const entry = JSON.parse(line);
                    if (entry.id === id) {
                        changed = true;
                        return JSON.stringify({ ...entry, ...patch, id });
                    }
                    return line;
                }
                catch {
                    return line;
                }
            });
            if (!changed)
                return;
            writeFileSync(file, `${updated.join('\n')}\n`);
        }
        catch (error) {
            console.error('[dsh-scheduler] 更新执行历史失败:', error);
        }
    }
    history(taskId, limit = 100) {
        try {
            if (!existsSync(this.historyFile()))
                return [];
            const lines = readFileSync(this.historyFile(), 'utf8').split('\n').filter(Boolean);
            const entries = [];
            for (const line of lines) {
                try {
                    const entry = JSON.parse(line);
                    if (entry && entry.taskId === taskId)
                        entries.push(entry);
                }
                catch {
                    // skip malformed lines
                }
            }
            return entries.slice(-limit).reverse();
        }
        catch {
            return [];
        }
    }
    /** Read the most recent execution history across ALL tasks. */
    historyAll(limit = 200) {
        try {
            if (!existsSync(this.historyFile()))
                return [];
            const lines = readFileSync(this.historyFile(), 'utf8').split('\n').filter(Boolean);
            const entries = [];
            for (const line of lines) {
                try {
                    const entry = JSON.parse(line);
                    if (entry && typeof entry.taskId === 'string')
                        entries.push(entry);
                }
                catch {
                    // skip malformed lines
                }
            }
            return entries.slice(-limit).reverse();
        }
        catch {
            return [];
        }
    }
    trimHistory() {
        try {
            if (!existsSync(this.historyFile()))
                return;
            const file = this.historyFile();
            const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
            if (lines.length <= this.historyRetention)
                return;
            const kept = lines.slice(-this.historyRetention);
            writeFileSync(file, `${kept.join('\n')}\n`);
        }
        catch {
            // best-effort
        }
    }
    /** Atomic write: temp file + rename. A failed write keeps the old file. */
    persist() {
        const payload = { version: 1, tasks: this.tasks };
        const file = this.tasksFile();
        const tmp = `${file}.tmp`;
        writeFileSync(tmp, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
        renameSync(tmp, file);
    }
}
function isTaskDef(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const t = value;
    return (typeof t.id === 'string' &&
        typeof t.name === 'string' &&
        typeof t.cron === 'string' &&
        (t.executionKind === 'knj-workflow'
            ? typeof t.workflowId === 'string' && typeof t.workflowTitle === 'string'
            : typeof t.prompt === 'string') &&
        typeof t.enabled === 'boolean' &&
        typeof t.createdAt === 'string' &&
        typeof t.updatedAt === 'string');
}
function randomId() {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
