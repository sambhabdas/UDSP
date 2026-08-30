import type { CSSProperties } from 'react'
import { caption1, caption1Strong } from '../../ds/type'

/**
 * This page sets its column headings and section eyebrows one step larger than
 * the shared `labelEyebrow` — Caption 1 rather than Caption 2 — because the
 * dashboard is read at arm's length. Both live here so the two never drift.
 */
export const HEAD: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

/** The same treatment in the helper colour, used inside the KPI tiles. */
export const TILE_LABEL: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-helper)',
}

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
  gap: 'var(--size-100)',
  alignItems: 'stretch',
}

export const NUM: CSSProperties = { fontVariantNumeric: 'tabular-nums' }

export const AXIS_TEXT: CSSProperties = { ...caption1, color: 'var(--text-secondary)', ...NUM }
