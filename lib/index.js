/**
 * dsh-scheduler host entry: mounts the scheduler HTTP routes and the cron
 * engine once the profile composes the webServer and loader services.
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { TaskStore } from './store.js';
import { TaskScheduler } from './scheduler.js';
import { mountSchedulerRoutes } from './routes.js';
import { AttachmentStore } from './attachments.js';
export const name = 'dsh-scheduler';
/** 读自身 package.json 的版本号：启动日志是「插件到底加载了没有」的唯一信号。 */
function pluginVersion() {
    try {
        const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
        return manifest.version ?? 'unknown';
    }
    catch {
        return 'unknown';
    }
}
export function apply(ctx, config) {
    // 这行日志是插件被宿主加载的唯一证据：没有它 = 没加载（例如 bundle 被静默跳过）。
    console.log(`[dsh-scheduler] v${pluginVersion()} loaded (node ${process.version})`);
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
