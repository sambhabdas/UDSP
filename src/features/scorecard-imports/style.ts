import type { CSSProperties } from 'react'
import { caption1Strong } from '../../ds/type'

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
export const ISSUE_COLS = '1.5fr 150px 80px 260px 110px'
export const BATCH_COLS = '130px 1.2fr 1.4fr 80px 90px 90px 110px 130px 44px'
export const MAP_COLS = '1fr 1fr 100px 32px'

/** [sortKey | null, label, justify] */
export const BATCH_HEADS: [string | null, string, string][] = [
  ['date', 'Date', 'flex-start'],
  [null, 'Source', 'flex-start'],
  [null, 'File', 'flex-start'],
  ['rows', 'Rows', 'flex-end'],
  ['events', 'Events', 'flex-end'],
  ['skipped', 'Skipped', 'flex-end'],
  ['unmatched', 'Unmatched', 'flex-end'],
  [null, 'Status', 'flex-start'],
  [null, '', 'flex-end'],
]
