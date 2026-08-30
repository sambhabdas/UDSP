// The maths behind Rate Cards, ported from RateCards.dc.html.
//
// One rule underneath all of it: a day is priced with the window in force on
// that day. Nothing here ever prices a range with a single rate.

import {
  COST,
  DAILY,
  OVERHEAD,
  PKG,
  TODAY,
  TRAIN,
  WEEK0,
} from './data'
import type { RateWindow, ServiceType, WindowState } from './data'

// ---- dates ------------------------------------------------------------------
//
// Everything works in local Y/M/D. `iso` deliberately builds the string from
// the local components rather than `toISOString`, which would shift the day for
// anyone west of UTC.

export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const addMonths = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth() + n, 1)

export const iso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const fromIso = (s: string): Date => {
  const [y, m, d] = String(s).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole days between two dates, normalised through local Y/M/D so a DST
 *  boundary cannot make a day 23 or 25 hours long. */
export const days = (a: Date, b: Date): number =>
  Math.round((fromIso(iso(b)).getTime() - fromIso(iso(a)).getTime()) / 86400000)

export const fmtD = (d: Date, withYear?: boolean): string =>
  d.toLocaleDateString(
    'en-US',
    withYear
      ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
      : { weekday: 'short', month: 'short', day: 'numeric' },
  )

export { money } from '../../ds/format'

/** Per-package rates are cents, so they keep two decimals without grouping. */
export const cents = (n: number): string => '$' + Number(n).toFixed(2)

export { int } from '../../ds/format'

// ---- windows ----------------------------------------------------------------

/** The window in force on a day: the latest one that has started and not ended. */
export function winOn(list: RateWindow[], d: Date): RateWindow | null {
  const k = iso(d)
  let best: RateWindow | null = null
  list.forEach((w) => {
    if (w.from <= k && (!w.to || w.to >= k)) {
      if (!best || w.from > best.from) best = w
    }
  })
  return best
}

export const rateOn = (t: ServiceType, d: Date): number | null => winOn(t.windows, d)?.rate ?? null

/** How the To column and the filters describe a type. */
export function windowState(t: ServiceType, on: Date = TODAY): WindowState {
  if (t.paidBy === 'DSP') return 'Locked'
  return winOn(t.windows, on)?.to ? 'Bounded' : 'Open'
}

// ---- counts -----------------------------------------------------------------
//
// The seeded week carries real per-day counts. Beyond it the design file shapes
// a plausible curve with a sine. It seeds that from `getTime()`, which is
// timezone-dependent and would therefore disagree between the server and the
// browser; seeding from the day index instead keeps the same shape and renders
// identically wherever it runs.

const dayIndex = (d: Date): number => days(new Date(1970, 0, 1), d)

const wiggle = (d: Date, salt: number): number => Math.abs(Math.sin(dayIndex(d) + salt))

/** Index into the seeded week, or -1 outside it. */
const weekSlot = (d: Date): number => {
  const i = days(WEEK0, d)
  return i >= 0 && i < 7 ? i : -1
}

export function routesOn(t: ServiceType, d: Date): number {
  if (iso(d) < t.created) return 0
  const slot = weekSlot(d)
  const daily = DAILY[t.id] ?? [0, 0, 0, 0, 0, 0, 0]
  if (slot >= 0) return daily[slot]
  const base = daily.reduce((a, b) => a + b, 0) / 7
  return Math.max(0, Math.round(base * (0.8 + 0.4 * wiggle(d, t.id.length * 7.3))))
}

export function pkgsOn(d: Date): number {
  const slot = weekSlot(d)
  if (slot >= 0) return PKG[slot]
  return Math.round(7200 * (0.9 + 0.2 * wiggle(d, 3.1)))
}

export function trainingsOn(d: Date): number {
  const slot = weekSlot(d)
  if (slot >= 0) return TRAIN[slot]
  return Math.round(2 * (0.5 + wiggle(d, 5.7)))
}

export function rangeDays(a: Date, b: Date): Date[] {
  const out: Date[] = []
  for (let d = new Date(a); d <= b; d = addDays(d, 1)) out.push(new Date(d))
  return out
}

/** Revenue over a range, plus how many distinct rates it took to price it —
 *  which is what the "2 rates" chip on a row is counting. */
export function revenueFor(t: ServiceType, a: Date, b: Date): { sum: number; rateCount: number } {
  let sum = 0
  const rates = new Set<number>()
  rangeDays(a, b).forEach((d) => {
    const r = rateOn(t, d)
    const n = routesOn(t, d)
    if (r == null || !n) return
    sum += r * n
    rates.add(r)
  })
  return { sum, rateCount: rates.size }
}

export function dayRevenue(
  types: ServiceType[],
  pkgWindows: RateWindow[],
  d: Date,
): number {
  let sum = 0
  types.forEach((t) => {
    const r = rateOn(t, d)
    if (r != null) sum += r * routesOn(t, d)
  })
  const p = winOn(pkgWindows, d)
  if (p?.paid) sum += pkgsOn(d) * p.rate
  return sum
}

export function dayCost(types: ServiceType[], d: Date): number {
  return types.reduce((sum, t) => sum + routesOn(t, d) * (COST[t.id] ?? 0), OVERHEAD)
}

// ---- editing ----------------------------------------------------------------

/**
 * Write a new window into a list without ever leaving two rates on one day.
 *
 * Anything already running when the new window starts is closed the day before
 * it; anything wholly inside the new window is dropped. A bounded change also
 * puts the previous rate back the day after it ends — which is what makes
 * "$180 for one day, then back to $150" a single gesture.
 */
export function applyWindow(
  list: RateWindow[],
  rate: number,
  fromIsoStr: string,
  toIsoStr: string,
  carry: boolean,
  meta: Partial<RateWindow>,
): RateWindow[] {
  const prev = winOn(list, fromIso(fromIsoStr))
  let out = list.map((w) => ({ ...w }))

  out.forEach((w) => {
    if (w.from < fromIsoStr && (!w.to || w.to >= fromIsoStr)) {
      w.to = iso(addDays(fromIso(fromIsoStr), -1))
    }
  })

  const end = carry ? null : toIsoStr
  out = out.filter((w) => !(w.from >= fromIsoStr && (end === null || (w.to !== null && w.to <= end))))
  out.push({ rate, from: fromIsoStr, to: end, bounded: !carry, by: '', at: '', ...meta })

  if (!carry && prev) {
    const after = iso(addDays(fromIso(toIsoStr), 1))
    if (prev.to === null || prev.to >= after) {
      out.push({
        rate: prev.rate,
        paid: prev.paid,
        from: after,
        to: prev.to,
        by: prev.by,
        at: prev.at,
        bounded: false,
      })
    }
  }

  return out
    .filter((w) => !w.to || w.to >= w.from)
    .sort((a, b) => (a.from < b.from ? -1 : 1))
}
