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

/** The catalogue's nine columns, shared by every category card. */
export const CAT_COLS = '24px 1.5fr 90px 90px 120px 1.1fr 90px 70px 130px'

export const LADDER_COLS = '44px 1.2fr 170px 110px 130px 100px 44px'

/** [sortKey | null, label, justify] */
export const CAT_HEADS: [string | null, string, string][] = [
  ['name', 'Standard', 'flex-start'],
  ['neg', 'Negative', 'flex-end'],
  ['pos', 'Positive', 'flex-end'],
  [null, 'Per', 'flex-start'],
  [null, 'Paired Module', 'flex-start'],
  [null, 'Auto Coach', 'flex-start'],
  ['due', 'Due', 'flex-end'],
  [null, 'Actions', 'center'],
]
