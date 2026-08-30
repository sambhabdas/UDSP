// The rules behind Dispatch, ported from Dispatch.dc.html.
//
// Times are minutes since midnight throughout, and only become clock strings at
// the edge. That is what lets "12 minutes late" be arithmetic rather than string
// work, and it is why `fmt` is the only place a colon is written.

import { NOW, ROUTE_BANDS } from './data'
import type { BenchRow, Day, Minutes, Row, RowWarning } from './data'

export const fmt = (m: Minutes | null | undefined): string => {
  if (m === null || m === undefined) return ''
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h}:${mm < 10 ? '0' : ''}${mm}`
}

/** Reads a typed `h:mm` back to minutes. Anything else is not a time. */
export const parseT = (s: string): Minutes | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec((s || '').trim())
  return m ? Math.min(1439, parseInt(m[1]) * 60 + parseInt(m[2])) : null
}

/** Scheduled arrival: the wave less the offset, unless a row overrides it. */
export const schedOf = (r: Row, schedOff: number): Minutes | null => {
  if (r.schedOv) return r.sched ?? null
  return r.wave === null ? null : r.wave - schedOff
}

/** A row can launch once it has all four of the things a launch needs. */
export const ready = (r: Row): boolean => !!(r.emp && r.van && r.route && r.wave !== null)

export interface PunchState {
  txt: string
  color: string
  weight: string
  title: string
}

/**
 * What the Punched In cell says, and why.
 *
 * The grace window is the whole point: a punch inside it is simply on time, and
 * only past it does the cell start counting minutes. A row with no scheduled
 * arrival cannot be late — it has nothing to be late against — so it reports the
 * punch plainly rather than inventing a verdict.
 */
export function punchState(
  r: Row | BenchRow,
  opts: { schedOff: number; grace: number; now?: Minutes; isBench?: boolean },
): PunchState {
  const { schedOff, grace, now = NOW, isBench } = opts
  const sched = isBench
    ? ((r as BenchRow).schedArr ?? null)
    : schedOf(r as Row, schedOff)

  if (!isBench && (r as Row).noDriver) {
    return { txt: '-', color: 'var(--text-secondary)', weight: 'var(--weight-regular)', title: 'No driver on the row' }
  }
  if (sched === null) {
    return r.punch !== null
      ? { txt: fmt(r.punch), color: 'var(--text-primary)', weight: 'var(--weight-regular)', title: 'Punched in - no scheduled arrival on this row' }
      : { txt: 'Not yet', color: 'var(--text-secondary)', weight: 'var(--weight-regular)', title: 'No punch yet' }
  }
  if (r.punch !== null) {
    if (r.punch <= sched + grace) {
      return { txt: fmt(r.punch), color: 'var(--success-fg)', weight: 'var(--weight-semibold)', title: 'Punched inside the grace window' }
    }
    return {
      txt: `${fmt(r.punch)} +${r.punch - sched}`,
      color: 'var(--warning-fg)',
      weight: 'var(--weight-semibold)',
      title: `${r.punch - sched} minutes after the scheduled arrival`,
    }
  }
  if (now > sched + grace) {
    return {
      txt: `Not yet · ${now - sched} late`,
      color: 'var(--danger-fg)',
      weight: 'var(--weight-semibold)',
      title: 'Sched plus the grace window has passed',
    }
  }
  return { txt: 'Not yet', color: 'var(--text-secondary)', weight: 'var(--weight-regular)', title: 'Not due yet' }
}

/** Whether a row has punched, is late, or is simply not due — the three states
 *  the wave boxes count. */
export type WaveState = 'in' | 'missing' | 'out'

export function waveStateOf(r: Row, schedOff: number, grace: number, now: Minutes = NOW): WaveState {
  if (r.punch !== null) return 'in'
  const s = schedOf(r, schedOff)
  return s !== null && now > s + grace ? 'missing' : 'out'
}

/**
 * Everything wrong with a row.
 *
 * The duplicate checks are the ones that matter most: one van cannot have two
 * holders, and a route code on two rows is a code On Road matches against and
 * Return to Station closes by. De-duplicated by kind so a row cannot shout the
 * same thing twice.
 */
export function warnsOf(r: Row, day: Day): RowWarning[] {
  const list: RowWarning[] = []
  if (r.warn) list.push(r.warn)
  if (!r.tr && r.emp) list.push({ k: 'tr', label: 'Transporter ID not found' })
  const rows = day.rows
  if (r.van && rows.filter((x) => x.van === r.van).length > 1) {
    list.push({ k: 'dupvan', label: `${r.van} is on two rows - one van, one holder` })
  }
  if (r.route && rows.filter((x) => x.route === r.route).length > 1) {
    list.push({
      k: 'duproute',
      label: `${r.route} is on two rows - the code On Road matches and Return to Station closes by`,
    })
  }
  if (r.tr && rows.filter((x) => x.tr === r.tr).length > 1) {
    list.push({ k: 'duptr', label: 'This transporter ID is on two rows - one ID, one person' })
  }
  if (r.inactive) {
    list.push({ k: 'inactive', label: 'Roster record is inactive - excluded from every group send' })
  }
  const seen = new Set<string>()
  return list.filter((w) => (seen.has(w.k) ? false : (seen.add(w.k), true)))
}

/** Where a person already is today, so seating them somewhere else can say what
 *  it would cost. */
export function whereOf(day: Day, name: string): { hint: string; dot: string } {
  if (day.rows.some((r) => r.emp === name)) return { hint: 'On the roster', dot: 'var(--blue-500)' }
  const bench = day.sb.find((s) => s.emp === name)
  if (bench) {
    if (bench.status === 'on rescue') return { hint: 'On a rescue', dot: 'var(--blue-500)' }
    return { hint: 'Standby', dot: 'var(--success-accent)' }
  }
  if (day.oc.some((o) => o.emp === name)) return { hint: 'On call', dot: 'var(--warning-accent)' }
  if (day.co.some((c) => c.emp === name)) return { hint: 'Called out', dot: 'var(--danger-accent)' }
  return { hint: 'Not scheduled', dot: 'var(--neutral-400)' }
}

/** Rows that will actually launch — OPS and Trainer rows are here but are not
 *  routes, so they never count toward readiness. */
export const routeRows = (rows: Row[]): Row[] => rows.filter((r) => ROUTE_BANDS.includes(r.band))

export const dateLabel = (dayOff: number): string => {
  const base = new Date(2026, 6, 29 + dayOff)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[base.getDay()]} ${mons[base.getMonth()]} ${base.getDate()}, ${base.getFullYear()}`
}

// ---- On Road ----------------------------------------------------------------

import { ON_NOW } from './data'
import type { Itinerary, OnRoadNote, Rescue } from './data'

/** How a route is going. `preimport` means the itinerary file has not landed. */
export type RouteState = 'pace' | 'behind' | 'nodata' | 'done' | 'preimport'

/** One line on the On Road board — a launched route, or a rescue in flight. */
export type BoardItem =
  | {
      kind: 'route'
      id: string
      r: Row
      it: Itinerary | null
      st: RouteState
      plan: Minutes | null
      done: boolean
      late: boolean
      msgsOff: boolean
      note: Day['orNotes'][string] | null
      sent: string | null
    }
  | {
      kind: 'rescue'
      id: string
      x: Rescue
      done: boolean
      late: false
      st: 'rescue'
      msgsOff: false
      note: null
      sent: string | null
    }

/**
 * What is actually out there right now.
 *
 * A route is on the board once its wave has passed — before that it is still a
 * Load Out problem. "Late" is deliberately two things: a projection past the
 * plan, or a plan that has simply gone by with the driver not back.
 */
export function onRoadBoard(day: Day): { rows: BoardItem[]; resc: BoardItem[]; all: BoardItem[] } {
  const launched = day.rows.filter(
    (r) => r.emp && r.route && r.wave !== null && r.wave <= ON_NOW,
  )
  const rows: BoardItem[] = launched.map((r) => {
    const it = day.itin[r.id] ?? null
    const st: RouteState = !it ? 'preimport' : it.st
    const plan = it && it.plan !== undefined ? it.plan : null
    const done = st === 'done'
    const late = !done && (
      (!!it && !!it.proj && plan !== null && it.proj > plan) ||
      (plan !== null && ON_NOW > plan)
    )
    return {
      kind: 'route', id: r.id, r, it, st, plan, done, late,
      msgsOff: !!day.orMsgs[r.id],
      note: day.orNotes[r.id] ?? null,
      sent: day.orSent[r.id] ?? null,
    }
  })
  const resc: BoardItem[] = day.resc.map((x) => ({
    kind: 'rescue', id: x.id, x,
    done: false, late: false, st: 'rescue', msgsOff: false, note: null, sent: x.sent,
  }))
  return { rows, resc, all: [...rows, ...resc] }
}

/** The order the board wants: what needs attention first, done last. */
export function urgency(b: BoardItem): number {
  if (b.done) return 4
  if (b.kind === 'rescue') return 2
  if (b.late) return 0
  if (b.st === 'nodata') return 0.5
  if (b.st === 'behind') return 1
  return 3
}

export interface StatusTone {
  label: string
  bg: string
  border: string
  fg: string
  dot: string
}

export function routeTone(b: BoardItem): StatusTone {
  if (b.done)
    return { label: 'Done', bg: 'var(--surface-card)', border: 'var(--border-default)', fg: 'var(--text-secondary)', dot: 'var(--success-accent)' }
  if (b.kind === 'rescue')
    return { label: 'Rescue', bg: 'var(--blue-50)', border: 'var(--blue-200)', fg: 'var(--blue-700)', dot: 'var(--blue-500)' }
  if (b.late)
    return { label: 'Late RTS', bg: 'var(--danger-bg)', border: 'var(--danger-border)', fg: 'var(--danger-fg)', dot: 'var(--danger-accent)' }
  if (b.st === 'behind')
    return { label: 'Behind', bg: 'var(--warning-bg)', border: 'var(--warning-border)', fg: 'var(--warning-fg)', dot: 'var(--warning-accent)' }
  if (b.st === 'nodata' || b.st === 'preimport')
    return { label: 'No Data', bg: 'var(--surface-card)', border: 'var(--border-default)', fg: 'var(--text-secondary)', dot: 'var(--neutral-400)' }
  return { label: 'On Pace', bg: 'var(--success-bg)', border: 'var(--success-border)', fg: 'var(--success-fg)', dot: 'var(--success-accent)' }
}

// ---- Return to Station ------------------------------------------------------

/** One route's closing line: what went out, what came back, what was counted. */
export interface RtsRow {
  route: string
  emp: string
  band: string
  type: string
  stops: string
  out: number
  delivered: number
  /** What the system says came back. */
  recon: number
  /** What physically returned to the station. */
  returned: number
  /** What a person counted at the door — undefined until somebody counts. */
  counted?: number
  /** An issue raised on road that the door should know about. */
  inNote: OnRoadNote | null
  note: { txt: string; who: string; when: string } | null
  back: Minutes | null
}

const TYPE_NAME: Record<string, string> = {
  DLX5: 'DLX5 Delivery Associate · 10',
  LV: 'Large Van · 10',
  CDV: 'CDV · 8',
  DOT: 'DOT Step Van Driver · 10',
  ADHOC: 'Adhoc · 10',
}

/** The closing file's own reconciliation, per route. */
const RECON: Record<string, number> = {
  CX248: 2, CX250: 1, CX255: 8, CX261: 3, CX266: 4, CX259: 9, CX252: 13, CX272: 5,
  CX270: 0, CX264: 1, CX268: 2, CX274: 0, CX276: 4, CX278: 2, CX280: 3, CX282: 3,
  CX284: 1, CX286: 2, CX290: 3, CX292: 1, CX296: 2, CX304: 3, CX306: 1, CX294: 2,
  CX300: 1, CX302: 2, CX308: 1, CX310: 2,
}

/** One route the closing file simply does not mention — the board says so
 *  rather than quietly balancing without it. */
export const MISSING_FROM_FILE = 'CX298'

export function rtsBoard(day: Day): { rows: RtsRow[]; launched: number; missing: string } {
  const launched = day.rows.filter((r) => r.emp && r.route && r.wave !== null)
  const ov = day.rtsOv ?? {}
  const rows = launched
    .filter((r) => r.route !== MISSING_FROM_FILE)
    .map((r, i) => {
      const stopsAll = 96 + ((i * 7) % 52)
      const out = 180 + ((i * 13) % 130)
      const recon = RECON[r.route] ?? 1
      // One van came back three short of what the file claims — the gap is the
      // point of the board.
      const returned = r.route === 'CX272' ? Math.max(0, recon - 3) : recon
      const it = day.itin[r.id]
      const base: RtsRow = {
        route: r.route,
        emp: r.emp,
        band: r.band,
        type: TYPE_NAME[r.band] ?? r.band,
        stops: `${stopsAll}/${stopsAll}`,
        out,
        delivered: out - recon,
        recon,
        returned,
        counted: day.rtsCounts[r.route],
        inNote: day.orNotes[r.id]?.issue ? day.orNotes[r.id] : null,
        note: day.rtsNotes[r.route] ?? null,
        back: it?.back ?? null,
      }
      const o = ov[r.route]
      if (!o) return base
      const merged = { ...base, ...o } as RtsRow
      // A typed correction re-derives the reconciliation rather than leaving
      // three numbers that no longer agree.
      merged.recon = merged.out - merged.delivered
      return merged
    })
  return { rows, launched: launched.length, missing: MISSING_FROM_FILE }
}

// ---- templates --------------------------------------------------------------

/**
 * Fill a template's merge fields from a real row.
 *
 * The preview is resolved against an actual driver rather than placeholder
 * text, because the thing worth checking before a group send is what the
 * message will really say — including the fields that come out empty.
 */
export function resolveTemplate(body: string, r: Row | undefined, day: Day, schedOff: number): string {
  if (!r) return body
  const it = day.itin[r.id]
  const x1 = day.resc[0]
  const phoneOf = (name: string | undefined): string => {
    if (!name) return '-'
    const p =
      day.rows.find((x) => x.emp === name) ??
      day.sb.find((x) => x.emp === name) ??
      day.oc.find((x) => x.emp === name)
    return p && typeof (p as { phone?: unknown }).phone === 'string'
      ? ((p as { phone: string }).phone)
      : '(213) 555-0100'
  }
  const map: Record<string, string> = {
    Employee: r.emp || '-',
    'Day, Date': 'Wed, Jul 29',
    Scheduled: fmt(schedOf(r, schedOff)) || '-',
    Wave: fmt(r.wave) || '-',
    Van: r.van || '-',
    Route: r.route || '-',
    Staging: r.staging || '-',
    Transporter: r.tr || '-',
    'Stops done': it?.stp ? String(it.stp[0]) : '-',
    Stops: it?.stp ? String(it.stp[1]) : '-',
    'Pkgs left': it?.pkg ? String(it.pkg[1] - it.pkg[0]) : '-',
    'Proj RTS': it?.proj ? fmt(it.proj) : '-',
    Rescuer: x1?.rescuer?.name ?? '-',
    Rescuing: x1?.rescuing.name ?? '-',
    Where: x1?.where.a ?? '-',
    'Rescuing Route': x1?.rescuing.route ?? '-',
    'Rescuer Phone': x1?.rescuer ? phoneOf(x1.rescuer.name) : '-',
    'Rescuing Phone': x1 ? phoneOf(x1.rescuing.name) : '-',
    Totes: x1 && x1.totes !== null ? ` · ${x1.totes} totes` : '',
  }
  return body.replace(/\{([A-Za-z, ]+)\}/g, (m, k: string) => (map[k] !== undefined ? map[k] : m))
}

/** SMS billing: one segment to 160 characters, then 153 each once it splits. */
export function smsSegments(text: string): number {
  return text.length <= 160 ? 1 : Math.ceil(text.length / 153)
}
