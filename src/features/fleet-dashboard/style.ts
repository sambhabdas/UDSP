import type { CSSProperties } from 'react'
import { caption1Strong } from '../../ds/type'

/** The card every panel on the page sits in. */
export const CARD: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

/** The uppercase label above a KPI number. */
export const TILE_LABEL: CSSProperties = {
  flex: 1,
  minWidth: 0,
  ...caption1Strong,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'var(--text-helper)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
