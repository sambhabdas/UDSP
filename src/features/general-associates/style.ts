import type { CSSProperties } from 'react'
import { caption1Strong } from '../../ds/type'

/** The card every panel on the page sits in. */
export const CARD: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}

/** A card's title bar. */
export const CARD_HEAD: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-80)',
  padding: 'var(--size-100) var(--size-160)',
  borderBottom: '1px solid var(--border-subtle)',
}

/** The uppercase label a column head carries. */
export const LABEL: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
}

/** A KPI tile's label sits one notch wider than a column head's. */
export const TILE_LABEL: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

/** The tiles' 28/36 number — one step off the ramp, as the design file has it. */
export const TILE_VALUE: CSSProperties = {
  fontSize: 28,
  lineHeight: '36px',
  fontWeight: 'var(--weight-semibold)',
  letterSpacing: '-0.3px',
  fontVariantNumeric: 'tabular-nums',
}

/** Every table on the page shares this row rhythm. */
export const ROW: CSSProperties = {
  boxSizing: 'border-box',
  display: 'grid',
  gap: 'var(--size-120)',
  alignItems: 'center',
  minHeight: 40,
  padding: 'var(--size-40) var(--size-160)',
  borderBottom: '1px solid var(--border-subtle)',
}

/** And this head rhythm — same columns, tighter padding, tinted. */
export const HEAD: CSSProperties = {
  boxSizing: 'border-box',
  display: 'grid',
  gap: 'var(--size-120)',
  alignItems: 'center',
  padding: 'var(--size-60) var(--size-160)',
  background: 'var(--surface-subtle)',
  borderBottom: '1px solid var(--border-subtle)',
}

/** Column templates, kept next to each other so the head and rows cannot drift. */
export const DIR_COLS =
  'minmax(190px,1.3fr) minmax(170px,1.2fr) minmax(150px,1fr) minmax(140px,1fr) 90px 130px 120px 80px 40px'
export const SHIFT_COLS = '110px minmax(140px,1fr) 130px 70px 110px minmax(160px,1.2fr)'
export const EV_COLS = '90px minmax(160px,1.2fr) 90px 70px minmax(200px,1.6fr)'
export const RT_COLS = '110px minmax(130px,1fr) 100px 100px 90px 90px'
export const TC_COLS = '120px minmax(140px,1fr) 110px 110px 90px 90px'

/** The tile grid the Overview, Performance and Dispatch tabs share. */
export const TILE_GRID: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
  gap: 'var(--size-120)',
}

/** A dialog's field label. */
export const FIELD_LABEL: CSSProperties = {
  ...caption1Strong,
  color: 'var(--text-secondary)',
}

/** The two-up field grid every dialog pairs its inputs on. */
export const PAIR: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
  gap: 'var(--size-160)',
}
