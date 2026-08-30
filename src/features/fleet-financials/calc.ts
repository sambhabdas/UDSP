// The arithmetic behind the page: what a van earns, what it costs, and whether
// its row is complete enough for the NET to be believed.

import { VEHICLES, weeks } from './data'
import { signedMoney, signedMoney0 } from '../../ds/format'
import type { Cells, Status, Vehicle } from './data'

/** Money with the minus outside the sign, the way the design writes it. An
 *  absent figure prints as nothing rather than as zero. */
export function money(n: number | null | undefined, dec = false): string {
  if (n === null || n === undefined) return ''
  return dec ? signedMoney(n) : signedMoney0(n)
}

export function cell(cells: Cells, tab: string, vid: string, col: string | number): number | null {
  const v = cells[`${tab}|${vid}|${col}`]
  return v === undefined ? null : v
}

/** What Amazon paid a van across the weeks of one month. */
export function amazonFor(cells: Cells, vid: string, month: number): number {
  let t = 0
  weeks(month).forEach((w) => {
    const x = cell(cells, 'amz', vid, w.id)
    if (x !== null) t += x
  })
  return t
}

export function vanNet(cells: Cells, v: Vehicle, month: number): number {
  const a = amazonFor(cells, v.id, month)
  const l = cell(cells, 'lease', v.id, month) ?? 0
  const i = cell(cells, 'ins', v.id, month) ?? 0
  return a - l - i - v.oop
}

/**
 * Whether a row is missing a cost it ought to have. A missing charge does not
 * read as zero — it reads as a NET that is too good, so it is called out.
 */
export function incomplete(cells: Cells, v: Vehicle, month: number): string | null {
  if (v.status === 'Off fleet') return null
  const l = cell(cells, 'lease', v.id, month)
  const i = cell(cells, 'ins', v.id, month)
  if (i === null) return 'No insurance figure this month. NET is overstated by that amount.'
  if (l === null && v.own === 'Rented') return 'No lease figure this month. NET is overstated by that amount.'
  return null
}

export interface Tone {
  bg: string
  fg: string
  dot: string
}

export function statusTone(s: Status | string): Tone {
  if (s === 'In service') return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
  if (s === 'In shop') return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  if (s === 'Grounded') return { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' }
  return { bg: 'var(--surface-subtle)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
}

/**
 * A twelve-point sparkline of NET. Only the last point is real — the eleven
 * before it are a deterministic wobble around it, seeded off the vehicle id so
 * the same van always draws the same line.
 */
export function sparkFor(cells: Cells, v: Vehicle, month: number) {
  const base = vanNet(cells, v, month)
  const seed = v.id.charCodeAt(3) + v.id.charCodeAt(4)
  const pts: number[] = []
  for (let i = 0; i < 12; i++) {
    const wobble = Math.sin(seed + i * 1.3) * 340 + Math.cos(seed * 0.7 + i) * 180
    pts.push(i === 11 ? base : base + wobble)
  }
  const max = Math.max(...pts.map(Math.abs), 300)
  const zero = 14
  const scale = 11 / max
  return {
    points: pts.map((p, i) => `${(i * (100 / 11)).toFixed(1)},${(zero - p * scale).toFixed(1)}`).join(' '),
    zero,
    neg: base < 0,
    vals: pts.map((p) => money(Math.round(p))).join(' · '),
  }
}

/**
 * Whether a cell can be written. An off-fleet van's later periods are closed —
 * but a cell that already holds a figure stays editable, so history can be
 * corrected.
 */
export function isLocked(
  cells: Cells,
  tab: string,
  vid: string,
  colId: string | number,
  colIndex: number,
  month: number,
): boolean {
  const v = VEHICLES.find((x) => x.id === vid)
  if (!v || v.offM === undefined) return false
  if (cell(cells, tab, vid, colId) !== null) return false
  if (tab === 'amz') return v.offM < month || (month === 6 && colIndex > 1)
  return Number(colId) > v.offM
}

/** Every week id across the year, for naming the period an edit touched. */
export function allWeeks() {
  return [0, 1, 2, 3, 4, 5, 6].flatMap((m) => weeks(m))
}
