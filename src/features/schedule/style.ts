import type { CSSProperties } from 'react'
import { caption2Strong } from '../../ds/type'

/** The uppercase label a column head or a section carries. */
export const LABEL: CSSProperties = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}
