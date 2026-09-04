import type { CSSProperties } from 'react'
import { body1, caption2Strong } from '../../ds/type'

// Non-component exports live here so parts.tsx stays fast-refresh clean.

/** Both table heads: Caption 2 semibold, .6px tracking, uppercase. */
export const HEAD: CSSProperties = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

/** A resting surface: hairline, no shadow. */
export const CARD: CSSProperties = {
  flexShrink: 0,
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  display: 'flex',
  flexDirection: 'column',
}

/** An input that carries no chrome of its own - the wrapper owns the border. */
export const BARE_INPUT: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-family)',
  ...body1,
  color: 'var(--text-primary)',
  padding: 0,
}
