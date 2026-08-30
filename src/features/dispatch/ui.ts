import type { CSSProperties } from 'react'
import { caption1Strong, caption2Strong } from '../../ds/type'

// Non-component exports live here so parts.tsx stays fast-refresh clean.

/** The section labels above each block on a board. */
export const SECTION_LABEL: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

/** Column headings inside a table. */
export const COL_HEAD: CSSProperties = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

/** A resting surface: hairline, no shadow. */
export const CARD: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
}

export const BARE_INPUT: CSSProperties = {
  width: '100%',
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-family)',
  fontSize: 'var(--body-1-size)',
  lineHeight: 'var(--body-1-lh)',
  color: 'var(--text-primary)',
  padding: 0,
}
