/**
 * Scheduler panel: task list / create-edit form / execution history, rendered
 * inside a modal. Styled with the host's --dsw-alias design tokens so it reads
 * as a native DSH surface (no hardcoded palette, no emoji icons).
 *
 * Trigger types: cron (expression), once (specific time), interval (every N min).
 * The form previews the next run time live via /dsh-scheduler/preview.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Dict } from './locales.ts'
import * as api from './api.ts'
import type { HistoryEntry, TaskInput, TaskType, TaskView } from './api.ts'
import { IconCheck, IconChevronLeft, IconClock, IconCross, IconEdit, IconHistory, IconPlay, IconPlus, IconRefresh, IconTrash } from './icons.tsx'
import { PAGE_SIZES, pageSlice, fmt } from './pager.ts'
import type { SessionsService, WorkspacesService } from './index.ts'

type View = 'list' | 'form' | 'history' | 'executions'

export interface SchedulerPanelProps {
  onClose: () => void
  t: (key: keyof Dict) => string
  sessions?: SessionsService
  workspaces?: WorkspacesService
}

const CRON_RE = /^[0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+(\s+[0-9*,/\-?L#w]+)?$/

// Design tokens (single source; no raw hex anywhere else in this file).
const T = {
  text: 'var(--dsw-alias-label-primary)',
  text2: 'var(--dsw-alias-label-secondary)',
  text3: 'var(--dsw-alias-label-tertiary)',
  card: 'var(--dsw-alias-bg-layer-1)',
  surface: 'var(--dsw-alias-bg-layer-2)',
  border: 'var(--dsw-alias-border-l2)',
  accent: 'var(--dsw-alias-brand-primary)',
  success: 'var(--dsw-static-green-500)',
  danger: 'var(--dsw-alias-state-error-primary)',
  warn: 'var(--dsw-static-yellow-500)',
  hover: 'var(--dsw-alias-interactive-bg-hover)',
  font: 'var(--dsw-font-family)',
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: T.font, color: T.text, fontSize: 14, lineHeight: 1.5,
  },
  panel: {
    width: 720, maxWidth: '94vw', height: '80vh', display: 'flex', flexDirection: 'column',
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
    boxShadow: '0 24px 80px rgba(0,0,0,.45)', overflow: 'hidden',
  },
  tabBar: {
    display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0,
    borderBottom: `1px solid ${T.border}`, padding: '0 16px',
  },
  tab: {
    display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
    border: 'none', background: 'transparent', color: T.text2, fontSize: 13.5,
    cursor: 'pointer', fontFamily: T.font, marginBottom: -1,
    borderBottom: '2px solid transparent', transition: 'color .15s',
  },
  tabOn: { color: T.accent, borderBottomColor: T.accent, fontWeight: 500 },
  pagerBar: { flexShrink: 0, borderTop: `1px solid ${T.border}`, background: T.surface, padding: '12px 20px' },
  head: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${T.border}` },
  title: { fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 },
  sub: { color: T.text3, fontSize: 12 },
  spacer: { flex: 1 },
  body: { flex: 1, overflow: 'auto', padding: '16px 20px' },
  err: {
    display: 'flex', alignItems: 'center', gap: 8, background: 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)',
    border: `1px solid ${T.danger}`, color: T.danger, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13,
  },
  toolbar: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' },
  card: {
    border: `1px solid ${T.border}`, background: T.card, borderRadius: 12,
    padding: '14px 16px', marginBottom: 10,
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10 },
  name: { fontWeight: 600, fontSize: 14, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' },
  metaItem: { display: 'inline-flex', alignItems: 'center', gap: 5, color: T.text3, fontSize: 12 },
  cron: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', color: T.accent, fontSize: 12 },
  prompt: { color: T.text2, fontSize: 12.5, marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  actions: { display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`, alignItems: 'center' },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 13px',
    borderRadius: 999, border: `1px solid ${T.border}`, background: T.card, color: T.text,
    cursor: 'pointer', fontSize: 13, fontFamily: T.font, transition: 'background .15s,color .15s',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px',
    borderRadius: 999, border: 'none', background: T.accent, color: '#fff',
    cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: T.font,
  },
  btnDanger: {
    display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 13px',
    borderRadius: 999, border: `1px solid ${T.danger}`, background: 'transparent', color: T.danger,
    cursor: 'pointer', fontSize: 13, fontFamily: T.font,
  },
  iconBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
    borderRadius: 8, border: 'none', background: 'transparent', color: T.text3, cursor: 'pointer',
    transition: 'background .15s,color .15s',
  },
  input: {
    width: '100%', boxSizing: 'border-box', background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: '9px 12px', color: T.text, fontSize: 14, outline: 'none', fontFamily: T.font,
  },
  label: { display: 'block', fontSize: 13, color: T.text2, marginBottom: 6 },
  field: { marginBottom: 16 },
  hint: { marginTop: 6, fontSize: 12 },
  nextRun: { display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, color: T.text2 },
  seg: {
    display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px',
    borderRadius: 999, border: `1px solid ${T.border}`, background: 'transparent', color: T.text2,
    cursor: 'pointer', fontSize: 13, fontFamily: T.font, transition: 'background .15s,color .15s',
  },
  segOn: { background: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent)', borderColor: T.accent, color: T.accent, fontWeight: 500 },
  formCard: { maxWidth: 560, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 },
  foot: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  empty: { color: T.text3, textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 6, background: T.card },
}

function Pill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span style={{ ...S.pill, ...(ok ? { background: 'color-mix(in srgb, var(--dsw-static-green-500) 14%, transparent)', color: T.success } : { background: 'color-mix(in srgb, var(--dsw-alias-label-tertiary) 16%, transparent)', color: T.text3 }) }}>
      {children}
    </span>
  )
}

const TRIGGER_TYPES: TaskType[] = ['cron', 'once', 'interval']

export function SchedulerPanel({ onClose, t, sessions, workspaces }: SchedulerPanelProps) {
  const [view, setView] = useState<View>('list')
  const [tasks, setTasks] = useState<TaskView[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<TaskType>('cron')
  const [cron, setCron] = useState('')
  const [runAt, setRunAt] = useState('') // datetime-local (local)
  const [everyMinutes, setEveryMinutes] = useState(60)
  const [prompt, setPrompt] = useState('')
  const [cwd, setCwd] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [nextRun, setNextRun] = useState<string | null>(null)
  const [cronChecked, setCronChecked] = useState(false)
  const [upcoming, setUpcoming] = useState<string[]>([])
  const [allHistory, setAllHistory] = useState<HistoryEntry[]>([])
  const [execPage, setExecPage] = useState(0)
  const [execPageSize, setExecPageSize] = useState(25)
  const [histPage, setHistPage] = useState(0)
  const [histPageSize, setHistPageSize] = useState(25)
  const bodyRef = useRef<HTMLDivElement>(null)

  const taskNameById = useMemo(() => new Map(tasks.map((task) => [task.id, task.name])), [tasks])

  // Workspace options for the task form's working-directory select (host workspaces service).
  const cwdOptions = useMemo(() => {
    const items = workspaces?.list?.getSnapshot().items ?? []
    return items
      .map((item) => ({ path: item.path, title: item.title ?? item.path.split(/[\\/]/).filter(Boolean).pop() ?? item.path }))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [workspaces])

  const scrollTop = (): void => { bodyRef.current?.scrollTo({ top: 0 }) }

  /**
   * Open a session through the host sessions service, then close the panel so
   * the session is visible. Sessions live in a workspace (their cwd); when the
   * target session belongs to another workspace the host UI cannot render it
   * here, so we surface a clear message instead of silently landing on the
   * empty state.
   */
  const openSession = (sessionId: string): void => {
    if (sessions === undefined) {
      setError('宿主未提供会话服务 / sessions service unavailable')
      return
    }
    const snapshot = sessions.list?.getSnapshot()
    const cwd = snapshot?.byId[sessionId]?.cwd
    const wsItems = workspaces?.list?.getSnapshot().items ?? []
    if (cwd !== undefined) {
      const targetWs = wsItems.find((w) => w.path === cwd)
      if (targetWs === undefined) {
        setError(fmt(t('session.openUnregistered'), { path: cwd }))
        return
      }
      const currentId = snapshot?.current
      const currentWs = currentId === undefined ? undefined : wsItems.find((w) => w.path === snapshot?.byId[currentId]?.cwd)
      if (currentWs !== undefined && currentWs.workspaceId !== targetWs.workspaceId) {
        setError(fmt(t('session.openCrossWorkspace'), { path: targetWs.path }))
        return
      }
    }
    try {
      sessions.open(sessionId)
      onClose()
    } catch {
      setError('会话不存在或已被清理 / session not found')
    }
  }

  const reload = async (): Promise<void> => {
    try {
      const res = await api.listTasks()
      setTasks(res.tasks)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  useEffect(() => {
    void reload()
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Live next-run preview for the draft trigger config.
  useEffect(() => {
    let cancelled = false
    const load = async (): Promise<void> => {
      let next: string | null = null
      try {
        if (type === 'once' && runAt === '') {
          next = null
        } else {
          const params: { type: string; cron?: string; runAt?: string; everyMinutes?: number } = { type }
          if (type === 'cron') params.cron = cron
          else if (type === 'once') params.runAt = new Date(runAt).toISOString()
          else params.everyMinutes = everyMinutes
          const res = await api.previewSchedule(params)
          next = res.nextRun
        }
      } catch {
        next = null
      }
      if (!cancelled) setNextRun(next)
    }
    void load()
    return () => { cancelled = true }
  }, [type, cron, runAt, everyMinutes])

  const openNew = (): void => {
    setEditId(null); setName(''); setType('cron'); setCron(''); setRunAt(''); setEveryMinutes(60); setCwd(''); setPrompt(''); setEnabled(true); setError(null); setNextRun(null); setCronChecked(false); setUpcoming([]); setView('form')
  }
  const openEdit = (task: TaskView): void => {
    setEditId(task.id); setName(task.name); setType(task.type); setCron(task.cron); setRunAt(task.type === 'once' && task.runAt ? toLocalInput(task.runAt) : ''); setEveryMinutes(task.everyMinutes ?? 60); setCwd(task.cwd ?? ''); setPrompt(task.prompt); setEnabled(task.enabled); setError(null); setCronChecked(false); setUpcoming([]); setView('form')
  }
  const openHistory = async (task: TaskView): Promise<void> => {
    try {
      const res = await api.taskHistory(task.id)
      setHistory(res.history)
      setHistPage(0)
      setView('history')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }
  const reloadExecutions = async (): Promise<void> => {
    try {
      const res = await api.listHistory()
      setAllHistory(res.history)
      setExecPage(0)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }
  const openExecutions = async (): Promise<void> => {
    await reloadExecutions()
    setView('executions')
  }
  const save = async (): Promise<void> => {
    setBusy(true); setError(null)
    try {
      const input: TaskInput = { name, type, prompt, enabled }
      if (type === 'cron') input.cron = cron
      else if (type === 'once') input.runAt = new Date(runAt).toISOString()
      else input.everyMinutes = everyMinutes
      if (cwd.trim() !== '') input.cwd = cwd.trim()
      if (editId === null) await api.createTask(input)
      else await api.updateTask(editId, input)
      await reload()
      setView('list')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }
  const toggle = async (task: TaskView): Promise<void> => {
    try { await api.toggleTask(task.id, !task.enabled); await reload() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  const run = async (task: TaskView): Promise<void> => {
    try { await api.runTask(task.id); await reload() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  const remove = async (task: TaskView): Promise<void> => {
    if (!window.confirm(t('btn.confirmDelete'))) return
    try { await api.deleteTask(task.id); await reload() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  const cronOk = CRON_RE.test(cron.trim())
  const triggerValid = type === 'cron' ? cronOk : type === 'once' ? runAt !== '' : Number.isInteger(everyMinutes) && everyMinutes >= 1

  const checkCron = async (): Promise<void> => {
    setError(null)
    setCronChecked(true)
    try {
      const res = await api.previewSchedule({ type: 'cron', cron })
      setUpcoming(res.nextRuns ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setUpcoming([])
    }
  }

  // Pagination results shared by the scrollable body and the pinned pager bar.
  const execResult = view === 'executions' ? pageSlice(allHistory, execPage, execPageSize) : null
  const histResult = view === 'history' ? pageSlice(history, histPage, histPageSize) : null

  return (
    <div style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={S.panel}>
        <div style={S.head}>
          <span style={{ ...S.title, color: T.accent }}><IconClock size={17} /></span>
          <span style={S.title}>{t('panel.title')}</span>
          <span style={S.sub}>{t('panel.subtitle')}</span>
          <span style={S.spacer} />
          <button style={S.iconBtn} title={t('btn.close')} onClick={onClose}><IconCross /></button>
        </div>
        {(view === 'list' || view === 'executions') && (
          <div style={S.tabBar}>
            <button style={{ ...S.tab, ...(view === 'list' ? S.tabOn : {}) }} onClick={() => setView('list')}>{t('tab.tasks')}</button>
            <button style={{ ...S.tab, ...(view === 'executions' ? S.tabOn : {}) }} onClick={() => void openExecutions()}>{t('tab.executions')}</button>
          </div>
        )}
        <div style={S.body} ref={bodyRef}>
          {error !== null && <div style={S.err}><IconCross size={15} />{error}</div>}

          {view === 'list' && (
            <div>
              <div style={S.toolbar}>
                <button style={S.btnPrimary} onClick={openNew}><IconPlus size={15} />{t('btn.new')}</button>
                <button style={S.btn} onClick={() => void reload()}><IconRefresh size={15} />{t('btn.refresh')}</button>
              </div>
              {tasks.length === 0 ? (
                <div style={S.empty}>
                  <span style={{ color: T.text3 }}><IconClock size={28} /></span>
                  <div>{t('tasks.empty')}</div>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} style={S.card}>
                    <div style={S.cardTop}>
                      <div style={S.name} title={task.name}>{task.name}</div>
                      <Pill ok={task.enabled}>
                        <IconCheck size={12} />
                        {task.enabled ? t('status.enabled') : t('status.disabled')}
                      </Pill>
                    </div>
                    <div style={S.meta}>
                      <span style={S.metaItem}><IconClock size={13} /><span style={S.cron}>{triggerText(task, t)}</span></span>
                      <span style={S.metaItem}>{t('col.next')}：{task.enabled && task.nextRun !== null ? formatTime(task.nextRun) : t('next.unknown')}</span>
                      {task.cwd !== undefined && task.cwd !== '' && <span style={S.metaItem}>{t('form.cwd')}：{task.cwd}</span>}
                    </div>
                    <div style={S.prompt} title={task.prompt}>{task.prompt}</div>
                    <div style={S.actions}>
                      <button style={S.btn} onClick={() => openEdit(task)}><IconEdit size={14} />{t('btn.edit')}</button>
                      <button style={S.btn} onClick={() => void toggle(task)}>{task.enabled ? t('status.disabled') : t('status.enabled')}</button>
                      <button style={S.btn} onClick={() => void run(task)}><IconPlay size={13} />{t('btn.run')}</button>
                      <button style={S.btn} onClick={() => void openHistory(task)}><IconHistory size={14} />{t('btn.history')}</button>
                      <span style={S.spacer} />
                      <button style={S.iconBtn} title={t('btn.delete')} onClick={() => void remove(task)}><IconTrash size={15} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {view === 'executions' && (
            <div>
              <div style={S.toolbar}>
                <button style={S.btn} onClick={() => void reloadExecutions()}><IconRefresh size={15} />{t('btn.refresh')}</button>
                <span style={S.spacer} />
                <span style={{ ...S.sub, fontSize: 12 }}>{t('history.all.retention')}</span>
              </div>
              {allHistory.length === 0 ? (
                <div style={S.empty}>{t('history.empty')}</div>
              ) : (
                (execResult?.rows ?? []).map((entry, index) => (
                  <HistoryRow
                    key={`${entry.at}-${index}`}
                    entry={entry}
                    t={t}
                    name={taskNameById.get(entry.taskId) ?? entry.taskId.slice(0, 8)}
                    onOpenSession={openSession}
                  />
                ))
              )}
            </div>
          )}

          {view === 'form' && (
            <div style={S.formCard}>
              <div style={S.field}>
                <label style={S.label}>{t('form.type')}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {TRIGGER_TYPES.map((tp) => (
                    <button key={tp} style={{ ...S.seg, ...(type === tp ? S.segOn : {}) }} onClick={() => setType(tp)}>
                      {tp === 'cron' ? t('form.type.cron') : tp === 'once' ? t('form.type.once') : t('form.type.interval')}
                    </button>
                  ))}
                </div>
              </div>
              <div style={S.field}>
                <label style={S.label}>{t('form.name')} *</label>
                <input style={S.input} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('form.name')} />
              </div>
              <div style={S.field}>
                <label style={S.label}>{t('form.cwd')}</label>
                <select style={{ ...S.input, height: 38 }} value={cwd} onChange={(e) => setCwd(e.target.value)}>
                  <option value="">{t('form.cwdDefault')}</option>
                  {cwdOptions.map((o) => <option key={o.path} value={o.path} title={o.path}>{o.title}</option>)}
                </select>
                <div style={{ ...S.hint, color: T.text3 }}>{t('form.cwdHint')}</div>
              </div>
              {type === 'cron' && (
                <div style={S.field}>
                  <label style={S.label}>{t('form.cron')} *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...S.input, flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }} value={cron} onChange={(e) => { setCron(e.target.value); setCronChecked(false) }} placeholder={t('form.cronPlaceholder')} />
                    <button style={S.btn} onClick={() => void checkCron()}><IconCheck size={14} />{t('btn.validate')}</button>
                  </div>
                  <div style={{ ...S.hint, color: cron.trim() === '' ? T.text3 : (cronOk ? T.success : T.danger) }}>
                    {cron.trim() === '' ? t('form.cronPlaceholder') : cronOk ? t('form.cronValid') : t('form.cronInvalid')}
                  </div>
                  {cronChecked && cronOk && upcoming.length > 0 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: T.text2 }}>
                      <div style={{ marginBottom: 4, color: T.text3 }}>{t('form.upcoming')}：</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
                        {upcoming.map((iso) => <span key={iso}>{formatTime(iso)}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {type === 'once' && (
                <div style={S.field}>
                  <label style={S.label}>{t('form.runAt')} *</label>
                  <input type="datetime-local" style={S.input} value={runAt} onChange={(e) => setRunAt(e.target.value)} />
                </div>
              )}
              {type === 'interval' && (
                <div style={S.field}>
                  <label style={S.label}>{t('form.everyMinutes')} *</label>
                  <input type="number" min={1} style={S.input} value={everyMinutes} onChange={(e) => setEveryMinutes(Number(e.target.value) || 1)} />
                </div>
              )}
              <div style={S.field}>
                <label style={S.label}>{t('form.prompt')} *</label>
                <textarea style={{ ...S.input, minHeight: 96, resize: 'vertical', lineHeight: 1.5 }} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t('form.promptPlaceholder')} />
              </div>
              <div style={S.field}>
                <div style={S.nextRun}>
                  <IconClock size={13} />
                  <span>{t('form.nextRun')}：{triggerValid && nextRun !== null ? formatTime(nextRun) : '—'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                <span style={{ fontSize: 13, color: T.text2 }}>{t('form.enabled')}</span>
              </div>
              <div style={S.foot}>
                <button style={S.btn} onClick={() => setView('list')} disabled={busy}>{t('btn.cancel')}</button>
                <button style={S.btnPrimary} onClick={() => void save()} disabled={busy || name.trim() === '' || prompt.trim() === '' || !triggerValid}>
                  {t('btn.save')}
                </button>
              </div>
            </div>
          )}

          {view === 'history' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <button style={S.btn} onClick={() => setView('list')}><IconChevronLeft size={14} />{t('btn.back')}</button>
                <span style={{ ...S.sub, fontSize: 12 }}>{t('history.retention')}</span>
              </div>
              {history.length === 0 ? (
                <div style={S.empty}>{t('history.empty')}</div>
              ) : (
                (histResult?.rows ?? []).map((entry, index) => (
                  <HistoryRow key={`${entry.at}-${index}`} entry={entry} t={t} onOpenSession={openSession} />
                ))
              )}
            </div>
          )}
        </div>

        {(view === 'executions' && execResult !== null && allHistory.length > 0) && (
          <div style={S.pagerBar}>
            <Pager
              page={execResult.pageSafe}
              pages={execResult.pages}
              total={allHistory.length}
              pageSize={execPageSize}
              onPage={(p) => { setExecPage(p); scrollTop() }}
              onPageSize={(n) => { setExecPageSize(n); setExecPage(0); scrollTop() }}
              t={t}
            />
          </div>
        )}
        {(view === 'history' && histResult !== null && history.length > 0) && (
          <div style={S.pagerBar}>
            <Pager
              page={histResult.pageSafe}
              pages={histResult.pages}
              total={history.length}
              pageSize={histPageSize}
              onPage={(p) => { setHistPage(p); scrollTop() }}
              onPageSize={(n) => { setHistPageSize(n); setHistPage(0); scrollTop() }}
              t={t}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/** Shared history row used by both the executions list and the per-task history view. */
function HistoryRow({ entry, name, t, onOpenSession }: { entry: HistoryEntry; name?: ReactNode; t: (key: keyof Dict) => string; onOpenSession?: (sessionId: string) => void }) {
  const running = entry.status === 'running'
  const ok = entry.status === 'created'
  const fail = entry.status === 'failed'
  const iconColor = running ? T.accent : ok ? T.success : fail ? T.danger : T.warn
  const statusText = running
    ? t('status.running')
    : ok
      ? t('status.created')
      : fail
        ? `${t('status.failed')}${entry.error !== undefined ? `: ${entry.error}` : ''}`
        : t('status.skipped')
  return (
    <div style={S.row}>
      <span style={{ color: iconColor, display: 'inline-flex' }}>
        {running ? <IconClock size={14} /> : ok ? <IconCheck size={14} /> : fail ? <IconCross size={14} /> : <IconClock size={14} />}
      </span>
      {name !== undefined && (
        <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </span>
      )}
      <span style={{ ...S.sub, minWidth: 140 }}>{formatTime(entry.at)}</span>
      <span style={{ flex: 1, fontSize: 13 }}>{statusText}</span>
      <span style={{ ...S.sub, fontSize: 12, flexShrink: 0 }}>{entry.ms !== undefined ? `${entry.ms}ms` : '—'}</span>
      {!running && entry.sessionId !== undefined && onOpenSession !== undefined && (
        <button
          type="button"
          style={{ ...S.btn, height: 28, padding: '0 10px', fontSize: 12, flexShrink: 0, whiteSpace: 'nowrap' }}
          onClick={() => onOpenSession(entry.sessionId as string)}
        >
          {t('history.openSession')}
        </button>
      )}
    </div>
  )
}

/** Pagination bar: prev/next, page summary and a per-page size selector. */
function Pager({ page, pages, total, pageSize, onPage, onPageSize, t }: {
  page: number
  pages: number
  total: number
  pageSize: number
  onPage: (page: number) => void
  onPageSize: (size: number) => void
  t: (key: keyof Dict) => string
}) {
  if (total <= 0) return null
  const first = page <= 0
  const last = page >= pages - 1
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button style={{ ...S.btn, ...(first ? { opacity: 0.45, cursor: 'default' } : {}) }} disabled={first} onClick={() => onPage(page - 1)}>
        {t('pager.prev')}
      </button>
      <span style={{ fontSize: 12, color: T.text3, whiteSpace: 'nowrap' }}>
        {fmt(t('pager.summary'), { p: page + 1, n: pages, c: total })}
      </span>
      <button style={{ ...S.btn, ...(last ? { opacity: 0.45, cursor: 'default' } : {}) }} disabled={last} onClick={() => onPage(page + 1)}>
        {t('pager.next')}
      </button>
      <select
        aria-label={t('pager.pageSize')}
        value={pageSize}
        onChange={(e) => onPageSize(Number(e.target.value))}
        style={{ height: 32, borderRadius: 10, border: `1px solid ${T.border}`, background: T.card, color: T.text, padding: '0 8px', fontSize: 13, fontFamily: T.font }}
      >
        {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  )
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

/** Convert an ISO datetime to a `datetime-local` input value (local timezone). */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Human-readable trigger description for the list view. */
function triggerText(task: TaskView, t: (key: keyof Dict) => string): string {
  if (task.type === 'once') return `${t('type.once')} · ${task.runAt ? formatTime(task.runAt) : '—'}`
  if (task.type === 'interval') return `${t('type.interval')} · ${task.everyMinutes} min`
  return task.cron
}
