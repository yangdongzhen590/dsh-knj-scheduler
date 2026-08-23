/**
 * dsh-scheduler client: registers a "调度器" entry in the left sidebar's
 * footer.action slot (same pattern as dsh-knj-workflow's "新建任务" entry).
 * Built by tsdown into the __ModuleLoader__ factory bundle at client/client.js.
 */
import { createElement as h } from 'react'
import { en, zh } from './locales.ts'
import { SchedulerEntry } from './SchedulerEntry.tsx'

const NS = 'dsh-scheduler'

/** The subset of the locale service this plugin touches. */
interface LocaleService {
  register(namespace: string, dicts: { zh: Record<string, string>; en: Record<string, string> }): unknown
  bind(namespace: string): (key: string) => string
}

/** The subset of the client slots service this plugin touches. */
interface SlotsService {
  inject(slot: string, register: () => unknown): void
  register(meta: { name: string; id: string; locale: string; order?: number }, render: (props: unknown) => unknown): unknown
}

/** The subset of the host `sessions` client service this plugin touches (see dsh-client-runtime). */
export interface SessionsService {
  /** Select a listed session as current (the same path the session tree click uses). */
  open(id: string): void
  /** Live session summaries (read-only mirror; `cwd` is the session's project directory). */
  list?: { getSnapshot(): { byId: Record<string, { cwd?: string }>; current?: string } }
}

/** The subset of the host `workspaces` client service this plugin touches (see dsh-client-runtime). */
export interface WorkspacesService {
  /** Live workspace list mirror (read-only). */
  list?: { getSnapshot(): { items: Array<{ workspaceId: string; path: string; title?: string }> } }
}

/** The client cordis context shape this plugin relies on (structural). */
interface SchedulerClientContext {
  effect(callback: () => unknown, label?: string): void
  locale: LocaleService
  slots: SlotsService
  sessions?: SessionsService
  workspaces?: WorkspacesService
}

export const name = 'dsh-scheduler'
export const inject = ['locale', 'slots', 'sessions', 'workspaces']

export function apply(ctx: SchedulerClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-scheduler: dictionaries')
  const t = ctx.locale.bind(NS)
  const sessions = ctx.sessions
  const workspaces = ctx.workspaces

  ctx.effect(() => {
    if (!ctx.slots) return
    ctx.slots.inject('knj.menu.item', () => ctx.slots.register(
      { name: 'knj.menu.item', id: 'dsh-scheduler', order: 20, locale: 'zh' },
      () => h(SchedulerEntry, { t, sessions, workspaces }),
    ))
  }, 'dsh-scheduler: sidebar entry')
}
