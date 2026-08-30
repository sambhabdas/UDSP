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

export const MOD_COLS = 'minmax(170px,1.3fr) minmax(140px,1fr) minmax(115px,.85fr) minmax(140px,1fr) 70px 100px 80px 190px'
export const VID_COLS = '88px minmax(180px,1.4fr) 130px 90px 110px minmax(140px,1fr) 130px 60px'
export const QUIZ_COLS = '1.4fr 110px 110px 1fr 130px 44px'
