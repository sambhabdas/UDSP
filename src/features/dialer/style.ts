import type { CSSProperties } from 'react'
import { caption1 } from '../../ds/type'

/** The subtle inset field the dialer uses for every text entry. */
export const FIELD: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-medium)',
  background: 'var(--surface-subtle)',
}

/** An input with no chrome of its own - the field around it carries that. */
export const BARE_INPUT: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  ...caption1,
  color: 'var(--text-primary)',
  padding: 0,
}
