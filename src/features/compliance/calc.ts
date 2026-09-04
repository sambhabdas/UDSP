// The arithmetic the board is read by. Nothing here touches state: every value
// is derived from a person plus the two thresholds the setup tab controls.

import { LUNCH_WINDOW, MIN_LUNCH, NOW } from './data'
import type { Minutes, Person, WarnKey, Work } from './data'

/** 24-hour, no leading zero on the hour - the board's own format. */
export function fmt(m: Minutes | null | undefined): string {
  if (m === null || m === undefined) return ''
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h}:${mm < 10 ? '0' : ''}${mm}`
}

/** 12-hour with the meridiem - only the message previews use it. */
export function fmt12(m: Minutes): string {
  const h = Math.floor(m / 60)
  const mm = m % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mm < 10 ? '0' : ''}${mm} ${ap}`
}

export interface RowEval {
  p: Person
  /** The work in force: an override if one was made, otherwise the seed's. */
  work: Work | null
  warns: WarnKey[]
  /** When the lunch window shuts. `null` until they punch in. */
  close: Minutes | null
  state: 'future' | 'warn' | 'clean'
}

/**
 * Score one row.
 *
 * A shift that has not started yet is not scored at all - no warnings, no
 * contribution to the compliance percentage - because there is nothing yet to
 * be non-compliant about.
 */
export function evalRow(
  p: Person,
  opts: { grace: number; lead: number; assigned: Record<string, Work | 'none' | undefined> },
): RowEval {
  const { grace, lead, assigned } = opts
  const override = assigned[p.id]
  const work = override === 'none' ? null : (override ?? p.work)
  const warns: WarnKey[] = []
  const close = p.inP !== null ? p.inP + LUNCH_WINDOW : null

  if (p.future) return { p, work, warns, close, state: 'future' }

  if (p.sched !== null && p.inP === null && NOW > p.sched + grace) warns.push('snI')
  if (p.inP !== null && !p.hasRow) warns.push('inNS')
  if (p.sched !== null && p.inP !== null && p.inP > p.sched + grace) warns.push('lateIn')
  // Work that has been closed out with nobody clocking out is a payroll problem.
  if (p.inP !== null && p.out === null && work && work.left) warns.push('noOut')
  if (p.inP !== null && p.out === null && !work) warns.push('noWork')
  if (close !== null && p.ls === null && p.out === null) {
    if (NOW > close) warns.push('missed')
    else if (NOW >= close - lead) warns.push('closing')
  }
  if (p.ls !== null && close !== null && p.ls > close) warns.push('lateL')
  if (p.ls !== null && p.le !== null && p.le - p.ls < MIN_LUNCH) warns.push('shortL')

  return { p, work, warns, close, state: warns.length ? 'warn' : 'clean' }
}

/** A row worth texting: no punch, or a lunch window closing or already shut. */
export function remindable(x: RowEval): boolean {
  return (
    x.warns.includes('snI') ||
    x.warns.includes('closing') ||
    (x.warns.includes('missed') && x.p.out === null)
  )
}

/**
 * The board's resting order: the two red states first, then anything else with
 * a warning, then clean rows, then shifts that have not started, then people
 * who have already gone home.
 */
export function severity(x: RowEval): number {
  if (x.p.out !== null) return 4
  if (x.state === 'future') return 3
  if (x.warns.some((w) => w === 'snI' || w === 'missed')) return 0
  return x.warns.length ? 1 : 2
}

export function onARoute(w: Work | null): boolean {
  return !!w && (w.kind === 'route' || w.kind === 'rescue')
}

/** Punched in and not yet out. */
export function onClock(p: Person): boolean {
  return p.inP !== null && p.out === null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function dateLabel(d: Date): string {
  return `${DAYS[d.getDay()]} ${MONS[d.getMonth()]} ${d.getDate()}`
}

/** SMS billing: one segment to 160 characters, then 153 per segment. */
export function smsSegments(text: string): number {
  return text.length <= 160 ? 1 : Math.ceil(text.length / 153)
}
