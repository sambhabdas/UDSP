// Payroll calendar maths, ported from PayrollSetup.dc.html.
//
// The unit is the Amazon invoice week: Sunday to Saturday, carrying Amazon's
// real week number and always year-qualified. A payroll is two consecutive
// weeks, so a year is 26 of them. Labels are never renumbered and never
// re-based to the calendar's own year — `W<number> · <year>` is the week's
// real identity, and it is how Invoice Validation and Profitability name the
// week they scope to.

export const PERIODS_PER_YEAR = 26
export const DAY_MS = 86400000
export const WEEK_MS = 604800000

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function fmtD(d, withYear) {
  return d.toLocaleDateString(
    'en-US',
    withYear ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' },
  )
}

// Local-date ISO — `toISOString` would shift the day for anyone west of UTC.
export function iso(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function fromIso(s) {
  const [y, m, dd] = s.split('-').map(Number)
  return new Date(y, m - 1, dd)
}

export function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// An en dash for ranges; the end year is printed only when it leaves the
// calendar's own year, which a 26-period calendar seeded after W1 always does.
export function fmtRange(a, b, ctxYear) {
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  const end = sameMonth ? String(b.getDate()) : fmtD(b)
  return (
    fmtD(a) +
    (sameMonth ? '–' : ' – ') +
    end +
    (b.getFullYear() !== Number(ctxYear) ? ', ' + b.getFullYear() : '')
  )
}

// W1 of a week-year starts on the Sunday on or before Jan 1.
export function startW1(y) {
  const jan1 = new Date(y, 0, 1)
  return addDays(jan1, -jan1.getDay())
}

export function weekOf(d) {
  let wy = d.getFullYear() + 1
  if (d < startW1(wy)) wy -= 1
  const n = Math.round((d - startW1(wy)) / WEEK_MS) + 1
  return { n, y: wy }
}

// "W6 + W7 · 2026", or "W52 · 2026 + W1 · 2027" when the pair straddles the
// week-year boundary. A 53-week source year simply supplies W53 before W1.
export function periodWeeks(start) {
  const a = weekOf(start)
  const b = weekOf(addDays(start, 7))
  return a.y === b.y
    ? `W${a.n} + W${b.n} · ${a.y}`
    : `W${a.n} · ${a.y} + W${b.n} · ${b.y}`
}

// The gap between a period's end and its pay date is fixed once, from payroll
// #1, and then applied to all 26.
export function generatePeriods(seed, firstPay) {
  const offset = Math.round((firstPay - addDays(seed, 13)) / DAY_MS)
  return Array.from({ length: PERIODS_PER_YEAR }, (_, i) => {
    const start = addDays(seed, i * 14)
    const end = addDays(start, 13)
    return { n: i + 1, start, end, pay: addDays(end, offset), overridden: false }
  })
}
