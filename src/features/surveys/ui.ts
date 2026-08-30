import { caption2Strong } from '../../ds/type'

// Non-component exports live here so parts.tsx stays fast-refresh clean.

// This page's KPI labels sit at the narrower .5px tracking; its table headings
// take the DS `labelEyebrow`, re-exported here under the name the page uses.
export const EYEBROW = {
  ...caption2Strong,
  letterSpacing: '.5px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
} as const

export { labelEyebrow as TABLE_EYEBROW } from '../../ds/type'

export interface SegTone {
  bg: string
  border: string
  fg: string
  weight: string
}

// A picked segment reads blue; an unpicked one is a plain outline.
export function segTone(on: boolean): SegTone {
  return {
    bg: on ? 'var(--blue-100)' : 'var(--surface-card)',
    border: on ? 'var(--blue-200)' : 'var(--border-default)',
    fg: on ? 'var(--blue-700)' : 'var(--text-secondary)',
    weight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
  }
}
