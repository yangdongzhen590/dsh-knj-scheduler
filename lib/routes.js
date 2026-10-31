import { Cron } from 'croner';
import { buildCronPattern } from './scheduler.js';
import { executeTask } from './executor.js';
import { validateTask } from './types.js';
import { ATTACHMENT_BODY_BYTES } from './attachments.js';
const BASE = '/dsh-scheduler';
const MAX_BODY_BYTES = 64 * 1024;
export function mountSchedulerRoutes(host, ctx, store, scheduler, attachments) {
    /** Fire a task through the executor and record the outcome. */
    const onFire = async (task) => {
        const id = store.appendHistory({ taskId: task.id, at: new Date().toISOString(), status: 'running' });
        const result = await executeTask(ctx, task, attachments);
        if (id !== null) {
            store.updateHistory(id, {
                status: result.status,
                sessionId: result.sessionId,
                workflowTaskId: result.workflowTaskId,
                ms: result.ms,
                error: result.error,
            });
        }
        // One-shot tasks auto-disable after firing.
        if (task.type === 'once') {
            store.setEnabled(task.id, false);
            scheduler.unschedule(task.id);
        }
    };
    /** Resync every task into the scheduler (idempotent; safe on boot). */
    const syncAll = () => {
        for (const task of store.list()) {
            if (task.enabled)
                scheduler.schedule(task, onFire);
            else
                scheduler.unschedule(task.id);
        }
    };
    const syncOne = (task) => {
        scheduler.unschedule(task.id);
        if (task.enabled)
            scheduler.schedule(task, onFire);
    };
    syncAll();
    const handler = async (request, response) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        const path = url.pathname;
        const method = request.method ?? 'GET';
        try {
            if (path === `${BASE}/preview` && method === 'GET') {
                const type = url.searchParams.get('type') ?? 'cron';
                const cron = url.searchParams.get('cron') ?? '';
                const runAt = url.searchParams.get('runAt') ?? '';
                const everyMinutes = url.searchParams.get('everyMinutes') ?? '';
                let nextRun = null;
                let nextRuns = [];
                try {
                    const pattern = buildCronPattern({
                        type: type === 'once' || type === 'interval' ? type : 'cron',
                        cron,
                        ...(type === 'once' ? { runAt } : {}),
                        ...(type === 'interval' ? { everyMinutes: Number(everyMinutes) } : {}),
                    });
                    const job = new Cron(pattern, {});
                    nextRun = job.nextRun()?.toISOString() ?? null;
                    nextRuns = job.nextRuns(5).map((d) => d.toISOString());
                }
                catch {
                    nextRun = null;
                    nextRuns = [];
                }
                sendJson(response, 200, { nextRun, nextRuns });
                return;
            }
            if (path === `${BASE}/history` && method === 'GET') {
                sendJson(response, 200, { history: store.historyAll() });
                return;
            }
            // 附件上传（调度器自己的持久化存储，不是 workflow 插件的 24h 暂存）。
            // 独立路由 + 独立上限：建任务请求体的上限只有 64KB，容不下 base64 文件内容。
            if (path === `${BASE}/attachments` && method === 'POST') {
                if (!sameOrigin(request))
                    return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' });
                if (attachments === undefined)
                    return sendJson(response, 503, { error: '附件存储不可用 / attachment store unavailable' });
                const body = await readJsonBody(request, ATTACHMENT_BODY_BYTES);
                const ref = await attachments.put(body);
                sendJson(response, 200, ref);
                return;
            }
            if (path === `${BASE}/workflows` && method === 'GET') {
                const workflow = ctx.get('knjWorkflowScheduler');
                if (workflow === undefined || typeof workflow.listWorkflows !== 'function') {
                    sendJson(response, 503, { error: 'dsh-knj-workflow scheduler service is unavailable' });
                    return;
                }
                sendJson(response, 200, { workflows: await workflow.listWorkflows() });
                return;
            }
            if (path === `${BASE}/tasks`) {
                if (method === 'GET') {
                    const tasks = store.list().map((task) => ({
                        ...task,
                        nextRun: task.enabled ? (scheduler.nextRun(task.id)?.toISOString() ?? null) : null,
                    }));
                    sendJson(response, 200, { tasks });
                    return;
                }
                if (method === 'POST') {
                    if (!sameOrigin(request))
                        return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' });
                    const body = await readJsonBody(request);
                    const result = validateTask(body);
                    if (!result.ok)
                        return sendJson(response, 400, { error: result.message });
                    const task = store.create(body);
                    if (!task)
                        return sendJson(response, 400, { error: '创建失败 / create failed' });
                    syncOne(task);
                    sendJson(response, 200, { ok: true, task });
                    return;
                }
                sendJson(response, 405, { error: 'method not allowed' });
                return;
            }
            const match = /^\/dsh-scheduler\/tasks\/([^/]+)$/.exec(path);
            const toggleMatch = /^\/dsh-scheduler\/tasks\/([^/]+)\/toggle$/.exec(path);
            const runMatch = /^\/dsh-scheduler\/tasks\/([^/]+)\/run$/.exec(path);
            const historyMatch = /^\/dsh-scheduler\/tasks\/([^/]+)\/history$/.exec(path);
            if (toggleMatch !== null && method === 'POST') {
                if (!sameOrigin(request))
                    return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' });
                const body = await readJsonBody(request);
                const enabled = body?.enabled === true;
                const task = store.setEnabled(toggleMatch[1], enabled);
                if (!task)
                    return sendJson(response, 404, { error: 'task not found / 任务不存在' });
                syncOne(task);
                sendJson(response, 200, { ok: true, task: withNextRun(task, scheduler) });
                return;
            }
            if (runMatch !== null && method === 'POST') {
                if (!sameOrigin(request))
                    return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' });
                const task = store.get(runMatch[1]);
                if (!task)
                    return sendJson(response, 404, { error: 'task not found / 任务不存在' });
                const id = store.appendHistory({ taskId: task.id, at: new Date().toISOString(), status: 'running' });
                const result = await executeTask(ctx, task, attachments);
                if (id !== null) {
                    store.updateHistory(id, {
                        status: result.status,
                        sessionId: result.sessionId,
                        workflowTaskId: result.workflowTaskId,
                        ms: result.ms,
                        error: result.error,
                    });
                }
                sendJson(response, 200, { ok: true, result });
                return;
            }
            if (historyMatch !== null && method === 'GET') {
                const task = store.get(historyMatch[1]);
                if (!task)
                    return sendJson(response, 404, { error: 'task not found / 任务不存在' });
                const history = store.history(task.id);
                sendJson(response, 200, { history });
                return;
            }
            if (match !== null) {
                if (method === 'PUT') {
                    if (!sameOrigin(request))
                        return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' });
                    const body = await readJsonBody(request);
                    const result = validateTask(body);
                    if (!result.ok)
                        return sendJson(response, 400, { error: result.message });
                    const task = store.update(match[1], body);
                    if (!task)
                        return sendJson(response, 404, { error: 'task not found / 任务不存在' });
                    syncOne(task);
                    sendJson(response, 200, { ok: true, task: withNextRun(task, scheduler) });
                    return;
                }
                if (method === 'DELETE') {
                    if (!sameOrigin(request))
                        return sendJson(response, 403, { error: 'untrusted origin / 非可信来源' });
                    const removed = store.remove(match[1]);
                    if (!removed)
                        return sendJson(response, 404, { error: 'task not found / 任务不存在' });
                    scheduler.unschedule(match[1]);
                    sendJson(response, 200, { ok: true });
                    return;
                }
                sendJson(response, 405, { error: 'method not allowed' });
                return;
            }
            sendJson(response, 404, { error: 'not found' });
        }
        catch (error) {
            // 用户侧问题（附件超限、JSON 坏了）不该报成 500：路由层已经有 code 就照实回
            const code = error.code;
            if (code === 'PAYLOAD_TOO_LARGE') {
                sendJson(response, 413, { error: '文件过大或请求体过大 / payload too large' });
                return;
            }
            if (code === 'BAD_JSON') {
                sendJson(response, 400, { error: 'JSON 解析失败 / invalid JSON body' });
                return;
            }
            sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
        }
    };
    const disposer = host.webServer.register({
        kind: 'prefix',
        path: BASE,
        handler,
    });
    return () => {
        disposer();
        scheduler.clear();
    };
}
function withNextRun(task, scheduler) {
    return {
        ...task,
        nextRun: task.enabled ? (scheduler.nextRun(task.id)?.toISOString() ?? null) : null,
    };
}
function sendJson(response, status, payload) {
    response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
}
/** Reject cross-origin writes; a missing Origin (curl, same-origin navigation) passes. */
function sameOrigin(request) {
    const origin = request.headers.origin;
    if (origin === undefined)
        return true;
    const host = request.headers.host;
    if (host === undefined)
        return false;
    try {
        return new URL(origin).host === host;
    }
    catch {
        return false;
    }
}
async function readJsonBody(request, maxBytes = MAX_BODY_BYTES) {
    const chunks = [];
    let total = 0;
    for await (const chunk of request) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buf.length;
        if (total > maxBytes) {
            const error = new Error('request body too large / 请求体过大');
            error.code = 'PAYLOAD_TOO_LARGE';
            throw error;
        }
        chunks.push(buf);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (raw === '')
        return {};
    try {
        return JSON.parse(raw);
    }
    catch {
        const error = new Error('invalid JSON body / JSON 解析失败');
        error.code = 'BAD_JSON';
        throw error;
    }
}
