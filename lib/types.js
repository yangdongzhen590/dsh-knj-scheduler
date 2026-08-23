/**
 * Task definitions: the durable, validated shape of a scheduled task.
 * A task is one of three trigger types:
 *   - cron:     Vixie-cron expression (5/6/7 segments, seconds optional)
 *   - once:     one-shot at a specific ISO date-time (auto-disabled after firing)
 *   - interval: repeat every N minutes
 */
import { Cron } from 'croner';
/** Loose structural validation for fields that do not need cron parsing. */
export function validateTaskInput(input) {
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
    if (name === '') {
        return { ok: false, code: 'name_required', message: '任务名称不能为空 / task name is required' };
    }
    if (prompt === '') {
        return { ok: false, code: 'prompt_required', message: '提示词不能为空 / prompt is required' };
    }
    return { ok: true };
}
/** Parse a cron expression, returning an error message when invalid. */
export function describeCronError(cron) {
    const trimmed = typeof cron === 'string' ? cron.trim() : '';
    if (trimmed === '')
        return 'Cron 表达式不能为空 / cron expression is required';
    try {
        new Cron(trimmed);
        return null;
    }
    catch (error) {
        return `Cron 表达式无效: ${error instanceof Error ? error.message : String(error)}`;
    }
}
/** Normalize the effective type, defaulting legacy records to cron. */
export function effectiveType(input) {
    return input.type === 'once' || input.type === 'interval' ? input.type : 'cron';
}
/** Validate a full task input, including the type-specific trigger field. */
export function validateTask(task) {
    const base = validateTaskInput(task);
    if (!base.ok)
        return base;
    const type = effectiveType(task);
    if (type === 'cron') {
        const cronError = describeCronError(task.cron ?? '');
        if (cronError !== null) {
            return { ok: false, code: 'invalid_cron', message: cronError };
        }
    }
    else if (type === 'once') {
        const t = typeof task.runAt === 'string' ? new Date(task.runAt) : new Date(NaN);
        if (Number.isNaN(t.getTime())) {
            return { ok: false, code: 'invalid_run_at', message: '执行时间无效 / runAt must be a valid date' };
        }
    }
    else {
        const m = Number(task.everyMinutes);
        if (!Number.isInteger(m) || m < 1) {
            return { ok: false, code: 'invalid_interval', message: '间隔分钟数必须是正整数 / everyMinutes must be a positive integer' };
        }
    }
    return { ok: true };
}
