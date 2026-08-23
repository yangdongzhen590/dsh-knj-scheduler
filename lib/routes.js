import { Cron } from 'croner';
import { buildCronPattern } from "./scheduler.js";
import { executeTask } from "./executor.js";
import { validateTask } from "./types.js";
const BASE = '/dsh-scheduler';
const MAX_BODY_BYTES = 64 * 1024;
export function mountSchedulerRoutes(host, ctx, store, scheduler) {
    /** Fire a task through the executor and record the outcome. */
    const onFire = async (task) => {
        const id = store.appendHistory({ taskId: task.id, at: new Date().toISOString(), status: 'running' });
        const result = await executeTask(ctx, task);
        if (id !== null) {
            store.updateHistory(id, {
                status: result.status,
                sessionId: result.sessionId,
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
                const result = await executeTask(ctx, task);
                if (id !== null) {
                    store.updateHistory(id, {
                        status: result.status,
                        sessionId: result.sessionId,
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
async function readJsonBody(request) {
    const chunks = [];
    let total = 0;
    for await (const chunk of request) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buf.length;
        if (total > MAX_BODY_BYTES) {
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
