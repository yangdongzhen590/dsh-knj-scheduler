/**
 * dsh-scheduler host entry: mounts the scheduler HTTP routes and the cron
 * engine once the profile composes the webServer and loader services.
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { TaskStore } from "./store.js";
import { TaskScheduler } from "./scheduler.js";
import { mountSchedulerRoutes } from "./routes.js";
import { AttachmentStore } from "./attachments.js";
export const name = 'dsh-scheduler';
export function apply(ctx, config) {
    ctx.inject(['webServer', 'loader'], (hostCtx) => {
        const host = hostCtx;
        const dataDir = config?.dataDir ?? defaultDataDir();
        const store = new TaskStore(dataDir, config?.historyRetention ?? 500);
        store.load();
        // 附件持久化在调度器自己的数据目录里（跨触发存活），与 workflow 插件的一次性暂存无关。
        const attachments = new AttachmentStore(join(dataDir, 'attachments'));
        store.onAttachmentDrop = (uploadIds) => {
            // 被编辑替换（或随任务删除）的附件不再被任何任务引用，直接回收存储。
            // best-effort：回收失败不影响保存/删除本身。
            for (const id of uploadIds) {
                void attachments.discard(id).catch(() => { });
            }
        };
        const scheduler = new TaskScheduler(config?.timezone);
        const disposeRoutes = mountSchedulerRoutes(host, ctx, store, scheduler, attachments);
        return () => {
            disposeRoutes();
            scheduler.clear();
        };
    });
}
function argvProfile() {
    const argv = process.argv;
    const flag = argv.indexOf('--profile');
    if (flag !== -1 && flag + 1 < argv.length && !argv[flag + 1].startsWith('-'))
        return argv[flag + 1];
    return undefined;
}
function defaultDataDir() {
    const home = process.env.DSH_HOME ?? join(homedir(), '.dsh');
    const profile = argvProfile() ?? 'web';
    return join(home, 'profiles', profile, 'dsh-scheduler');
}
