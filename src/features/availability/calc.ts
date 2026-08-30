// The day-offset calendar and the cell lookup.
//
// The grid addresses days as offsets from the anchor Sunday (Jul 26, 2026), so
// a selection can straddle a week boundary without special-casing anything.
// The arithmetic reuses Schedule's pure serial helpers — the two pages must
// never disagree about which Sunday opens week 31.

import { ANCHOR_WEEK, DAY_NAMES, MONTH_NAMES, dateOf, daysInMonth, fromSerial, toSerial, type Day } from '../schedule/date'
import type { Cell, Da, Overrides } from './data'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const ANCHOR_SERIAL = toSerial(dateOf(ANCHOR_WEEK, 0))

/** Offset 0 is the Sunday that opens week 31. */
export const dayOfOffset = (off: number): Day => fromSerial(ANCHOR_SERIAL + off)

export const offsetOfDay = (d: Day): number => toSerial(d) - ANCHOR_SERIAL

export const weekOfOffset = (off: number): number => ANCHOR_WEEK + Math.floor(off / 7)

export const dowOfOffset = (off: number): number => ((off % 7) + 7) % 7

export const dayName = (i: number): string => DAY_NAMES[i]

/** "Jul 26 - Aug 1, 2026", collapsing the month when both ends share one. */
export function rangeLabel(a: number, b: number): string {
  const d1 = dayOfOffset(a)
  const d2 = dayOfOffset(b)
  const same = d1.m === d2.m
  return `${MONTHS[d1.m]} ${d1.d} - ${same ? '' : `${MONTHS[d2.m]} `}${d2.d}, ${d2.y}`
}

export const shortDate = (off: number): string => {
  const d = dayOfOffset(off)
  return `${MONTHS[d.m]} ${d.d}`
}

/** "8/5" — the cell dialog's title. */
export const numericDate = (off: number): string => {
  const d = dayOfOffset(off)
  return `${d.m + 1}/${d.d}`
}

export interface Column {
  off: number
  week: number
  dow: number
}

export function columnsFor(start: number, end: number): Column[] {
  const cols: Column[] = []
  for (let o = start; o <= end; o++) cols.push({ off: o, week: weekOfOffset(o), dow: dowOfOffset(o) })
  return cols
}

/** The override on a cell, if there is one. */
export function overrideAt(overrides: Overrides, daId: string, day: number, week: number): Cell | null {
  return overrides[week]?.[daId]?.[day] ?? null
}

/**
 * What a cell actually says: the override if one exists, otherwise the
 * standing pattern — which is itself a value, not an absence of one.
 */
export function effective(overrides: Overrides, da: Da, day: number, week: number): Cell {
  const o = overrideAt(overrides, da.id, day, week)
  if (o) return o
  return da.pattern[day] ? { t: 'A', src: 'pattern' } : { t: 'U', src: 'pattern' }
}

/** Write, clear, and prune — an empty day map is removed, not left behind. */
export function writeCell(overrides: Overrides, daId: string, day: number, value: Cell | null, week: number): Overrides {
  const next: Overrides = JSON.parse(JSON.stringify(overrides))
  const w = (next[week] ??= {})
  const d = (w[daId] ??= {})
  if (value === null) delete d[day]
  else d[day] = value
  if (Object.keys(d).length === 0) delete w[daId]
  return next
}

export function countOverrides(overrides: Overrides, week: number): number {
  const w = overrides[week]
  if (!w) return 0
  return Object.keys(w).reduce((a, id) => a + Object.keys(w[id]).length, 0)
}

// ── The two-month picker ────────────────────────────────────────────────────

export interface CalCell {
  key: string
  label: string
  off: number | null
  inRange: boolean
  inSelection: boolean
  isEdge: boolean
  isToday: boolean
  hint: string
}

/** The day the page treats as today — the same one Schedule uses. */
const TODAY_SERIAL = toSerial({ y: 2026, m: 7, d: 18 })

/** Which weekday the 1st of a month falls on. */
const firstWeekday = (y: number, m: number): number => ((toSerial({ y, m, d: 1 }) + 4) % 7 + 7) % 7

export function monthCells(
  year: number,
  month: number,
  selStart: number,
  selEnd: number,
  pending: number | null,
  minOffset: number,
  maxOffset: number,
  maxSpan: number,
): CalCell[] {
  const cells: CalCell[] = []
  const lead = firstWeekday(year, month)
  for (let i = 0; i < lead; i++) {
    cells.push({ key: `pad-${month}-${i}`, label: '', off: null, inRange: false, inSelection: false, isEdge: false, isToday: false, hint: '' })
  }
  const total = daysInMonth(year, month)
  for (let d = 1; d <= total; d++) {
    const serial = toSerial({ y: year, m: month, d })
    const off = serial - ANCHOR_SERIAL
    const withinBounds = off >= minOffset && off <= maxOffset
    // Once a start is picked, only days within the span limit stay reachable.
    const inRange = withinBounds && (pending === null || Math.abs(off - pending) <= maxSpan - 1)
    const inSelection = pending === null ? off >= selStart && off <= selEnd : off === pending
    const isEdge = pending === null ? off === selStart || off === selEnd : off === pending
    cells.push({
      key: `d-${month}-${d}`,
      label: String(d),
      off,
      inRange,
      inSelection,
      isEdge,
      isToday: serial === TODAY_SERIAL,
      hint: !inRange
        ? (pending !== null && withinBounds ? `Outside the ${maxSpan} day limit` : '')
        : pending === null ? 'Pick a start date' : off === pending ? 'Start date - pick an end date' : 'End date',
    })
  }
  return cells
}

export { MONTH_NAMES }
