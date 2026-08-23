/**
 * dsh-scheduler host entry: mounts the scheduler HTTP routes and the cron
 * engine once the profile composes the webServer and loader services.
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { TaskStore } from "./store.js";
import { TaskScheduler } from "./scheduler.js";
import { mountSchedulerRoutes } from "./routes.js";
export const name = 'dsh-scheduler';
export function apply(ctx, config) {
    ctx.inject(['webServer', 'loader'], (hostCtx) => {
        const host = hostCtx;
        const dataDir = config?.dataDir ?? defaultDataDir();
        const store = new TaskStore(dataDir, config?.historyRetention ?? 500);
        store.load();
        const scheduler = new TaskScheduler(config?.timezone);
        const disposeRoutes = mountSchedulerRoutes(host, ctx, store, scheduler);
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
