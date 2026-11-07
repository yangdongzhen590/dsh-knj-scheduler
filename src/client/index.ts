/**
 * dsh-scheduler client: registers the scheduler as a Settings → 定时任务
 * section (`settings.section`), so it opens from the host's Settings dialog
 * and no longer needs the dsh-knj-menu sidebar. Built by tsdown into the
 * __ModuleLoader__ factory bundle at client/client.js.
 */
import { createElement as h } from 'react'
import { en, zh } from './locales.ts'
import { SchedulerSection } from './SchedulerSection.tsx'

const NS = 'dsh-scheduler'
const SECTION_ID = 'dsh-scheduler'

/** The subset of the locale service this plugin touches. */
interface LocaleService {
  register(namespace: string, dicts: { zh: Record<string, string>; en: Record<string, string> }): unknown
  bind(namespace: string): (key: string) => string
}

/** The subset of the client slots service this plugin touches. */
interface SlotsService {
  inject(slot: string, register: () => unknown): void
  register(
    meta: { name: string; id: string; locale?: string; order?: number; label?: string | (() => string) },
    render: (props: unknown) => unknown,
  ): unknown
}

/**
 * The subset of the host `sessions` client service this plugin touches (see
 * @deepseek-ai/dsh-api-session-controller).
 *
 * Session selection is NOT part of this service: DSH 0.2 removed it from
 * `ISessions` and moved it to the `uiWorkspace` navigation service below.
 */
export interface SessionsService {
  /** Live session summaries (read-only mirror; `cwd` is the session's project directory). */
  list?: {
    getSnapshot(): {
      byId: Record<string, { cwd?: string }>
    }
  }
}

/**
 * The subset of the host `uiWorkspace` navigation service this plugin touches.
 * This is where DSH 0.2 put session selection (previously a method on the
 * sessions service in 0.1.x), for both sessions and subagents.
 */
export interface UiWorkspaceService {
  /** Navigate to an existing session (the same path the session tree click uses). */
  openSession(id: string): void
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
  uiWorkspace?: UiWorkspaceService
  /** Cordis service lookup; the reliable way to read a service registered after apply. */
  get?: (name: string) => unknown
}

export const name = 'dsh-scheduler'
export const inject = ['locale', 'slots', 'sessions', 'workspaces', 'uiWorkspace']

export function apply(ctx: SchedulerClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-scheduler: dictionaries')
  const t = ctx.locale.bind(NS)
  const sessions = ctx.sessions
  const workspaces = ctx.workspaces

  /**
   * Read navigation at click time, not at apply time: the Settings section is
   * registered once and captures this closure, so a service provided later in
   * boot would otherwise stay frozen as `undefined`.
   */
  const resolveUiWorkspace = (): UiWorkspaceService | undefined => {
    if (ctx.uiWorkspace !== undefined) return ctx.uiWorkspace
    const viaLookup = typeof ctx.get === 'function' ? ctx.get('uiWorkspace') : undefined
    return viaLookup as UiWorkspaceService | undefined
  }

  /** Visible service names, for diagnosing a host that does not expose navigation. */
  const describeContext = (): string => {
    const names: string[] = []
    for (const key of Object.keys(ctx as unknown as Record<string, unknown>)) {
      if (key.startsWith('_')) continue
      const value = (ctx as unknown as Record<string, unknown>)[key]
      if (value !== null && (typeof value === 'object' || typeof value === 'function')) names.push(key)
    }
    return names.slice(0, 24).join(',')
  }

  ctx.effect(() => {
    if (!ctx.slots) return
    ctx.slots.inject('settings.section', () => ctx.slots.register(
      {
        name: 'settings.section',
        id: SECTION_ID,
        order: 30,
        // The host resolves this thunk when it renders the navigation rows.
        label: () => t('panel.title'),
        locale: NS,
      },
      (props: unknown) => {
        const close = (props as { close?: () => void } | undefined)?.close
        return h(SchedulerSection, {
          close,
          t,
          sessions,
          workspaces,
          uiWorkspace: ctx.uiWorkspace,
          resolveUiWorkspace,
          describeContext,
        })
      },
    ))
  }, 'dsh-scheduler: settings section')
}
