/**
 * Sidebar footer entry: a native-looking "调度器" row (icon + label) mounted in
 * the left sidebar's footer.action slot. Clicking opens the scheduler panel.
 */
import { useState } from 'react'
import type { Dict } from './locales.ts'
import type { SessionsService, WorkspacesService } from './index.ts'
import { SchedulerPanel } from './SchedulerPanel.tsx'
import { IconClock } from './icons.tsx'

export interface SchedulerEntryProps {
  t: (key: keyof Dict) => string
  sessions?: SessionsService
  workspaces?: WorkspacesService
}

export function SchedulerEntry({ t, sessions, workspaces }: SchedulerEntryProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        title={t('entry.label')}
        onClick={() => setOpen(true)}
        style={{
          boxSizing: 'border-box',
          cursor: 'pointer',
          width: 'calc(100% + 4px)',
          height: 42,
          color: 'var(--dsw-alias-label-primary)',
          background: 'transparent',
          border: 'none',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          margin: '4px -2px',
          padding: '0 10px 0 8px',
          fontFamily: 'inherit',
          fontSize: 14,
          lineHeight: '22px',
          justifyContent: 'flex-start',
          transition: 'background .15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ display: 'inline-flex', color: 'var(--dsw-alias-label-secondary)', flexShrink: 0 }}>
          <IconClock size={16} />
        </span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', flex: 1, textAlign: 'left' }}>{t('entry.label')}</span>
      </button>
      {open && <SchedulerPanel onClose={() => setOpen(false)} t={t} sessions={sessions} workspaces={workspaces} />}
    </>
  )
}
