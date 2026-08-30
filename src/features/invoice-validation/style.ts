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

/** A table's sticky head band. */
export const HEAD: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-160)',
  position: 'sticky',
  top: 0,
  zIndex: 5,
  padding: 'var(--size-100) var(--space-cell-x)',
  background: 'var(--surface-subtle)',
  borderTop: '1px solid var(--border-default)',
  borderBottom: '1px solid var(--border-default)',
  ...caption1Strong,
  color: 'var(--text-secondary)',
}

/** A body row. Invoice Validation runs Body 1 rows at 48px, not Caption 1. */
export const ROW: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-160)',
  minHeight: 48,
  padding: 'var(--size-100) var(--space-cell-x)',
  borderBottom: '1px solid var(--border-subtle)',
}

/** A dialog's tone recipes — the CTA fill and the note plate. */
export const CTA_TONES = {
  primary: { bg: 'var(--primary)', border: 'var(--primary)', fg: 'var(--text-inverse)', hover: 'var(--primary-hover)' },
  danger: { bg: 'var(--red-600)', border: 'var(--red-600)', fg: 'var(--text-inverse)', hover: 'var(--red-700)' },
  success: { bg: 'var(--green-600)', border: 'var(--green-600)', fg: 'var(--text-inverse)', hover: 'var(--green-700)' },
} as const

export const NOTE_TONES = {
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning-border)', fg: 'var(--warning-fg)' },
  info: { bg: 'var(--info-bg)', border: 'var(--info-border)', fg: 'var(--info-fg)' },
  danger: { bg: 'var(--danger-bg)', border: 'var(--danger-border)', fg: 'var(--danger-fg)' },
} as const

export type CtaTone = keyof typeof CTA_TONES
export type NoteTone = keyof typeof NOTE_TONES
