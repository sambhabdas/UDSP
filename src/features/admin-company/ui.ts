import { caption1Strong, caption2Strong } from '../../ds/type'

// Non-component exports live here so parts.tsx stays fast-refresh clean.

// This page's section headings are Caption 1; the headings nested inside the
// Branding card step down to Caption 2 - which is the DS `labelEyebrow`.
export const SECTION_EYEBROW = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
} as const

export const SUB_EYEBROW = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
} as const

// The DSP code is a machine string, but a short one that has to hold its own
// beside a Caption 1 Strong label - so it takes the semibold weight rather than
// the DS `mono`, which is regular.
export const MONO = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  fontSize: 'var(--caption-1-size)',
  lineHeight: 'var(--caption-1-lh)',
  fontWeight: 'var(--weight-semibold)',
} as const
