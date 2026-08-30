import type { CSSProperties } from 'react'
import { caption1Strong } from '../../ds/type'

/** Column headings and section rules, one step above the shared eyebrow. */
export const HEAD: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

export const TILE_LABEL: CSSProperties = { ...HEAD, color: 'var(--text-helper)' }

export const CARD: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

export const PAIR: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--size-120)',
  alignItems: 'stretch',
}

export const NUM: CSSProperties = { fontVariantNumeric: 'tabular-nums' }

/** The roster table's ten columns, shared by its header and its rows. */
export const ROSTER_COLS = '36px minmax(180px,1.6fr) 70px 130px 130px 100px 130px 110px 80px 120px'

export const ACK_COLS = '1.2fr 1fr 110px 90px 1.4fr'

/** A form field label inside a dialog. */
export const FIELD_LABEL: CSSProperties = { ...caption1Strong, color: 'var(--text-secondary)' }
