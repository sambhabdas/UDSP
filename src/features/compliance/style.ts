import type { CSSProperties } from 'react'

/** The card every section on the page sits in. */
export const CARD: CSSProperties = {
  boxSizing: 'border-box',
  flexShrink: 0,
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  overflow: 'hidden',
}

/** The bar across the top of a card. */
export const CARD_BAR: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-80)',
  padding: 'var(--size-100) var(--size-160)',
  borderBottom: '1px solid var(--border-subtle)',
}
