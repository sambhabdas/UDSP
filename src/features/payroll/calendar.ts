// Payroll calendar maths, ported from PayrollSetup.dc.html.
//
// The unit is the Amazon invoice week: Sunday to Saturday, carrying Amazon's
// real week number and always year-qualified. A payroll is two consecutive
// weeks, so a year is 26 of them. Labels are never renumbered and never
// re-based to the calendar's own year - `W<number> · <year>` is the week's
// real identity, and it is how Invoice Validation and Profitability name the
// week they scope to.

export const PERIODS_PER_YEAR = 26
export const DAY_MS = 86400000
export const WEEK_MS = 604800000

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

// Pinned to en-US rather than to `env.locale`: `dateRange` below reads this
// output back apart to collapse a shared month, and that surgery assumes the
// English "Mon D" shape.
export function fmtD(d: Date, withYear?: boolean): string {
  return d.toLocaleDateString(
    'en-US',
    withYear ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' },
  )
}

// Local-date ISO - `toISOString` would shift the day for anyone west of UTC.
export function iso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function fromIso(s: string): Date {
  const [y, m, dd] = s.split('-').map(Number)
  return new Date(y, m - 1, dd)
}

export { money } from '../../ds/format'

// A hyphen for ranges, the way the design files write them ("Jul 12 - 18",
// "Aug 21-22"); the end year is printed only when it leaves the
// calendar's own year, which a 26-period calendar seeded after W1 always does.
export function fmtRange(a: Date, b: Date, ctxYear: number | string | null): string {
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  const end = sameMonth ? String(b.getDate()) : fmtD(b)
  return (
    fmtD(a) +
    (sameMonth ? '-' : ' - ') +
    end +
    (b.getFullYear() !== Number(ctxYear) ? ', ' + b.getFullYear() : '')
  )
}

// W1 of a week-year starts on the Sunday on or before Jan 1.
export function startW1(y: number): Date {
  const jan1 = new Date(y, 0, 1)
  return addDays(jan1, -jan1.getDay())
}

export function weekOf(d: Date): { n: number; y: number } {
  let wy = d.getFullYear() + 1
  if (d < startW1(wy)) wy -= 1
  const n = Math.round((d.getTime() - startW1(wy).getTime()) / WEEK_MS) + 1
  return { n, y: wy }
}

// "W6 + W7 · 2026", or "W52 · 2026 + W1 · 2027" when the pair straddles the
// week-year boundary. A 53-week source year simply supplies W53 before W1.
export function periodWeeks(start: Date): string {
  const a = weekOf(start)
  const b = weekOf(addDays(start, 7))
  return a.y === b.y
    ? `W${a.n} + W${b.n} · ${a.y}`
    : `W${a.n} · ${a.y} + W${b.n} · ${b.y}`
}

// The gap between a period's end and its pay date is fixed once, from payroll
// #1, and then applied to all 26.
/** One of the 26 payrolls: two Amazon weeks, and the date they are paid on. */
export interface PeriodRow {
  n: number
  start: Date
  end: Date
  pay: Date
  /** True once the pay date has been hand-edited away from the fixed offset. */
  overridden: boolean
}

export function generatePeriods(seed: Date, firstPay: Date): PeriodRow[] {
  const offset = Math.round((firstPay.getTime() - addDays(seed, 13).getTime()) / DAY_MS)
  return Array.from({ length: PERIODS_PER_YEAR }, (_, i) => {
    const start = addDays(seed, i * 14)
    const end = addDays(start, 13)
    return { n: i + 1, start, end, pay: addDays(end, offset), overridden: false }
  })
}
