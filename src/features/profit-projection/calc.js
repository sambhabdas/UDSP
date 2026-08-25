// Formatters and the derived maths behind Profit Projection.
// Ported from ProfitProjection.dc.html so the figures match the design file
// exactly rather than being re-derived.

import { AXIS, DAY3_BREAKDOWN, DAYS, DEFAULT_DAY } from './data.js'

export const money = (v) =>
  (v < 0 ? '-$' : '$') +
  Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const money0 = (v) =>
  (v < 0 ? '-$' : '$') + Math.round(Math.abs(v)).toLocaleString('en-US')

export const pct = (v, d = 1) => `${v.toFixed(d)}%`

export const num = (v, d = 0) =>
  v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })

export const DASH = '—'

// Cost is payroll and nothing else.
export const costOf = (i) => DAYS[i].payroll
export const revOf = (i) => DAYS[i].revenue

export const statusOf = (i, locked) => (locked[i] ? 'locked' : DAYS[i].status)

const BADGES = {
  actual: ['var(--success-bg)', 'var(--success-border)', 'var(--success-fg)', 'var(--success-accent)', 'Actual'],
  projected: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)', 'var(--warning-accent)', 'Projected'],
  locked: ['var(--surface-subtle)', 'var(--border-default)', 'var(--text-secondary)', 'var(--neutral-400)', 'Locked'],
}

export function badge(kind) {
  const [bg, border, fg, dot, label] = BADGES[kind]
  return { bg, border, fg, dot, label }
}

// Wed Jul 29 carries hand-checked figures; every other day derives its split
// from the day's payroll and OT share.
export function breakdownOf(i) {
  if (i === DEFAULT_DAY) return DAY3_BREAKDOWN
  const d = DAYS[i]
  const taxes = d.payroll * 0.0915
  const wc = d.payroll * 0.0775
  const bonus = 13
  const gross = d.payroll - taxes - wc - bonus
  const ot = (gross * d.otPct) / 100
  return [
    { label: 'Regular pay', amt: gross - ot },
    { label: 'Overtime', amt: ot },
    { label: 'Employer taxes', amt: taxes },
    { label: 'Workers’ comp', amt: wc },
    { label: 'Bonus', amt: bonus },
  ]
}

// Workers' comp is per hour; taxes are a share of pay.
export function personDerived(p) {
  const total = p.reg + p.ot
  const wc = total * 2.25
  const taxes = (p.regD + p.otD) * 0.11
  return { total, wc, taxes, cost: p.regD + p.otD + wc + taxes }
}

export const weekTotals = () => {
  const routes = DAYS.reduce((s, d) => s + d.routes, 0)
  const clock = DAYS.reduce((s, d) => s + d.clock, 0)
  const hours = DAYS.reduce((s, d) => s + d.hours, 0)
  const rev = DAYS.reduce((s, _, i) => s + revOf(i), 0)
  const cost = DAYS.reduce((s, _, i) => s + costOf(i), 0)
  const profit = rev - cost
  return { routes, clock, hours, rev, cost, profit, margin: (profit / rev) * 100 }
}

export const marginOf = (i) => ((revOf(i) - costOf(i)) / revOf(i)) * 100
export const cprOf = (i) => costOf(i) / DAYS[i].routes

// The OT hours behind a day — the design pins Wed Jul 29 and divides the rest
// by the $33.75 default OT rate.
export const otHoursOf = (i) => (i === DEFAULT_DAY ? 47.14 : breakdownOf(i)[1].amt / 33.75)

export function regularVsOt(i) {
  const bd = breakdownOf(i)
  const otD = bd[1].amt
  const regD = bd[0].amt
  const otH = otHoursOf(i)
  return { otD, regD, otH, regH: DAYS[i].hours - otH }
}

// Anyone clocked in beyond the route count is idle capacity, priced at the
// day's average cost per person.
export function workforceOf(i) {
  const d = DAYS[i]
  const extra = Math.max(0, d.clock - d.routes)
  const perPerson = costOf(i) / d.clock
  const idle = extra * perPerson
  return { extra, idle, productive: costOf(i) - idle }
}

// Red → amber → green across a normalised range, for the table's heat text.
export function scaleColor(t) {
  const stops = [
    [239, 68, 68],
    [234, 179, 8],
    [16, 185, 129],
  ]
  const x = Math.max(0, Math.min(1, t)) * 2
  const i = x < 1 ? 0 : 1
  const f = x - i
  const a = stops[i]
  const b = stops[i + 1]
  const mix = (n) => Math.round(a[n] + (b[n] - a[n]) * f)
  return `rgb(${mix(0)},${mix(1)},${mix(2)})`
}

export const marginColor = (m) =>
  m >= 15 ? 'var(--success-fg)' : m >= 5 ? 'var(--warning-fg)' : 'var(--danger-fg)'

// Cost-per-route plots on a $260–$320 window, measured from the top.
export const cprY = (v) => ((AXIS.cprHi - v) / (AXIS.cprHi - AXIS.cprLo)) * 100

// Tooltip anchor for a 7-column plot, clamped so it never runs off either edge.
export const colLeft = (i, n = 7) => `${Math.min(86, Math.max(14, ((i + 0.5) / n) * 100))}%`
