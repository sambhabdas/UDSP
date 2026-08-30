import type { CSSProperties } from 'react'
import { caption2Strong } from '../../ds/type'

/** The uppercase label a column head or a section carries. */
export const LABEL: CSSProperties = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}

/** The needs matrix and the coverage grid share this shape. */
export const MATRIX_COLS = 'minmax(120px,160px) repeat(7, minmax(64px, 1fr))'
export const COVERAGE_COLS = 'minmax(140px,180px) repeat(7, minmax(56px,1fr)) minmax(130px,160px)'
export const SKIP_COLS = 'minmax(150px,190px) repeat(7, minmax(70px,1fr))'

/** Weekends carry a tint the whole column deep. */
export const dayBg = (i: number): string => (i === 0 || i === 6 ? 'var(--surface-subtle)' : 'transparent')
