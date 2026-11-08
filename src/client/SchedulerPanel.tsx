/**
 * Scheduler panel: task list / create-edit form / execution history. Rendered
 * inline as the Settings → 定时任务 section (`embedded`), or as a standalone
 * modal when `embedded` is false. Styled only with host aliases: a neutral
 * paper surface, black ticks, one cobalt signal (--dsw-static-deepseek-500)
 * for the scale, focus rings and the active tab. No emoji, no gradients.
 *
 * Trigger types: cron (expression), once (specific time), interval (every N min).
 * The form previews the next run time live via /dsh-scheduler/preview.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Dict } from './locales.ts'
import * as api from './api.ts'
import type { ExecutionKind, HistoryEntry, TaskInput, TaskType, TaskView, WorkflowAttachmentRef, WorkflowChoice } from './api.ts'
import { IconCheck, IconChevronDown, IconChevronLeft, IconClock, IconCross, IconEdit, IconHistory, IconPlay, IconPlus, IconRefresh } from './icons.tsx'
import { PAGE_SIZES, pageSlice, fmt } from './pager.ts'
import type { SessionsService, UiWorkspaceService, WorkspacesService } from './index.ts'

type View = 'list' | 'form' | 'history' | 'executions'

export interface SchedulerPanelProps {
  /** Close/leave the panel. Optional: an embedded panel only closes the Settings dialog. */
  onClose?: () => void
  /** Render inline (Settings section) instead of as a full-window modal. */
  embedded?: boolean
  t: (key: keyof Dict) => string
  sessions?: SessionsService
  workspaces?: WorkspacesService
  uiWorkspace?: UiWorkspaceService
  /** Late-bound navigation lookup: the service may register after this entry mounts. */
  resolveUiWorkspace?: () => UiWorkspaceService | undefined
  /** Visible service names, shown only when navigation is genuinely unavailable. */
  describeContext?: () => string
}

const CRON_RE = /^[0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+ [0-9*,/\-?L#w]+(\s+[0-9*,/\-?L#w]+)?$/
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Semantic aliases: every colour derives from a host token (no raw palette).
const T = {
  bg: 'var(--dsw-alias-bg-base)',
  layer: 'var(--dsw-alias-bg-layer-1)',
  text: 'var(--dsw-alias-label-primary)',
  text2: 'var(--dsw-alias-label-secondary)',
  hairline: 'color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent)',
  strong: 'color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)',
  surface: 'color-mix(in srgb, var(--dsw-alias-label-primary) 3%, var(--dsw-alias-bg-layer-1))',
  surfaceHover: 'color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1))',
  tick: 'color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent)',
  signal: 'var(--dsw-static-deepseek-500)',
  primary: 'var(--dsw-alias-brand-primary)',
  onPrimary: 'var(--dsw-alias-bg-base)',
  success: 'var(--dsw-static-green-500)',
  danger: 'var(--dsw-alias-state-error-primary)',
  warn: 'var(--dsw-alias-state-warn-primary)',
  font: 'var(--dsw-font-family)',
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: T.font, color: T.text, fontSize: 14, lineHeight: '20px',
  },
  panel: {
    width: 720, maxWidth: '94vw', height: '80vh', display: 'flex', flexDirection: 'column',
    background: T.layer, border: `1px solid ${T.hairline}`, borderRadius: 16,
    boxShadow: '0 24px 64px rgba(0,0,0,.28)', overflow: 'hidden',
  },
  embedRoot: {
    display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, width: '100%',
    fontFamily: T.font, color: T.text, fontSize: 14, lineHeight: '20px', boxSizing: 'border-box',
  },
  embedPanel: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' },
  head: {
    display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    padding: '0 0 16px', borderBottom: `1px solid ${T.hairline}`,
  },
  embedHead: {
    display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    padding: '0 0 16px', borderBottom: `1px solid ${T.hairline}`,
  },
  headTitleCol: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 },
  titleIcon: { color: T.text, display: 'inline-flex', flexShrink: 0 },
  title: { fontSize: 16, lineHeight: '22px', fontWeight: 500, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sub: { color: T.text2, fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  spacer: { flex: 1 },
  tabBar: {
    display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0,
    borderBottom: `1px solid ${T.hairline}`, padding: '0 20px',
  },
  embedTabBar: {
    display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0,
    borderBottom: `1px solid ${T.hairline}`, padding: 0,
  },
  body: { flex: 1, overflow: 'auto', padding: '16px 20px' },
  embedBody: { flex: 1, overflow: 'auto', padding: '16px 0 0' },
  footer: {
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '12px 20px', borderTop: `1px solid ${T.hairline}`, background: T.layer,
  },
  embedFooter: {
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '12px 0 0', borderTop: `1px solid ${T.hairline}`,
  },
  pagerBar: { flexShrink: 0, borderTop: `1px solid ${T.hairline}`, padding: '12px 20px' },
  embedPagerBar: { flexShrink: 0, borderTop: `1px solid ${T.hairline}`, padding: '12px 0 0' },
  pager: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  pagerGroup: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  pagerInfo: { fontSize: 12, lineHeight: '16px', color: T.text2, whiteSpace: 'nowrap' },
  toolbar: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  metaText: { color: T.text2, fontSize: 12, lineHeight: '16px' },
  banner: {
    display: 'flex', alignItems: 'center', gap: 8,
    borderRadius: 8, padding: '8px 12px', marginBottom: 16,
    fontSize: 13, lineHeight: '18px', color: T.text, border: '1px solid',
  },
  taskList: { background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 12, overflow: 'hidden' },
  taskRow: { display: 'flex', flexDirection: 'column', gap: 8, padding: 16, color: T.text },
  taskHead: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  taskIdentity: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 },
  taskName: { fontSize: 14, lineHeight: '20px', fontWeight: 500, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  taskCwd: { color: T.text2, fontSize: 12, lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  taskActions: {
    display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
    marginTop: 4, paddingTop: 12, borderTop: `1px solid ${T.hairline}`,
  },
  taskActionsEnd: { marginLeft: 'auto' },
  triggerMono: {
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum" 1',
    fontSize: 12, lineHeight: '16px', color: T.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  summary: {
    margin: 0, color: T.text2, fontSize: 13, lineHeight: '18px',
    display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', overflowWrap: 'anywhere',
  },
  dayScale: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 },
  dayScaleLabel: { color: T.text2, fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  dayTrack: { position: 'relative', height: 16, marginTop: 2, marginBottom: 2 },
  dayBaseline: { position: 'absolute', left: 0, right: 0, top: 6, height: 1, background: T.hairline },
  dayTick: { position: 'absolute', top: 0, width: 1, transform: 'translateX(-50%)' },
  dayLabels: { display: 'flex', justifyContent: 'space-between', color: T.text2, fontSize: 12, lineHeight: '16px' },
  dayMarkerWrap: {
    position: 'absolute', top: 0, height: 16, width: 0,
    transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  },
  dayMarkerBar: { width: 2, height: 8, borderRadius: 1, background: T.signal },
  dayMarkerDot: { width: 6, height: 6, borderRadius: '50%', background: T.signal, boxShadow: `0 0 0 2px ${T.surface}` },
  empty: { padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' },
  emptyTitle: { color: T.text, fontSize: 14, lineHeight: '20px', fontWeight: 500 },
  emptyHint: { color: T.text2, fontSize: 13, lineHeight: '18px', maxWidth: 320 },
  emptyAction: { marginTop: 8 },
  logSurface: { position: 'relative', background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 12, padding: '4px 0', overflow: 'hidden' },
  rail: { position: 'absolute', left: 19, top: 12, bottom: 12, width: 1, background: T.hairline, zIndex: 2, pointerEvents: 'none' },
  logRow: { position: 'relative', display: 'grid', columnGap: 12, alignItems: 'center', minHeight: 44, padding: '8px 16px 8px 40px', color: T.text, zIndex: 1 },
  logDot: { position: 'absolute', left: 16, top: '50%', width: 7, height: 7, marginTop: -3.5, borderRadius: '50%', zIndex: 3, boxShadow: `0 0 0 2px ${T.surface}` },
  logName: { fontSize: 13, lineHeight: '18px', color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logTime: {
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum" 1',
    fontSize: 12, lineHeight: '16px', color: T.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  logStatus: { fontSize: 12, lineHeight: '16px', color: T.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logDuration: { fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 12, lineHeight: '16px', color: T.text2, textAlign: 'right' },
  logActions: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, flexShrink: 0 },
  group: { paddingTop: 24, marginTop: 24, borderTop: `1px solid ${T.hairline}` },
  groupFirst: { paddingTop: 0, marginTop: 0, borderTop: 'none' },
  groupTitle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, lineHeight: '18px', fontWeight: 500, color: T.text, marginBottom: 16 },
  groupTick: { width: 4, height: 12, borderRadius: 1, background: T.signal, display: 'inline-block', flexShrink: 0 },
  field: { marginBottom: 20 },
  fieldLast: { marginBottom: 0 },
  label: { display: 'block', fontSize: 13, lineHeight: '18px', fontWeight: 500, color: T.text2, marginBottom: 8 },
  required: { color: T.text, fontWeight: 500 },
  hint: { marginTop: 8, fontSize: 12, lineHeight: '16px', color: T.text2 },
  errorText: { marginTop: 8, fontSize: 12, lineHeight: '16px', color: T.danger },
  inputRow: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  selectWrap: { position: 'relative', width: '100%' },
  selectChevron: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.text2, pointerEvents: 'none', display: 'inline-flex' },
  segRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  upcoming: { marginTop: 8 },
  upcomingLabel: { color: T.text2, fontSize: 12, lineHeight: '16px', marginBottom: 4 },
  upcomingList: { display: 'flex', flexDirection: 'column', gap: 4, fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 12, lineHeight: '16px', color: T.text2 },
  nextValue: { fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 14, lineHeight: '20px', color: T.text },
  nextEmpty: { fontFamily: MONO, fontSize: 13, lineHeight: '18px', color: T.text2 },
  details: { marginTop: 12, fontSize: 13, lineHeight: '18px', color: T.text2 },
  detailSummary: { cursor: 'pointer', width: 'fit-content', color: T.text2 },
  detailText: { margin: '8px 0 0' },
  chipName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 },
  pathRow: { display: 'grid', gridTemplateColumns: 'minmax(96px, 140px) minmax(0, 1fr) auto', gap: 8, alignItems: 'center', marginTop: 8 },
  pathName: { fontSize: 12, lineHeight: '16px', color: T.text2, overflow: 'hidden', textOverflow: 'ellipsis' },
  code: { fontFamily: MONO, fontSize: 12, lineHeight: '16px', color: T.text2, whiteSpace: 'nowrap' },
  switchLabel: { fontSize: 13, lineHeight: '18px', color: T.text2 },
}

/** Interaction states that inline style objects cannot express. Scoped to this panel. */
const PANEL_CSS = `
.dss-root, .dss-root *, .dss-root *::before, .dss-root *::after { box-sizing: border-box; }
.dss-root button, .dss-root input, .dss-root select, .dss-root textarea, .dss-root summary { font-family: inherit; outline: none; }
.dss-root button:focus-visible, .dss-root input:focus-visible, .dss-root select:focus-visible,
.dss-root textarea:focus-visible, .dss-root summary:focus-visible, .dss-root [role="switch"]:focus-visible {
  outline: 2px solid var(--dsw-static-deepseek-500); outline-offset: 2px;
}
.dss-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid transparent;
  background: transparent; color: var(--dsw-alias-label-primary);
  font-size: 13px; line-height: 18px; font-weight: 400; white-space: nowrap; cursor: pointer;
  transition: background-color .12s ${EASE}, border-color .12s ${EASE}, color .12s ${EASE}, opacity .12s ${EASE}, transform .12s ${EASE};
}
.dss-btn:active:not(:disabled) { transform: scale(.98); }
.dss-btn:disabled { opacity: .4; cursor: default; }
.dss-btn-sm { height: 28px; padding: 0 8px; border-radius: 6px; font-size: 13px; }
.dss-btn-field { height: 36px; padding: 0 12px; }
.dss-btn-primary {
  background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base);
  border-color: transparent; font-weight: 500;
}
.dss-btn-primary:hover:not(:disabled) { opacity: .9; }
.dss-btn-primary:disabled {
  opacity: 1; cursor: default;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);
  color: var(--dsw-alias-label-secondary);
}
.dss-btn-outline {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
  color: var(--dsw-alias-label-primary); font-weight: 500;
}
.dss-btn-outline:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); }
.dss-btn-ghost { color: var(--dsw-alias-label-secondary); }
.dss-btn-ghost:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary);
}
.dss-btn-danger {
  --dss-danger-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 76%, var(--dsw-alias-label-primary));
  color: var(--dss-danger-ink);
}
.dss-btn-danger:hover:not(:disabled) {
  color: var(--dss-danger-ink);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
}
.dss-icon-btn { width: 32px; height: 32px; padding: 0; border-radius: 8px; color: var(--dsw-alias-label-secondary); }
.dss-icon-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary);
}
.dss-seg {
  display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);
  border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary);
  font-size: 13px; line-height: 18px; cursor: pointer;
  transition: background-color .12s ${EASE}, border-color .12s ${EASE}, color .12s ${EASE};
}
.dss-seg:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); color: var(--dsw-alias-label-primary); }
.dss-seg[aria-pressed="true"] {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
  color: var(--dsw-alias-label-primary); font-weight: 500;
}
.dss-tab {
  display: inline-flex; align-items: center; height: 32px; padding: 0 2px; margin-bottom: -1px;
  border: 0; border-bottom: 2px solid transparent; background: transparent;
  color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 18px; cursor: pointer;
  transition: color .12s ${EASE}, border-color .12s ${EASE};
}
.dss-tab:hover { color: var(--dsw-alias-label-primary); }
.dss-tab[aria-current="page"] {
  color: var(--dsw-alias-label-primary); border-bottom-color: var(--dsw-static-deepseek-500); font-weight: 500;
}
.dss-input {
  width: 100%; height: 36px; padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 20px;
  transition: border-color .12s ${EASE}, background-color .12s ${EASE};
}
.dss-input:hover { border-color: color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent); }
.dss-input:focus { border-color: var(--dsw-static-deepseek-500); }
.dss-input::placeholder { color: var(--dsw-alias-label-secondary); }
.dss-input:disabled { opacity: .4; cursor: default; }
textarea.dss-input { height: auto; min-height: 96px; padding: 8px 12px; resize: vertical; }
select.dss-input { appearance: none; -webkit-appearance: none; padding-right: 36px; cursor: pointer; }
select.dss-select-sm { height: 32px; padding: 0 28px 0 8px; font-size: 13px; }
.dss-root input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
.dss-root input[type="number"]::-webkit-outer-spin-button,
.dss-root input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.dss-row { transition: background-color .12s ${EASE}; }
.dss-row:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1)); }
.dss-switch {
  position: relative; display: inline-block; width: 36px; height: 20px; flex: none;
  padding: 0; border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
  border-radius: 10px; background: transparent; cursor: pointer;
  transition: background-color .12s ${EASE}, border-color .12s ${EASE};
}
.dss-switch::after {
  content: ""; position: absolute; left: 1px; top: 1px; width: 16px; height: 16px; border-radius: 50%;
  background: var(--dsw-alias-label-secondary);
  transition: transform .12s ${EASE}, background-color .12s ${EASE};
}
.dss-switch[aria-checked="true"] {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
}
.dss-switch[aria-checked="true"]::after {
  transform: translateX(16px);
  background: var(--dsw-alias-bg-base);
}
.dss-switch:hover { border-color: color-mix(in srgb, var(--dsw-alias-label-primary) 36%, transparent); }
.dss-chip {
  display: inline-flex; align-items: center; gap: 4px; max-width: 100%;
  padding: 2px 2px 2px 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary);
  font-size: 12px; line-height: 16px;
}
.dss-chip-remove {
  display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px;
  padding: 0; border: 0; border-radius: 4px; background: transparent;
  color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.dss-chip-remove:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); color: var(--dsw-alias-label-primary); }
.dss-view { animation: dss-view-in .16s ${EASE} both; }
@keyframes dss-view-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .dss-root *, .dss-root *::before, .dss-root *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important;
  }
  .dss-btn:active:not(:disabled) { transform: none; }
  .dss-view { animation: none !important; }
}
`

const TRIGGER_TYPES: TaskType[] = ['cron', 'once', 'interval']

export function SchedulerPanel({ onClose, embedded = false, t, sessions, workspaces, uiWorkspace, resolveUiWorkspace, describeContext }: SchedulerPanelProps) {
  const [view, setView] = useState<View>('list')
  const [tasks, setTasks] = useState<TaskView[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  /** Display-only: the task whose history is open, used for the history title. */
  const [histTaskName, setHistTaskName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null)
  const [runNotice, setRunNotice] = useState<{ message: string; workflowTaskId?: string } | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<TaskType>('cron')
  const [cron, setCron] = useState('')
  const [runAt, setRunAt] = useState('') // datetime-local (local)
  const [everyMinutes, setEveryMinutes] = useState(60)
  const [prompt, setPrompt] = useState('')
  const [executionKind, setExecutionKind] = useState<ExecutionKind>('prompt-session')
  const [workflows, setWorkflows] = useState<WorkflowChoice[]>([])
  const [workflowId, setWorkflowId] = useState('')
  const [workflowTitle, setWorkflowTitle] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [workflowStoryCode, setWorkflowStoryCode] = useState('')
  /** File-typed workflow inputs given by path (declared parameter name → path). */
  const [workflowPathInputs, setWorkflowPathInputs] = useState<Record<string, string>>({})
  /**
   * Attachments uploaded from the browser and persisted by the scheduler. Unlike the path
   * fields above these are snapshots handed to every fire, and they need no workflow
   * declaration (mirrors the workflow plugin's built-in attachments).
   */
  const [workflowAttachments, setWorkflowAttachments] = useState<WorkflowAttachmentRef[]>([])
  const [attaching, setAttaching] = useState(0)
  const [attachError, setAttachError] = useState<string | null>(null)
  const attachInputRef = useRef<HTMLInputElement | null>(null)
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
   * Open a session through the host's workspace navigation service.
   *
   * DSH 0.2 moved session selection out of the `sessions` contract into
   * `uiWorkspace.openSession(target)`; the 0.1.x selection method no longer
   * exists, and calling it inside a try/catch surfaced a misleading
   * "session not found" instead of navigating.
   *
   * Sessions live in a workspace (their cwd); when the target session belongs
   * to an unregistered workspace the host UI cannot render it here, so we
   * surface a clear message instead of silently landing on the empty state.
   */
  const openSession = (sessionId: string): void => {
    // Read the service at click time: it may register after this entry mounts.
    const nav = resolveUiWorkspace?.() ?? uiWorkspace
    if (nav === undefined) {
      const visible = describeContext?.() ?? ''
      setError(`宿主未提供会话导航服务 / session navigation service unavailable${visible ? `（可见服务：${visible}）` : ''}`)
      return
    }
    const cwd = sessions?.list?.getSnapshot()?.byId[sessionId]?.cwd
    const wsItems = workspaces?.list?.getSnapshot().items ?? []
    if (cwd !== undefined) {
      const targetWs = wsItems.find((w) => w.path === cwd)
      if (targetWs === undefined) {
        setError(fmt(t('session.openUnregistered'), { path: cwd }))
        return
      }
    }
    try {
      nav.openSession(sessionId)
      onClose?.()
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
    // Embedded in the Settings dialog, which owns Escape itself: closing the
    // Settings dialog there must stay one layer, not two.
    if (embedded === true) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose?.()
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

  const loadWorkflows = async (): Promise<void> => {
    try { const result = await api.listWorkflows(); setWorkflows(result.workflows) }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  const openNew = (): void => {
    setEditId(null); setName(''); setType('cron'); setCron(''); setRunAt(''); setEveryMinutes(60); setCwd(''); setPrompt(''); setExecutionKind('prompt-session'); setWorkflowId(''); setWorkflowTitle(''); setWorkflowDescription(''); setWorkflowStoryCode(''); setWorkflowPathInputs({}); setWorkflowAttachments([]); setAttachError(null); setEnabled(true); setError(null); setRunNotice(null); setNextRun(null); setCronChecked(false); setUpcoming([]); setView('form')
  }
  const openEdit = (task: TaskView): void => {
    setEditId(task.id); setName(task.name); setType(task.type); setCron(task.cron); setRunAt(task.type === 'once' && task.runAt ? toLocalInput(task.runAt) : ''); setEveryMinutes(task.everyMinutes ?? 60); setCwd(task.cwd ?? ''); setPrompt(task.prompt ?? ''); setExecutionKind(task.executionKind); setWorkflowId(task.workflowId ?? ''); setWorkflowTitle(task.workflowTitle ?? ''); setWorkflowDescription(task.workflowDescription ?? ''); setWorkflowStoryCode(task.workflowStoryCode ?? ''); setWorkflowPathInputs(task.workflowPathInputs ?? {}); setWorkflowAttachments(task.workflowAttachments ?? []); setAttachError(null); if (task.executionKind === 'knj-workflow') void loadWorkflows(); setEnabled(task.enabled); setError(null); setRunNotice(null); setCronChecked(false); setUpcoming([]); setView('form')
  }

  /** Human-readable byte size for attachment chips. */
  function formatBytes(size: number): string {
    if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
    if (size >= 1024) return `${Math.round(size / 1024)} KB`
    return `${size} B`
  }

  /** File → base64 in chunks (large files must not blow the argument stack). */
  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer)
      let binary = ''
      const CHUNK = 0x8000
      for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as unknown as number[])
      resolve(btoa(binary))
    }
    reader.readAsArrayBuffer(file)
  })

  /**
   * Upload the chosen files into the scheduler's own store, appending the returned refs.
   * Files are read from the event target **synchronously** by the caller: holding a live
   * FileList across the async boundary loses it once the input value is reset.
   */
  const uploadAttachments = async (files: File[]): Promise<void> => {
    if (files.length === 0) return
    setAttachError(null)
    setAttaching((n) => n + files.length)
    for (const file of files) {
      try {
        const dataBase64 = await fileToBase64(file)
        const ref = await api.uploadAttachment(file.name, dataBase64)
        setWorkflowAttachments((list) => [...list, ref])
      } catch (e) {
        setAttachError(`${file.name}：${e instanceof Error ? e.message : String(e)}`)
      } finally {
        setAttaching((n) => Math.max(0, n - 1))
      }
    }
  }

  const onAttachmentInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const picked = event.currentTarget.files === null ? [] : Array.from(event.currentTarget.files)
    event.currentTarget.value = ''
    void uploadAttachments(picked)
  }

  const removeAttachment = (index: number): void => {
    setWorkflowAttachments((list) => list.filter((_, i) => i !== index))
  }
  const openHistory = async (task: TaskView): Promise<void> => {
    try {
      const res = await api.taskHistory(task.id)
      setHistory(res.history)
      setHistPage(0)
      setHistTaskName(task.name)
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
      const input: TaskInput = { name, type, executionKind, enabled }
      if (executionKind === 'knj-workflow') {
        input.workflowId = workflowId
        // 标题可留空：workflow 插件会按描述派生（与「新建任务」表单一致），留空时不提交该字段
        if (workflowTitle.trim() !== '') input.workflowTitle = workflowTitle.trim()
        input.workflowDescription = workflowDescription
        input.workflowStoryCode = workflowStoryCode
        // 附件（快照，持久化在调度器自己目录里，每次触发重新交给 workflow 插件）
        input.workflowAttachments = workflowAttachments
        // 只提交非空路径（参数名 → 路径）；工作流侧在启动前按 cwd 解析成绝对路径并校验存在
        const paths: Record<string, string> = {}
        for (const decl of selectedWorkflowFileInputs) {
          const value = (workflowPathInputs[decl.name] ?? '').trim()
          if (value !== '') paths[decl.name] = value
        }
        if (Object.keys(paths).length > 0) input.workflowPathInputs = paths
      } else {
        input.prompt = prompt
      }
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
    if (runningTaskId !== null) return
    setRunningTaskId(task.id)
    setRunNotice(null)
    setError(null)
    try {
      const response = await api.runTask(task.id)
      if (response.result.status !== 'created') {
        throw new Error(response.result.error ?? t('error.run'))
      }
      setRunNotice({
        message: task.executionKind === 'knj-workflow' ? t('run.workflowStarted') : t('run.promptStarted'),
        ...(response.result.workflowTaskId ? { workflowTaskId: response.result.workflowTaskId } : {}),
      })
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunningTaskId(null)
    }
  }
  const remove = async (task: TaskView): Promise<void> => {
    if (!window.confirm(t('btn.confirmDelete'))) return
    try { await api.deleteTask(task.id); await reload() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  const cronOk = CRON_RE.test(cron.trim())
  const triggerValid = type === 'cron' ? cronOk : type === 'once' ? runAt !== '' : Number.isInteger(everyMinutes) && everyMinutes >= 1
  // 停用任务的预演只保留灰色刻度，不把 nextRun 画成即将触发。
  const timesForScale = upcoming.length > 0 ? upcoming : nextRun !== null ? [nextRun] : []
  // 选中工作流声明的「文件」入参：表单据此渲染路径字段、并在提交前要求必填项非空
  const selectedWorkflowFileInputs = (workflows.find((workflow) => workflow.id === workflowId)?.inputs ?? []).filter((decl) => decl.type === 'file')
  const missingRequiredPaths = selectedWorkflowFileInputs.filter((decl) => decl.required && (workflowPathInputs[decl.name] ?? '').trim() === '')
  const executionValid = executionKind === 'knj-workflow'
    ? workflowId.trim() !== '' && workflowTitle.trim() !== '' && cwd.trim() !== '' && missingRequiredPaths.length === 0
    : prompt.trim() !== ''

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
    <>
      <style>{PANEL_CSS}</style>
      <div
        className="dss-root"
        style={embedded ? S.embedRoot : S.overlay}
        onClick={embedded ? undefined : (e) => { if (e.target === e.currentTarget) onClose?.() }}
      >
        <div
          style={embedded ? S.embedPanel : S.panel}
          role={embedded ? undefined : 'dialog'}
          aria-modal={embedded ? undefined : true}
          aria-label={t('panel.title')}
        >
          <div style={embedded ? S.embedHead : S.head}>
            {(view === 'form' || view === 'history') ? (
              <>
                <button type="button" className="dss-btn dss-icon-btn" aria-label={t('btn.back')} title={t('btn.back')} onClick={() => setView('list')}>
                  <IconChevronLeft />
                </button>
                <div style={S.headTitleCol}>
                  <span style={S.title} title={view === 'history' && histTaskName !== '' ? fmt(t('history.forTask'), { name: histTaskName }) : undefined}>
                    {view === 'form'
                      ? (editId === null ? t('form.title.new') : t('form.title.edit'))
                      : (histTaskName !== '' ? fmt(t('history.forTask'), { name: histTaskName }) : t('history.title'))}
                  </span>
                </div>
                {view === 'history' && <span style={S.metaText}>{t('history.retention')}</span>}
                {!embedded && (
                  <button type="button" className="dss-btn dss-icon-btn" aria-label={t('btn.close')} title={t('btn.close')} onClick={onClose}>
                    <IconCross />
                  </button>
                )}
              </>
            ) : (
              <>
                <span style={S.titleIcon}><IconClock /></span>
                <div style={S.headTitleCol}>
                  <span style={S.title}>{t('panel.title')}</span>
                  <span style={S.sub}>{t('panel.subtitle')}</span>
                </div>
                {!embedded && (
                  <button type="button" className="dss-btn dss-icon-btn" aria-label={t('btn.close')} title={t('btn.close')} onClick={onClose}>
                    <IconCross />
                  </button>
                )}
              </>
            )}
          </div>

          {(view === 'list' || view === 'executions') && (
            <div style={embedded ? S.embedTabBar : S.tabBar}>
              <button type="button" aria-current={view === 'list' ? 'page' : undefined} className="dss-tab" onClick={() => setView('list')}>
                {t('tab.tasks')}
              </button>
              <button type="button" aria-current={view === 'executions' ? 'page' : undefined} className="dss-tab" onClick={() => void openExecutions()}>
                {t('tab.executions')}
              </button>
            </div>
          )}

          <div style={embedded ? S.embedBody : S.body} ref={bodyRef}>
            {error !== null && (
              <div style={{ ...S.banner, borderColor: 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, transparent)', background: 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 6%, transparent)' }}>
                <span style={{ color: T.danger, display: 'inline-flex' }}><IconCross /></span>
                <span style={{ flex: 1, minWidth: 0 }}>{error}</span>
              </div>
            )}
            {runNotice !== null && (
              <div style={{ ...S.banner, borderColor: 'color-mix(in srgb, var(--dsw-static-green-500) 35%, transparent)', background: 'color-mix(in srgb, var(--dsw-static-green-500) 6%, transparent)' }}>
                <span style={{ color: T.success, display: 'inline-flex' }}><IconCheck /></span>
                <span style={{ flex: 1, minWidth: 0 }}>{runNotice.message}</span>
                {runNotice.workflowTaskId !== undefined && (
                  <button
                    type="button"
                    className="dss-btn dss-btn-sm dss-btn-ghost"
                    onClick={() => window.dispatchEvent(new CustomEvent('dsh-knj-workflow:open-task', { detail: { taskId: runNotice.workflowTaskId } }))}
                  >
                    {t('history.openWorkflowTask')}
                  </button>
                )}
              </div>
            )}

            {view === 'list' && (
              <div key="list" className="dss-view">
                <div style={S.toolbar}>
                  {tasks.length > 0 && (
                    <button type="button" className="dss-btn dss-btn-primary" onClick={openNew}><IconPlus />{t('btn.new')}</button>
                  )}
                  <button type="button" className="dss-btn dss-btn-ghost" onClick={() => void reload()}><IconRefresh />{t('btn.refresh')}</button>
                </div>
                {tasks.length === 0 ? (
                  <EmptyState
                    dial
                    title={t('tasks.empty')}
                    hint={t('tasks.emptyHint')}
                    action={<button type="button" className="dss-btn dss-btn-primary" onClick={openNew}><IconPlus />{t('btn.new')}</button>}
                  />
                ) : (
                  <div style={S.taskList}>
                    {tasks.map((task, index) => {
                      const workflow = task.executionKind === 'knj-workflow'
                      const taskSummary = workflow
                        ? (task.workflowTitle !== undefined && task.workflowTitle !== '' ? task.workflowTitle : '—')
                        : (task.prompt !== undefined && task.prompt !== '' ? task.prompt : '—')
                      return (
                        <div
                          key={task.id}
                          className="dss-row"
                          style={{ ...S.taskRow, ...(index > 0 ? { borderTop: `1px solid ${T.hairline}` } : {}) }}
                        >
                          <div style={S.taskHead}>
                            <div style={S.taskIdentity}>
                              <span style={S.taskName} title={task.name}>{task.name}</span>
                              {task.cwd !== undefined && task.cwd !== '' && (
                                <span style={S.taskCwd} title={task.cwd}>{t('form.cwd')}：{baseName(task.cwd)}</span>
                              )}
                            </div>
                            <Switch
                              checked={task.enabled}
                              onChange={() => void toggle(task)}
                              label={`${task.name} · ${t('form.enabled')}`}
                            />
                          </div>
                          <div style={S.triggerMono}>{triggerText(task, t)}</div>
                          <DayScale
                            times={task.enabled && task.nextRun !== null ? [task.nextRun] : []}
                            enabled={task.enabled}
                            label={!task.enabled
                              ? t('history.disabledTask')
                              : task.nextRun !== null
                                ? `${t('list.next')} ${fmtSchedule(task.nextRun)}`
                                : t('form.nextRunEmpty')}
                          />
                          <p style={S.summary} title={taskSummary}>{taskSummary}</p>
                          <div style={S.taskActions}>
                            <button type="button" className="dss-btn dss-btn-sm dss-btn-ghost" onClick={() => openEdit(task)}><IconEdit />{t('btn.edit')}</button>
                            <button
                              type="button"
                              className="dss-btn dss-btn-sm dss-btn-outline"
                              style={runningTaskId === task.id ? { opacity: 0.65 } : undefined}
                              onClick={() => void run(task)}
                              disabled={runningTaskId !== null}
                            >
                              <IconPlay />{runningTaskId === task.id ? t('run.pending') : t('btn.run')}
                            </button>
                            <button type="button" className="dss-btn dss-btn-sm dss-btn-ghost" onClick={() => void openHistory(task)}><IconHistory />{t('btn.history')}</button>
                            <span style={S.taskActionsEnd} />
                            <button type="button" className="dss-btn dss-btn-sm dss-btn-danger" onClick={() => void remove(task)}>{t('btn.delete')}</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {view === 'executions' && (
              <div key="executions" className="dss-view">
                <div style={S.toolbar}>
                  <button type="button" className="dss-btn dss-btn-ghost" onClick={() => void reloadExecutions()}><IconRefresh />{t('btn.refresh')}</button>
                  <span style={S.spacer} />
                  <span style={S.metaText}>{t('history.all.retention')}</span>
                </div>
                {allHistory.length === 0 ? (
                  <EmptyState title={t('history.empty')} hint={t('history.emptyHint')} />
                ) : (
                  <div style={S.logSurface}>
                    <div style={S.rail} aria-hidden />
                    {(execResult?.rows ?? []).map((entry, index) => (
                      <HistoryRow
                        key={`${entry.at}-${index}`}
                        entry={entry}
                        t={t}
                        showName
                        name={taskNameById.get(entry.taskId) ?? entry.taskId.slice(0, 8)}
                        divider={index > 0}
                        onOpenSession={openSession}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'form' && (
              <div key="form" className="dss-view">
                <section>
                  <div style={S.groupTitle}><span style={S.groupTick} aria-hidden />{t('form.group.task')}</div>
                  <div style={S.field}>
                    <div style={S.label}>{t('form.name')}<span style={S.required}> *</span></div>
                    <input className="dss-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('form.namePlaceholder')} aria-label={t('form.name')} />
                  </div>
                </section>

                <section style={S.group}>
                  <div style={S.groupTitle}><span style={S.groupTick} aria-hidden />{t('form.group.trigger')}</div>
                  <div style={S.field}>
                    <div style={S.label}>{t('form.type')}</div>
                    <div style={S.segRow}>
                      {TRIGGER_TYPES.map((tp) => (
                        <button key={tp} type="button" className="dss-seg" aria-pressed={type === tp} onClick={() => setType(tp)}>
                          {tp === 'cron' ? t('form.type.cron') : tp === 'once' ? t('form.type.once') : t('form.type.interval')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {type === 'cron' && (
                    <div style={S.field}>
                      <div style={S.label}>{t('form.cron')}<span style={S.required}> *</span></div>
                      <div style={S.inputRow}>
                        <input
                          className="dss-input"
                          style={{ flex: 1, fontFamily: MONO }}
                          value={cron}
                          onChange={(e) => { setCron(e.target.value); setCronChecked(false) }}
                          placeholder={t('form.cronPlaceholder')}
                          aria-label={t('form.cron')}
                        />
                        <button type="button" className="dss-btn dss-btn-outline dss-btn-field" onClick={() => void checkCron()}>
                          <IconCheck />{t('btn.validate')}
                        </button>
                      </div>
                      {cronChecked && cron.trim() !== '' && (
                        <div style={{ ...S.hint, color: cronOk ? T.text2 : T.danger }}>{cronOk ? t('form.cronValid') : t('form.cronInvalid')}</div>
                      )}
                      {cronChecked && cronOk && upcoming.length > 0 && (
                        <div style={S.upcoming}>
                          <div style={S.upcomingLabel}>{t('form.upcoming')}</div>
                          <div style={S.upcomingList}>
                            {upcoming.slice(0, 4).map((iso) => <span key={iso}>{fmtSchedule(iso)}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {type === 'once' && (
                    <div style={S.field}>
                      <div style={S.label}>{t('form.runAt')}<span style={S.required}> *</span></div>
                      <input type="datetime-local" className="dss-input" value={runAt} onChange={(e) => setRunAt(e.target.value)} aria-label={t('form.runAt')} />
                    </div>
                  )}

                  {type === 'interval' && (
                    <div style={S.field}>
                      <div style={S.label}>{t('form.everyMinutes')}<span style={S.required}> *</span></div>
                      <input type="number" min={1} className="dss-input" value={everyMinutes} onChange={(e) => setEveryMinutes(Number(e.target.value) || 1)} aria-label={t('form.everyMinutes')} />
                    </div>
                  )}

                  <div style={S.fieldLast}>
                    {!enabled ? (
                      <>
                        <div style={S.label}>{t('form.nextRun')}</div>
                        <div style={S.nextEmpty}>{t('form.nextRunDisabled')}</div>
                        <DayScale times={timesForScale} enabled={false} label={t('form.dayScale')} />
                      </>
                    ) : type === 'cron' && cronChecked && cronOk && upcoming.length > 0 ? (
                      <DayScale times={upcoming} enabled label={t('form.dayScale')} />
                    ) : (
                      <>
                        <div style={S.label}>{t('form.nextRun')}</div>
                        {triggerValid && nextRun !== null ? (
                          <>
                            <div style={S.nextValue}>{fmtSchedule(nextRun)}</div>
                            <DayScale
                              times={upcoming.length > 0 ? upcoming : [nextRun]}
                              enabled
                              label={t('form.dayScale')}
                            />
                          </>
                        ) : (
                          <div style={S.nextEmpty}>{t('form.nextRunEmpty')}</div>
                        )}
                      </>
                    )}
                  </div>
                </section>

                <section style={S.group}>
                  <div style={S.groupTitle}><span style={S.groupTick} aria-hidden />{t('form.group.execution')}</div>
                  <div style={S.field}>
                    <div style={S.label}>{t('form.executionKind')}</div>
                    <div style={S.segRow}>
                      <button type="button" className="dss-seg" aria-pressed={executionKind === 'prompt-session'} onClick={() => setExecutionKind('prompt-session')}>{t('form.promptSession')}</button>
                      <button type="button" className="dss-seg" aria-pressed={executionKind === 'knj-workflow'} onClick={() => { setExecutionKind('knj-workflow'); void loadWorkflows() }}>{t('form.workflow')}</button>
                    </div>
                  </div>

                  {executionKind === 'knj-workflow' ? (
                    <>
                      <div style={S.field}>
                        <div style={S.label}>{t('form.workflowSelect')}<span style={S.required}> *</span></div>
                        <Select value={workflowId} onChange={setWorkflowId} ariaLabel={t('form.workflowSelect')}>
                          <option value="">{t('form.workflowSelectPlaceholder')}</option>
                          {workflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}
                        </Select>
                        {workflowId.trim() !== '' && selectedWorkflowFileInputs.length === 0 && (
                          <>
                            <div style={S.hint}>{t('form.workflowNoFileInputs')}</div>
                            <details style={S.details}>
                              <summary style={S.detailSummary}>{t('form.workflowNoFileInputsDetailsLabel')}</summary>
                              <p style={S.detailText}>{t('form.workflowNoFileInputsDetails')}</p>
                            </details>
                          </>
                        )}
                      </div>
                      <div style={S.field}>
                        <div style={S.label}>{t('form.workflowTitle')}<span style={S.required}> *</span></div>
                        <input className="dss-input" value={workflowTitle} placeholder={t('form.workflowTitlePlaceholder')} onChange={(e) => setWorkflowTitle(e.target.value)} aria-label={t('form.workflowTitle')} />
                      </div>
                      <div style={S.field}>
                        <div style={S.label}>{t('form.workflowDescription')}</div>
                        <textarea className="dss-input" style={{ minHeight: 72 }} value={workflowDescription} onChange={(e) => setWorkflowDescription(e.target.value)} aria-label={t('form.workflowDescription')} />
                      </div>
                      <div style={S.field}>
                        <div style={S.label}>{t('form.workflowStoryCode')}</div>
                        <input className="dss-input" value={workflowStoryCode} onChange={(e) => setWorkflowStoryCode(e.target.value)} placeholder={t('form.workflowStoryCodePlaceholder')} aria-label={t('form.workflowStoryCode')} />
                      </div>

                      <div style={S.field}>
                        <div style={S.label}>{t('form.workflowAttachments')}</div>
                        <div style={S.hint}>{t('form.workflowAttachmentsHint')}</div>
                        <details style={S.details}>
                          <summary style={S.detailSummary}>{t('form.workflowDetails')}</summary>
                          <p style={S.detailText}>{t('form.workflowAttachmentsDetails')}</p>
                        </details>
                        <input ref={attachInputRef} type="file" multiple style={{ display: 'none' }} onChange={onAttachmentInputChange} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                          <button type="button" className="dss-btn dss-btn-outline" disabled={attaching > 0} onClick={() => attachInputRef.current?.click()}>
                            <IconPlus />{attaching > 0 ? t('form.workflowAttachmentsUploading') : t('form.workflowAttachmentsPick')}
                          </button>
                          <span style={S.metaText}>
                            {workflowAttachments.length > 0
                              ? fmt(t('form.workflowAttachmentsCount'), { n: String(workflowAttachments.length) })
                              : t('form.workflowAttachmentsNone')}
                          </span>
                        </div>
                        {workflowAttachments.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                            {workflowAttachments.map((att, index) => (
                              <span key={att.uploadId} className="dss-chip">
                                <span style={S.chipName} title={att.name}>{att.name}{att.size === undefined ? '' : ` (${formatBytes(att.size)})`}</span>
                                <button
                                  type="button"
                                  className="dss-chip-remove"
                                  aria-label={`${t('btn.remove')} ${att.name}`}
                                  title={t('btn.remove')}
                                  onClick={() => removeAttachment(index)}
                                >
                                  <IconCross />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {attachError !== null && (
                          <div style={S.errorText}>{t('form.workflowAttachmentsFailed')}{attachError}</div>
                        )}
                      </div>

                      {selectedWorkflowFileInputs.length > 0 && (
                        <div style={S.field}>
                          <div style={S.label}>{t('form.workflowPathInputs')}</div>
                          <div style={S.hint}>{t('form.workflowPathInputsHint')}</div>
                          <div style={{ marginTop: 12 }}>
                            {selectedWorkflowFileInputs.map((decl) => (
                              <div key={decl.name} style={S.pathRow}>
                                <span style={S.pathName} title={decl.name}>{decl.label || decl.name}{decl.required ? ' *' : ''}</span>
                                <input
                                  className="dss-input"
                                  value={workflowPathInputs[decl.name] ?? ''}
                                  placeholder={decl.required ? t('form.workflowPathRequiredPlaceholder') : t('form.workflowPathPlaceholder')}
                                  aria-label={decl.label || decl.name}
                                  onChange={(e) => setWorkflowPathInputs({ ...workflowPathInputs, [decl.name]: e.target.value })}
                                />
                                <code style={S.code}>{`\${inputs.${decl.name}}`}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={S.field}>
                      <div style={S.label}>{t('form.prompt')}<span style={S.required}> *</span></div>
                      <textarea className="dss-input" style={{ minHeight: 96 }} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t('form.promptPlaceholder')} aria-label={t('form.prompt')} />
                      <div style={S.hint}>{t('form.promptHint')}</div>
                    </div>
                  )}
                </section>

                <section style={{ ...S.group, marginBottom: 0 }}>
                  <div style={S.groupTitle}><span style={S.groupTick} aria-hidden />{t('form.group.runtime')}</div>
                  <div style={S.field}>
                    <div style={S.label}>{t('form.cwd')}{executionKind === 'knj-workflow' && <span style={S.required}> *</span>}</div>
                    <Select value={cwd} onChange={setCwd} ariaLabel={t('form.cwd')}>
                      <option value="">{t('form.cwdDefault')}</option>
                      {cwdOptions.map((option) => <option key={option.path} value={option.path} title={option.path}>{option.title}</option>)}
                    </Select>
                    <div style={S.hint}>{t('form.cwdHint')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Switch checked={enabled} onChange={() => setEnabled((value) => !value)} label={t('form.enabled')} />
                    <span style={S.switchLabel}>{t('form.enabled')}</span>
                  </div>
                </section>
              </div>
            )}

            {view === 'history' && (
              <div key="history" className="dss-view">
                {history.length === 0 ? (
                  <EmptyState title={t('history.emptyForTask')} hint={t('history.emptyHint')} />
                ) : (
                  <div style={S.logSurface}>
                    <div style={S.rail} aria-hidden />
                    {(histResult?.rows ?? []).map((entry, index) => (
                      <HistoryRow
                        key={`${entry.at}-${index}`}
                        entry={entry}
                        t={t}
                        divider={index > 0}
                        onOpenSession={openSession}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {view === 'form' && (
            <div style={embedded ? S.embedFooter : S.footer}>
              <button type="button" className="dss-btn dss-btn-ghost" onClick={() => setView('list')} disabled={busy}>{t('btn.cancel')}</button>
              <button
                type="button"
                className="dss-btn dss-btn-primary"
                onClick={() => void save()}
                disabled={busy || name.trim() === '' || !executionValid || !triggerValid}
              >
                {editId === null ? t('btn.save') : t('btn.saveChanges')}
              </button>
            </div>
          )}

          {(view === 'executions' && execResult !== null && allHistory.length > 0) && (
            <div style={embedded ? S.embedPagerBar : S.pagerBar}>
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
            <div style={embedded ? S.embedPagerBar : S.pagerBar}>
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
    </>
  )
}

/** 24-hour ruler: one tick every hour, a taller tick every 6 hours, a cobalt mark per run. */
function DayScale({ times, enabled, label }: { times: string[]; enabled: boolean; label: string }) {
  const marks = enabled ? times.map(clockMark).filter((mark): mark is number => mark !== null) : []
  const tickColor = enabled ? T.tick : T.hairline
  return (
    <div style={S.dayScale}>
      <div style={S.dayScaleLabel}>{label}</div>
      <div style={S.dayTrack} aria-hidden>
        <div style={{ ...S.dayBaseline, opacity: enabled ? 1 : 0.5 }} />
        {Array.from({ length: 25 }, (_, hour) => (
          <span
            key={hour}
            style={{
              ...S.dayTick,
              left: `${(hour / 24) * 100}%`,
              height: hour % 6 === 0 ? 8 : 4,
              background: tickColor,
            }}
          />
        ))}
        {marks.map((mark, index) => (
          <span key={`${mark}-${index}`} style={{ ...S.dayMarkerWrap, left: `${mark * 100}%` }}>
            <span style={S.dayMarkerBar} />
            <span style={S.dayMarkerDot} />
          </span>
        ))}
      </div>
      <div style={S.dayLabels} aria-hidden><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
    </div>
  )
}

/** Drawn dial for the empty state: 24 ticks, three cobalt signal ticks. */
function Dial() {
  const ticks = Array.from({ length: 24 }, (_, index) => {
    const angle = (index / 24) * Math.PI * 2 - Math.PI / 2
    const major = index % 6 === 0
    const inner = major ? 23 : 25
    return {
      index,
      x1: 32 + Math.cos(angle) * inner,
      y1: 32 + Math.sin(angle) * inner,
      x2: 32 + Math.cos(angle) * 29,
      y2: 32 + Math.sin(angle) * 29,
      signal: index % 8 === 3,
    }
  })
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" aria-hidden style={{ display: 'block' }}>
      <circle cx={32} cy={32} r={30} fill="none" stroke={T.hairline} strokeWidth={1} />
      {ticks.map((tick) => (
        <line
          key={tick.index}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke={tick.signal ? T.signal : T.tick}
          strokeWidth={tick.index % 6 === 0 ? 1.5 : 1}
          strokeLinecap="round"
        />
      ))}
      <circle cx={32} cy={32} r={2.5} fill={T.signal} />
    </svg>
  )
}

function EmptyState({ title, hint, action, dial = false }: { title: string; hint: string; action?: ReactNode; dial?: boolean }) {
  return (
    <div style={S.empty}>
      {dial && <Dial />}
      <div style={S.emptyTitle}>{title}</div>
      <div style={S.emptyHint}>{hint}</div>
      {action !== undefined && <div style={S.emptyAction}>{action}</div>}
    </div>
  )
}

/** Shared history row used by both the executions list and the per-task history view. */
function HistoryRow({ entry, name, t, divider = false, showName = false, onOpenSession }: {
  entry: HistoryEntry
  name?: ReactNode
  t: (key: keyof Dict) => string
  divider?: boolean
  showName?: boolean
  onOpenSession?: (sessionId: string) => void
}) {
  const running = entry.status === 'running'
  const ok = entry.status === 'created'
  const fail = entry.status === 'failed'
  const dotColor = running ? T.signal : ok ? T.success : fail ? T.danger : T.text2
  const statusText = running
    ? t('status.running')
    : ok
      ? t('status.created')
      : fail
        ? t('status.failed')
        : t('status.skipped')
  const columns = showName ? 'minmax(0,1fr) 124px 64px 56px auto' : '140px minmax(0,1fr) 72px auto'
  return (
    <div
      className="dss-row"
      style={{ ...S.logRow, gridTemplateColumns: columns, ...(divider ? { borderTop: `1px solid ${T.hairline}` } : {}) }}
    >
      <span style={{ ...S.logDot, background: dotColor }} aria-hidden />
      {showName && name !== undefined && (
        <span style={S.logName} title={typeof name === 'string' ? name : undefined}>{name}</span>
      )}
      <span style={S.logTime} title={fullTime(entry.at)}>{fmtLogTime(entry.at)}</span>
      <span style={S.logStatus} title={fail && entry.error !== undefined ? entry.error : statusText}>{statusText}</span>
      <span style={S.logDuration}>{entry.ms !== undefined ? `${entry.ms} ms` : '—'}</span>
      <span style={S.logActions}>
        {!running && entry.workflowTaskId !== undefined && (
          <button
            type="button"
            className="dss-btn dss-btn-sm dss-btn-ghost"
            onClick={() => window.dispatchEvent(new CustomEvent('dsh-knj-workflow:open-task', { detail: { taskId: entry.workflowTaskId } }))}
          >
            {t('history.openWorkflowTask')}
          </button>
        )}
        {!running && entry.sessionId !== undefined && onOpenSession !== undefined && (
          <button type="button" className="dss-btn dss-btn-sm dss-btn-ghost" onClick={() => onOpenSession(entry.sessionId as string)}>
            {t('history.openSession')}
          </button>
        )}
      </span>
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
    <div style={S.pager}>
      <div style={S.pagerGroup}>
        <button type="button" className="dss-btn dss-btn-sm dss-btn-outline" disabled={first} onClick={() => onPage(page - 1)}>
          {t('pager.prev')}
        </button>
        <button type="button" className="dss-btn dss-btn-sm dss-btn-outline" disabled={last} onClick={() => onPage(page + 1)}>
          {t('pager.next')}
        </button>
      </div>
      <span style={S.pagerInfo}>{fmt(t('pager.summary'), { p: page + 1, n: pages, c: total })}</span>
      <div style={S.pagerGroup}>
        <Select value={String(pageSize)} onChange={(value) => onPageSize(Number(value))} ariaLabel={t('pager.pageSize')} small>
          {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
        </Select>
        <span style={S.pagerInfo}>{t('pager.pageSizeUnit')}</span>
      </div>
    </div>
  )
}

function Select({ value, onChange, ariaLabel, children, small = false }: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  children: ReactNode
  small?: boolean
}) {
  return (
    <div style={small ? { position: 'relative', width: 64 } : S.selectWrap}>
      <select
        className={small ? 'dss-input dss-select-sm' : 'dss-input'}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        style={small ? { width: '100%' } : undefined}
      >
        {children}
      </select>
      <span style={{ ...S.selectChevron, ...(small ? { right: 8 } : {}) }} aria-hidden><IconChevronDown /></span>
    </div>
  )
}

/** Plain switch: 36×20, 16px knob, label via aria-label (text sits beside it). */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="dss-switch"
      onClick={onChange}
    />
  )
}

/** 2026-11-09 09:00 — compact, stable width for lists and previews. */
function fmtSchedule(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** 11-09 09:00:03 — history rows; full timestamp stays in the title attribute. */
function fmtLogTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function fullTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}

/** Fraction of the day (0…1) for the 24h ruler. */
function clockMark(iso: string): number | null {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return (d.getHours() * 60 + d.getMinutes()) / (24 * 60)
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Convert an ISO datetime to a `datetime-local` input value (local timezone). */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Human-readable trigger description for the list view. */
function triggerText(task: TaskView, t: (key: keyof Dict) => string): string {
  if (task.type === 'once') return `${t('type.once')} · ${task.runAt ? fmtSchedule(task.runAt) : '—'}`
  if (task.type === 'interval') return fmt(t('type.everyMinutes'), { n: task.everyMinutes ?? 0 })
  return task.cron
}

/** Last path segment for the compact working-directory line. */
function baseName(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean)
  return parts.length > 0 ? (parts[parts.length - 1] ?? path) : path
}
