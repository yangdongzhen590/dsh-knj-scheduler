/**
 * Client-side pagination helpers for the history views. Pure functions with
 * no React dependency so they stay unit-testable (pager.test.mjs).
 */

export const PAGE_SIZES = [10, 25, 50, 100]

export interface PageResult<T> {
  /** Rows for the current (clamped) page. */
  rows: T[]
  /** Total number of pages (>= 1). */
  pages: number
  /** Clamped 0-based page index actually rendered. */
  pageSafe: number
}

/** Slice `items` into pages of `pageSize`, clamping an out-of-range page. */
export function pageSlice<T>(items: readonly T[], page: number, pageSize: number): PageResult<T> {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const pageSafe = Math.min(Math.max(page, 0), pages - 1)
  const start = pageSafe * pageSize
  return { rows: items.slice(start, start + pageSize), pages, pageSafe }
}

/** Substitute {key} placeholders in a locale template. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`))
}
