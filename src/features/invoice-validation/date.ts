// Plain calendar dates.
//
// The page is a calendar of Amazon weeks, and every label it prints is derived
// from one. `Date` is deliberately avoided in the formatters: a value built
// from local parts on the server and read back on the client is safe, but
// `toLocaleDateString` is not something to bet a hydration pass on. These are
// pure integer triples with their own arithmetic, so the server and the browser
// print the same string by construction.

export interface Day {
  y: number
  m: number
  /** 1-31. */
  d: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const leap = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

export function daysInMonth(y: number, m: number): number {
  return [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]
}

/** Days since 1970-01-01, so two dates can be compared and subtracted. */
export function toSerial({ y, m, d }: Day): number {
  let days = 0
  for (let yy = 1970; yy < y; yy++) days += leap(yy) ? 366 : 365
  for (let mm = 0; mm < m; mm++) days += daysInMonth(y, mm)
  return days + d - 1
}

export function fromSerial(n: number): Day {
  let y = 1970
  let rest = n
  for (;;) {
    const len = leap(y) ? 366 : 365
    if (rest < len) break
    rest -= len
    y++
  }
  let m = 0
  for (;;) {
    const len = daysInMonth(y, m)
    if (rest < len) break
    rest -= len
    m++
  }
  return { y, m, d: rest + 1 }
}

export const addDays = (day: Day, k: number): Day => fromSerial(toSerial(day) + k)

/** 0 = Sunday. 1970-01-01 was a Thursday, hence the +4. */
export const weekday = (day: Day): number => ((toSerial(day) + 4) % 7 + 7) % 7

export const before = (a: Day, b: Day): boolean => toSerial(a) < toSerial(b)
export const same = (a: Day, b: Day): boolean => toSerial(a) === toSerial(b)
export const daysBetween = (a: Day, b: Day): number => toSerial(b) - toSerial(a)

/** "Jul 29" */
export const fmt = (day: Day): string => `${MONTHS[day.m]} ${day.d}`
/** "Jul 29, 2026" */
export const fmtY = (day: Day): string => `${MONTHS[day.m]} ${day.d}, ${day.y}`
/** "August 2026" — the date picker's heading. */
export const fmtMonth = (day: Day): string => `${MONTHS_LONG[day.m]} ${day.y}`

/**
 * Amazon's week N of a year: week 1 contains Jan 1, and weeks run Sunday to
 * Saturday. So week N starts on the Sunday of Jan 1's week plus N-1 weeks.
 */
export function weekStart(y: number, n: number): Day {
  const jan1: Day = { y, m: 0, d: 1 }
  return addDays(jan1, -weekday(jan1) + (n - 1) * 7)
}

export const weekEnd = (y: number, n: number): Day => addDays(weekStart(y, n), 6)

/** "Jul 26 - Aug 1", collapsing to "Jul 26 - 31" inside one month. */
export function weekRange(n: number): string {
  const a = weekStart(2026, n)
  const b = weekEnd(2026, n)
  return a.m === b.m ? `${fmt(a)} - ${b.d}` : `${fmt(a)} - ${fmt(b)}`
}

export const weekName = (n: number): string => `W${n} · 2026`
