/**
 * The Settings → 定时任务 section. The host renders `settings.section` entries
 * inside its own dialog and passes the dialog's `close` down as an owner prop,
 * so this is a thin adapter: the scheduler UI itself stays in SchedulerPanel.
 */
import { createElement as h } from 'react'
import { SchedulerPanel, type SchedulerPanelProps } from './SchedulerPanel.tsx'

export type SchedulerSectionProps = Omit<SchedulerPanelProps, 'onClose' | 'embedded'> & {
  /** Provided by the hosting Settings dialog (`settings.section` owner props). */
  close?: () => void
}

export function SchedulerSection({ close, ...panel }: SchedulerSectionProps) {
  return h(SchedulerPanel, { ...panel, embedded: true, onClose: () => close?.() })
}
