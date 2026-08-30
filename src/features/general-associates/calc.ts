import type { Da } from './data'

/** The five tone recipes the chips, tags and pills draw from. */
export interface Tone {
  bg: string
  border: string
  fg: string
  dot: string
}

export const TONES: Record<'danger' | 'warn' | 'ok' | 'mut' | 'blue', Tone> = {
  danger: { bg: 'var(--danger-bg)', border: 'var(--danger-border)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' },
  warn: { bg: 'var(--warning-bg)', border: 'var(--warning-border)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' },
  ok: { bg: 'var(--success-bg)', border: 'var(--success-border)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' },
  mut: { bg: 'var(--surface-subtle)', border: 'var(--border-default)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' },
  blue: { bg: 'var(--blue-50)', border: 'var(--blue-200)', fg: 'var(--blue-700)', dot: 'var(--primary)' },
}

export type ToneName = keyof typeof TONES

export interface Tier {
  label: string
  dot: string
}

/** Net banding. The bands are ordered top-down and the last one catches. */
const TIERS: [number, string, string][] = [
  [50, 'Excellent', 'var(--green-700)'],
  [10, 'Good', 'var(--green-500)'],
  [0, 'Decent', 'var(--neutral-400)'],
  [-49, 'Needs Work', 'var(--yellow-600)'],
  [-9999, 'At Risk', 'var(--danger-accent)'],
]

export function tierOf(net: number): Tier {
  const band = TIERS.find(([floor]) => net >= floor) ?? TIERS[TIERS.length - 1]
  return { label: band[1], dot: band[2] }
}

/** "ALVARENGA, CARLOS" → "AC". The comma is the split, not the space. */
export function initialsOf(name: string): string {
  return name
    .split(',')
    .map((part) => part.trim()[0] ?? '')
    .join('')
}

/** Net always carries its sign, so +44 reads as a gain rather than a count. */
export function signed(net: number): string {
  return net > 0 ? `+${net}` : String(net)
}

/** Nets colour on both ends: red below zero, green from Excellent up. */
export function netColor(net: number): string {
  if (net < 0) return 'var(--danger-fg)'
  return net >= 50 ? 'var(--success-fg)' : 'var(--text-primary)'
}

/** How a coaching assignment's state chip is toned. */
export function coachTone(state: string): ToneName {
  if (state === 'Overdue') return 'danger'
  if (state === 'Awaiting Ack') return 'warn'
  if (state === 'Acknowledged' || state === 'Clear') return 'ok'
  return 'blue'
}

/** The searchable text of a record — name, both IDs and the phone. */
export function searchText(d: Da): string {
  return `${d.name} ${d.tr} ${d.ee} ${d.phone}`.toLowerCase()
}
