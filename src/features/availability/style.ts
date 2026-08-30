import type { CSSProperties } from 'react'
import { caption1Strong, caption2Strong } from '../../ds/type'

/** Column headings on this page are Caption 2, matching Schedule's grid. */
export const LABEL: CSSProperties = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}

export const HEAD: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

export const TILE_LABEL: CSSProperties = { ...HEAD, color: 'var(--text-helper)' }

export const NUM: CSSProperties = { fontVariantNumeric: 'tabular-nums' }

export const CARD: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

export const FIELD_LABEL: CSSProperties = { ...caption1Strong, color: 'var(--text-secondary)' }

export const PV_COLS = '36px repeat(5,1fr)'
export const ISSUE_COLS = '1.4fr 150px 70px 240px 110px'
export const BATCH_COLS = '120px 1.2fr 1.4fr 70px 80px 80px 100px 130px 44px'
export const MAP_COLS = '1fr 1fr 32px'

/** [sortKey | null, label, justify] */
export const BATCH_HEADS: [string | null, string, string][] = [
  ['d', 'Date', 'flex-start'],
  [null, 'Source', 'flex-start'],
  [null, 'File', 'flex-start'],
  ['rows', 'Rows', 'flex-end'],
  ['events', 'Cells', 'flex-end'],
  ['skipped', 'Skipped', 'flex-end'],
  ['unmatched', 'Unmatched', 'flex-end'],
  [null, 'Status', 'flex-start'],
  [null, '', 'flex-end'],
]

/** Weekends get a tinted column so the week reads at a glance. */
export const dayBg = (dow: number): string => (dow === 0 || dow === 6 ? 'var(--surface-subtle)' : 'transparent')

/** The hatch that means "not available" — never a flat grey. */
export const UNAVAILABLE_FILL =
  'repeating-linear-gradient(45deg, var(--neutral-100) 0 6px, var(--border-subtle) 6px 12px)'

export const UNAVAILABLE_SWATCH =
  'repeating-linear-gradient(45deg, var(--neutral-100) 0 3px, var(--border-subtle) 3px 6px)'
