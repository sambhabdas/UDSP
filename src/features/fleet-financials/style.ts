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
}

/** The uppercase label a column head carries. */
export const LABEL: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}
