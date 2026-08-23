/**
 * One consistent 16px line-icon set (stroke = currentColor, weight 1.5).
 * Replaces the previous emoji glyphs (⏰ ＋ ↻ ✓ ✕ ○) so icons render the same
 * on every platform and read as part of the host UI.
 */
import type { ReactNode } from 'react'

interface IconProps {
  size?: number
}

function Svg({ size = 16, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0, display: 'block' }}
    >
      {children}
    </svg>
  )
}

export function IconClock({ size }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5V8l2.4 1.5" />
    </Svg>
  )
}

export function IconPlus({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </Svg>
  )
}

export function IconRefresh({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M13.2 8a5.2 5.2 0 1 1-1.5-3.7" />
      <path d="M13.4 2.6v3h-3" />
    </Svg>
  )
}

export function IconEdit({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M11.3 2.7a1.4 1.4 0 0 1 2 2L5 13l-3 .7.7-3 8.6-8z" />
    </Svg>
  )
}

export function IconPlay({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M5 3.2v9.6l7.4-4.8z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconHistory({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M2.8 8a5.2 5.2 0 1 1 1.5 3.7" />
      <path d="M2.8 6.5V9.5h3" />
      <path d="M8 4.6V8l2.3 1.4" />
    </Svg>
  )
}

export function IconTrash({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M2.8 4.4h10.4M6.4 4.4V3.2a.8.8 0 0 1 .8-.8h1.6a.8.8 0 0 1 .8.8v1.2M4.4 4.4l.6 8a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.6-8" />
      <path d="M6.6 7v3.6M9.4 7v3.6" />
    </Svg>
  )
}

export function IconCheck({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3.2 8.4l3 3 6.6-6.8" />
    </Svg>
  )
}

export function IconCross({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Svg>
  )
}

export function IconChevronLeft({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M10 3.5L5.5 8l4.5 4.5" />
    </Svg>
  )
}
