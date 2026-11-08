/**
 * One icon set: 16px box, stroke 1.5, currentColor, round joins.
 * Every call site renders these at 16px — the size prop was removed so the
 * inventory cannot drift back to six different icon sizes.
 */
import type { ReactNode } from 'react'

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      width={16}
      height={16}
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

export function IconClock() {
  return (
    <Svg>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5V8l2.4 1.5" />
    </Svg>
  )
}

export function IconPlus() {
  return (
    <Svg>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </Svg>
  )
}

export function IconRefresh() {
  return (
    <Svg>
      <path d="M13.2 8a5.2 5.2 0 1 1-1.5-3.7" />
      <path d="M13.4 2.6v3h-3" />
    </Svg>
  )
}

export function IconEdit() {
  return (
    <Svg>
      <path d="M11.3 2.7a1.4 1.4 0 0 1 2 2L5 13l-3 .7.7-3 8.6-8z" />
    </Svg>
  )
}

export function IconPlay() {
  return (
    <Svg>
      <path d="M5.2 3.4v9.2l7.1-4.6z" />
    </Svg>
  )
}

export function IconHistory() {
  return (
    <Svg>
      <path d="M2.8 8a5.2 5.2 0 1 1 1.5 3.7" />
      <path d="M2.8 6.5V9.5h3" />
      <path d="M8 4.6V8l2.3 1.4" />
    </Svg>
  )
}

export function IconCheck() {
  return (
    <Svg>
      <path d="M3.2 8.4l3 3 6.6-6.8" />
    </Svg>
  )
}

export function IconCross() {
  return (
    <Svg>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Svg>
  )
}

export function IconChevronLeft() {
  return (
    <Svg>
      <path d="M10 3.5L5.5 8l4.5 4.5" />
    </Svg>
  )
}

export function IconChevronDown() {
  return (
    <Svg>
      <path d="M3.5 6L8 10.5 12.5 6" />
    </Svg>
  )
}
