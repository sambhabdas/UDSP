// Derived figures for Profitability, ported from Profitability.dc.html.

import { ALL, PERIODS } from './data'
import type { BadgeKind, CompareMode, Period } from './data'
import { int } from '../../ds/format'

const r2 = (v: number) => Math.round(v * 100) / 100

export { money, money0 } from '../../ds/format'
export const pct = (v: number, d = 1) => `${v.toFixed(d)}%`
export const num = int
export const DASH = '—'

const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
// Pinned to en-US rather than to `env.locale`: the range label below takes this
// output apart to collapse a shared month, and that assumes the "Mon D" shape.
const fmtD = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const pad2 = (n: number) => (n < 10 ? '0' : '') + n

// "Jul 12 - 25", collapsing the month when both ends share one.
export function fmtRange(start: Date): string {
  const end = addDays(start, 13)
  return start.getMonth() === end.getMonth()
    ? `${fmtD(start)} - ${end.getDate()}`
    : `${fmtD(start)} - ${fmtD(end)}`
}

// "07/12 - 07/25" — the compact form the pickers and the table use.
export function fmtRangeNum(start: Date): string {
  const end = addDays(start, 13)
  return `${pad2(start.getMonth() + 1)}/${pad2(start.getDate())} - ${pad2(end.getMonth() + 1)}/${pad2(end.getDate())}`
}

// Everything the page reads off a period.
/** Everything the page reads off a period. */
export interface Derived {
  gp: number
  margin: number
  ppr: number
  rpr: number
  cpr: number
  drv: number
  taxes: number
  gross: number
}

export function der(p: Period): Derived {
  const gp = r2(p.rev - p.cost)
  return {
    gp,
    margin: (gp / p.rev) * 100,
    ppr: gp / p.routes,
    rpr: p.rev / p.routes,
    cpr: p.cost / p.routes,
    // Driver share of revenue — gross pay plus the employer tax on it.
    drv: ((p.sp.dg + p.sp.dt) / p.rev) * 100,
    taxes: r2(p.sp.dt + p.sp.dst + p.sp.tt),
    gross: r2(p.sp.dg + p.sp.dsg + p.sp.tg),
  }
}

// What the selected period is measured against. A provisional period is left
// out of the trailing average — it would drag the baseline with a number that
// is still moving.
/** What the selected period is measured against. */
export interface Basis {
  label: string
  rev: number
  cost: number
  gp: number
  margin: number
  ppr: number
  drv: number
  cpr: number
  tax: number | null
}

export function basis(sel: Period, mode: CompareMode): Basis | null {
  if (mode === 'none') return null

  if (mode === 'prev') {
    const prev = ALL[sel.idx - 1]
    if (!prev) return null
    const d = der(prev)
    return {
      label: `vs ${prev.id}`,
      rev: prev.rev, cost: prev.cost, gp: d.gp, margin: d.margin,
      ppr: d.ppr, drv: d.drv, cpr: d.cpr, tax: (d.taxes / d.gross) * 100,
    }
  }

  if (mode === 'ly') {
    const rev = r2(sel.rev * 0.906)
    const cost = r2(sel.cost * 0.921)
    const routes = Math.round(sel.routes * 0.93)
    const gp = r2(rev - cost)
    return {
      label: `vs ${sel.id} · 2025`,
      rev, cost, gp, margin: (gp / rev) * 100, ppr: gp / routes,
      drv: ((cost * 0.8993) / rev) * 100, cpr: cost / routes, tax: null,
    }
  }

  const pool = PERIODS.filter((p) => !p.prov && p.idx < sel.idx).slice(-3)
  if (!pool.length) return null
  const rev = pool.reduce((a, p) => a + p.rev, 0) / pool.length
  const cost = pool.reduce((a, p) => a + p.cost, 0) / pool.length
  const routes = pool.reduce((a, p) => a + p.routes, 0) / pool.length
  const gp = rev - cost
  return {
    label: 'vs trailing-3 avg',
    rev, cost, gp, margin: (gp / rev) * 100, ppr: gp / routes,
    drv: ((cost * 0.8993) / rev) * 100, cpr: cost / routes, tax: null,
  }
}

// A delta is a percentage move, unless the measure is already a percentage —
// then it is points, because a percentage of a percentage misleads.
export function delta(
  cur: number,
  base: number | null | undefined,
  kind?: 'pts',
): { text: string; d: number } | null {
  if (base === null || base === undefined) return null
  if (kind === 'pts') {
    const d = cur - base
    return { text: `${d >= 0 ? '▲ ' : '▼ '}${Math.abs(d).toFixed(1)} pts`, d }
  }
  const g = ((cur - base) / base) * 100
  return { text: `${g >= 0 ? '▲ ' : '▼ '}${Math.abs(g).toFixed(1)}%`, d: g }
}

const BADGES: Record<BadgeKind, readonly [string, string, string, string, string]> = {
  closed: ['var(--success-bg)', 'var(--success-border)', 'var(--success-fg)', 'var(--success-accent)', 'Closed'],
  validated: ['var(--success-bg)', 'var(--success-border)', 'var(--success-fg)', 'var(--success-accent)', 'Validated'],
  projected: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)', 'var(--warning-accent)', 'Projected'],
  provisional: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)', 'var(--warning-accent)', 'Provisional'],
  dispute: ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger-fg)', 'var(--danger-accent)', 'Under dispute'],
  noinv: ['var(--surface-subtle)', 'var(--border-default)', 'var(--text-secondary)', 'var(--neutral-400)', 'No invoice'],
}

export function badge(kind: BadgeKind) {
  const [bg, border, fg, dot, label] = BADGES[kind]
  return { bg, border, fg, dot, label }
}

// Overtime as a share of payroll. A period with real timecards uses them; the
// rest carry a stable stand-in so the trend line has no holes.
export function otOf(p: Period): number {
  if (p.hours) {
    const h = p.hours
    return ((h.ot * 1.5) / (h.reg + h.ot * 1.5 + h.pto)) * 100
  }
  return 4.1 + (((p.idx * 7) % 10) / 10) * 1.4
}

// Splitting driver gross into regular and OT dollars at the implied rate.
export function otSplit(p: Period) {
  const h = p.hours!
  const rate = p.sp.dg / (h.reg + 1.5 * h.ot)
  return { regC: rate * h.reg, otC: rate * 1.5 * h.ot }
}

// Staffing against the routes a period ran, and what the surplus costs.
export function workforceOf(p: Period) {
  const req = Math.round(p.routes / 12)
  const extra = 2 + ((p.idx * 3) % 6)
  return { req, extra, util: (req / (req + extra)) * 100, idle: extra * 2064 }
}

export const PRODUCTIVE_RATE = 2064

// Red → amber → green across a normalised range, for the table's heat text.
export function scaleColor(t: number): string {
  const stops: [number, number, number][] = [
    [239, 68, 68],
    [234, 179, 8],
    [16, 185, 129],
  ]
  const x = Math.max(0, Math.min(1, t)) * 2
  const i = x < 1 ? 0 : 1
  const f = x - i
  const a = stops[i]
  const b = stops[i + 1]
  const mix = (n: 0 | 1 | 2) => Math.round(a[n] + (b[n] - a[n]) * f)
  return `rgb(${mix(0)},${mix(1)},${mix(2)})`
}

export const heat = (v: number, lo: number, hi: number, invert?: boolean) =>
  scaleColor(hi === lo ? 1 : invert ? 1 - (v - lo) / (hi - lo) : (v - lo) / (hi - lo))

export const rangeOf = (arr: number[]): [number, number] => [Math.min(...arr), Math.max(...arr)]

// Tooltip anchor, clamped so it never runs off either edge of the plot.
export const colLeft = (i: number, n: number) => `${Math.min(88, Math.max(12, ((i + 0.5) / n) * 100))}%`

// The band of driver-cost shares the closed periods have actually run at —
// the table flags anything outside it rather than against a fixed target.
export const driverBand = (() => {
  const vals = PERIODS.map((p) => der(p).drv)
  return { lo: Math.min(...vals), hi: Math.max(...vals) }
})()
