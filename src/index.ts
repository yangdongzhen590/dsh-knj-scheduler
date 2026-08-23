/**
 * dsh-scheduler host entry: mounts the scheduler HTTP routes and the cron
 * engine once the profile composes the webServer and loader services.
 */
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { TaskStore } from './store.ts'
import { TaskScheduler } from './scheduler.ts'
import { mountSchedulerRoutes, type SchedulerHost } from './routes.ts'

export const name = 'dsh-scheduler'

export interface Config {
  /** Override the data directory (default: $DSH_HOME/profiles/<profile>/dsh-scheduler). */
  dataDir?: string
  /** Per-task execution-history retention (default 500). */
  historyRetention?: number
  /** IANA timezone for cron evaluation (e.g. 'Asia/Shanghai'). Default: system local timezone. */
  timezone?: string
}

export function apply(ctx: Context, config?: Config): void {
  ctx.inject(['webServer', 'loader'], (hostCtx: Context) => {
    const host = hostCtx as unknown as SchedulerHost
    const dataDir = config?.dataDir ?? defaultDataDir()
    const store = new TaskStore(dataDir, config?.historyRetention ?? 500)
    store.load()
    const scheduler = new TaskScheduler(config?.timezone)
    const disposeRoutes = mountSchedulerRoutes(host, ctx, store, scheduler)
    return () => {
      disposeRoutes()
      scheduler.clear()
    }
  })
}

function argvProfile(): string | undefined {
  const argv = process.argv
  const flag = argv.indexOf('--profile')
  if (flag !== -1 && flag + 1 < argv.length && !argv[flag + 1].startsWith('-')) return argv[flag + 1]
  return undefined
}

function defaultDataDir(): string {
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const profile = argvProfile() ?? 'web'
  return join(home, 'profiles', profile, 'dsh-scheduler')
}
