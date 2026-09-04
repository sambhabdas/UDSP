// The schedule's calendar.
//
// Everything is an offset from the Sunday that opens week 31 - Jul 26, 2026 -
// so a (week, day) pair is all a cell needs to know. Formatting is written out
// rather than delegated to `toLocaleDateString`, so the server and the browser
// print the same string.

export interface Day {
  y: number
  m: number
  d: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const leap = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
export const daysInMonth = (y: number, m: number): number =>
  [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]

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

/** 0 = Sunday. 1970-01-01 was a Thursday. */
export const weekday = (day: Day): number => ((toSerial(day) + 4) % 7 + 7) % 7

/** Week 31 opens on Sunday Jul 26, 2026 - the anchor the whole page hangs off. */
const ANCHOR: Day = { y: 2026, m: 6, d: 26 }
export const ANCHOR_WEEK = 31

export const dateOf = (week: number, day: number): Day =>
  fromSerial(toSerial(ANCHOR) + (week - ANCHOR_WEEK) * 7 + day)

/** The day the page treats as today - mid-week 33, so W31 reads as settled. */
export const TODAY: Day = { y: 2026, m: 7, d: 18 }

export const fmtDay = (week: number, day: number): string => {
  const d = dateOf(week, day)
  return `${MONTHS[d.m]} ${d.d}`
}

/** "07/26/2026" - what Paycom and ADP both want. */
export const fmtMdY = (week: number, day: number): string => {
  const d = dateOf(week, day)
  return `${String(d.m + 1).padStart(2, '0')}/${String(d.d).padStart(2, '0')}/${d.y}`
}

/** "2026-07-26" - the generic preset, and the file name. */
export const fmtIso = (week: number, day: number): string => {
  const d = dateOf(week, day)
  return `${d.y}-${String(d.m + 1).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
}

/** "Jul 26 - Aug 1, 2026", collapsing the month when both ends share one. */
export function weekLabel(week: number): string {
  const a = dateOf(week, 0)
  const b = dateOf(week, 6)
  const sameMonth = a.m === b.m
  return `${MONTHS[a.m]} ${a.d} - ${sameMonth ? '' : `${MONTHS[b.m]} `}${b.d}, ${a.y}`
}

/** The same label without the year - what the dialog titles use. */
export const weekLabelShort = (week: number): string => weekLabel(week).replace(', 2026', '')

// ── Minutes past midnight ──────────────────────────────────────────────────

/** 450 → "07:30" */
export const fmtT = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** 450 → "7:30 AM" - Paycom's column. */
export function fmtT12(min: number): string {
  const raw = Math.floor(min / 60)
  const m = min % 60
  const ap = raw >= 12 ? 'PM' : 'AM'
  const h = raw % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}

/** "07:30" → 450, and anything else → null. */
export function parseT(text: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text.trim())
  if (!m) return null
  const mm = Number(m[2])
  return mm < 60 ? Number(m[1]) * 60 + mm : null
}
