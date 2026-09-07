/**
 * Task definitions: the durable, validated shape of a scheduled task.
 * A task is one of three trigger types:
 *   - cron:     Vixie-cron expression (5/6/7 segments, seconds optional)
 *   - once:     one-shot at a specific ISO date-time (auto-disabled after firing)
 *   - interval: repeat every N minutes
 */
import { Cron } from 'croner';
/** Loose structural validation for fields that do not need cron parsing. */
export function effectiveExecutionKind(input) {
    return input.executionKind === 'knj-workflow' ? 'knj-workflow' : 'prompt-session';
}
export function validateTaskInput(input) {
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (name === '') {
        return { ok: false, code: 'name_required', message: '任务名称不能为空 / task name is required' };
    }
    if (input.executionKind !== undefined && input.executionKind !== 'prompt-session' && input.executionKind !== 'knj-workflow') {
        return { ok: false, code: 'workflow_id_required', message: '执行类型无效 / execution kind is invalid' };
    }
    if (effectiveExecutionKind(input) === 'knj-workflow') {
        if (typeof input.workflowId !== 'string' || input.workflowId.trim() === '')
            return { ok: false, code: 'workflow_id_required', message: '请选择工作流 / workflow is required' };
        if (typeof input.workflowTitle !== 'string' || input.workflowTitle.trim() === '')
            return { ok: false, code: 'workflow_title_required', message: '流程任务标题不能为空 / workflow task title is required' };
        if (typeof input.cwd !== 'string' || input.cwd.trim() === '')
            return { ok: false, code: 'cwd_required', message: '流程任务必须选择工作目录 / workflow task cwd is required' };
        return { ok: true };
    }
    if (typeof input.prompt !== 'string' || input.prompt.trim() === '') {
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
