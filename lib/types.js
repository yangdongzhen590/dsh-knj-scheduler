/**
 * Task definitions: the durable, validated shape of a scheduled task.
 * A task is one of three trigger types:
 *   - cron:     Vixie-cron expression (5/6/7 segments, seconds optional)
 *   - once:     one-shot at a specific ISO date-time (auto-disabled after firing)
 *   - interval: repeat every N minutes
 */
import { Cron } from 'croner';
import { describeWorkflowAttachmentsError } from "./attachments.js";
/** Loose structural validation for fields that do not need cron parsing. */
export function effectiveExecutionKind(input) {
    return input.executionKind === 'knj-workflow' ? 'knj-workflow' : 'prompt-session';
}
/**
 * Normalize `workflowPathInputs`: trim keys and values, drop blanks, and return `undefined`
 * when nothing usable remains — so a stored task's shape stays stable and legacy records are
 * untouched.
 */
export function normalizeWorkflowPathInputs(value) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'object' || Array.isArray(value))
        return undefined;
    const out = {};
    for (const [key, raw] of Object.entries(value)) {
        const name = String(key).trim();
        if (name === '' || typeof raw !== 'string')
            continue;
        const path = raw.trim();
        if (path === '')
            continue;
        out[name] = path;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}
/**
 * Why a `workflowPathInputs` value is unusable, or `null` when it is fine.
 *
 * Shape-only, and deliberately lenient about blanks: a blank path means "not provided" and is
 * dropped by {@link normalizeWorkflowPathInputs} — the same convention the sibling optional
 * fields follow (`workflowStoryCode: '   '` is treated as absent). *Whether the path exists* is a
 * fire-time concern (another job may produce the file later) and is verified by the workflow
 * plugin before a run starts.
 */
export function describeWorkflowPathInputsError(value, kind) {
    if (value === undefined || value === null)
        return null;
    if (typeof value !== 'object' || Array.isArray(value)) {
        return '文件入参必须是「参数名 → 路径」的对象 / workflowPathInputs must be an object';
    }
    for (const [key, raw] of Object.entries(value)) {
        if (String(key).trim() === '') {
            return '文件入参的参数名不能为空 / workflowPathInputs keys must not be blank';
        }
        if (typeof raw !== 'string') {
            return `文件入参 ${key} 的路径必须是字符串 / workflowPathInputs.${key} must be a string`;
        }
    }
    const usable = normalizeWorkflowPathInputs(value);
    if (kind !== 'knj-workflow' && usable !== undefined) {
        return '文件入参只适用于「KNJ 工作流」类型的任务 / workflowPathInputs only applies to knj-workflow tasks';
    }
    return null;
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
        // 标题不再是必填：留空时由 workflow 插件用描述派生（与「新建任务」表单一致）。
        // 之前这里强制非空，导致调度器与 workflow 插件的口径不一致（用户被迫想标题）。
        if (typeof input.cwd !== 'string' || input.cwd.trim() === '')
            return { ok: false, code: 'cwd_required', message: '流程任务必须选择工作目录 / workflow task cwd is required' };
        const pathInputsError = describeWorkflowPathInputsError(input.workflowPathInputs, 'knj-workflow');
        if (pathInputsError !== null)
            return { ok: false, code: 'invalid_workflow_path_inputs', message: pathInputsError };
        const attachmentsError = describeWorkflowAttachmentsError(input.workflowAttachments, 'knj-workflow');
        if (attachmentsError !== null)
            return { ok: false, code: 'invalid_workflow_attachments', message: attachmentsError };
        return { ok: true };
    }
    const notApplicable = describeWorkflowPathInputsError(input.workflowPathInputs, 'prompt-session');
    if (notApplicable !== null)
        return { ok: false, code: 'invalid_workflow_path_inputs', message: notApplicable };
    const attNotApplicable = describeWorkflowAttachmentsError(input.workflowAttachments, 'prompt-session');
    if (attNotApplicable !== null)
        return { ok: false, code: 'invalid_workflow_attachments', message: attNotApplicable };
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
