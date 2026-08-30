// Everything the table and the detail view compute from the fixtures.

import {
  DETAILS, ROSTER, STANDARDS, catDot, fallbackDetail, signed, tierOf,
  type Associate, type Detail, type DetailAck, type Mark,
} from './data'

export const activeRoster = (): Associate[] => ROSTER.filter((d) => !d.inactive)

export const detailFor = (d: Associate): Detail => DETAILS[d.name] ?? fallbackDetail(d)

// ── The 60-day sparkline in the table ───────────────────────────────────────

/**
 * Nine points ending on today's net.
 *
 * The wobble is seeded from the transporter ID, so a given associate's
 * sparkline is always the same line — it is a fixture, not decoration.
 */
export function sparkFor(d: Associate): { points: string; zero: number } {
  const seed = d.tid.charCodeAt(0) + d.tid.charCodeAt(3)
  const pts: number[] = []
  for (let i = 0; i < 9; i++) {
    const w = Math.sin(seed + i * 1.4) * 30 + Math.cos(seed * 0.6 + i) * 16
    pts.push(i === 8 ? d.net : d.net - (8 - i) * (d.net > 0 ? 6 : -5) + w)
  }
  const max = Math.max(...pts.map(Math.abs), 40)
  const zero = 14
  const sc = 12 / max
  return {
    points: pts.map((p, i) => `${(i * 12.5).toFixed(1)},${(zero - p * sc).toFixed(1)}`).join(' '),
    zero,
  }
}

// ── The 13-week score trend on the detail view ──────────────────────────────

export interface TrendMark {
  x: string
  y: string
  fill: string
  radius: string
  rot: string
  size: string
  title: string
}

export function buildTrend(d: Associate, marks: Mark[]) {
  const series: number[] = []
  for (let i = 0; i < 13; i++) {
    const w = Math.sin(i * 1.7 + d.net) * 14
    series.push(Math.round(d.net - (12 - i) * (d.net >= 0 ? 4 : -6) + (i === 12 ? 0 : w)))
  }
  // The axis rounds out to 20s so the gridline maths stays legible.
  const yMax = Math.ceil(Math.max(...series, 10) / 20) * 20
  const yMin = Math.floor(Math.min(...series, -10) / 20) * 20
  const range = yMax - yMin
  const points = series
    .map((v, i) => `${((i + 0.5) / 13 * 100).toFixed(2)},${((yMax - v) / range * 100).toFixed(2)}`)
    .join(' ')
  const trendMarks: TrendMark[] = marks.map((m) => ({
    x: ((m.i + 0.5) / 13 * 100).toFixed(2),
    y: ((yMax - series[m.i]) / range * 100).toFixed(2),
    fill: m.diamond ? 'var(--green-600)' : m.neg ? 'var(--red-500)' : 'var(--green-600)',
    radius: m.diamond ? '1px' : '50%',
    rot: m.diamond ? '45deg' : '0deg',
    size: '8px',
    title: m.diamond ? 'Coaching completed' : m.neg ? 'Negative event' : 'Positive event',
  }))
  const zeroPct = yMax / range * 100
  const cols = series.map((v, i) => ({
    val: signed(v),
    title: `Wk ${20 + i} · ${signed(v)}`,
    // Thirteen labels do not fit, so every third week is named.
    label: i % 3 ? '' : `Wk ${20 + i}`,
  }))
  return {
    series, points, marks: trendMarks, cols,
    yMax, yMin, zeroPct,
    showZero: zeroPct >= 14 && zeroPct <= 86,
    color: d.net < 0 ? 'var(--red-500)' : 'var(--blue-500)',
  }
}

// ── Points mix ──────────────────────────────────────────────────────────────

export interface DonutSeg {
  label: string
  count: string
  valColor: string
  fill: string
  dash: string
  off: string
}

/**
 * A donut drawn with one 100-unit circle per slice.
 *
 * `stroke-dasharray` is the slice, `stroke-dashoffset` walks it round; the
 * 25-unit shift puts the first slice at twelve o'clock.
 */
export function donutSegs(pairs: [string, number][], palette: string[], valColor: string) {
  const total = pairs.reduce((a, p) => a + p[1], 0)
  let acc = 0
  const segs: DonutSeg[] = pairs.map((p, i) => {
    const frac = total ? p[1] / total * 100 : 0
    const seg: DonutSeg = {
      label: p[0],
      count: `${valColor === 'var(--danger-fg)' ? '-' : '+'}${p[1]}`,
      valColor,
      fill: palette[i % palette.length],
      dash: `${frac.toFixed(2)} ${(100 - frac).toFixed(2)}`,
      off: (100 - acc + 25).toFixed(2),
    }
    acc += frac
    return seg
  })
  return { segs, total }
}

const NEG_PALETTE = ['var(--red-700)', 'var(--red-500)', 'var(--yellow-600)', 'var(--yellow-300)', 'var(--neutral-400)']
const POS_PALETTE = ['var(--green-700)', 'var(--green-300)', 'var(--blue-500)', 'var(--blue-300)', 'var(--neutral-400)']

export function buildMix(dd: Detail) {
  const lossAgg: Record<string, number> = {}
  dd.events.forEach((e) => { if (e.pts < 0) lossAgg[e.standard] = (lossAgg[e.standard] ?? 0) - e.pts })
  const lossPairs = Object.keys(lossAgg).map((k) => [k, lossAgg[k]] as [string, number]).sort((a, b) => b[1] - a[1])
  const lossMax = lossPairs.length ? lossPairs[0][1] : 1
  const lossBars = lossPairs.map((p) => ({
    label: p[0],
    value: `-${p[1]}`,
    w: `${Math.max(4, p[1] / lossMax * 100).toFixed(1)}%`,
    title: `${p[0]} · -${p[1]} points`,
  }))

  const posAgg: Record<string, number> = {}
  dd.events.forEach((e) => { if (e.pts > 0) posAgg[e.standard] = (posAgg[e.standard] ?? 0) + e.pts })
  const posPairs = Object.keys(posAgg).map((k) => [k, posAgg[k]] as [string, number]).sort((a, b) => b[1] - a[1])

  const neg = donutSegs(lossPairs, NEG_PALETTE, 'var(--danger-fg)')
  const pos = donutSegs(posPairs, POS_PALETTE, 'var(--success-fg)')

  const mixAgg: Record<string, number> = {}
  dd.events.forEach((e) => { mixAgg[e.cat] = (mixAgg[e.cat] ?? 0) + 1 })
  const mixPairs = Object.keys(mixAgg).map((k) => [k, mixAgg[k]] as [string, number]).sort((a, b) => b[1] - a[1])
  const mixTotal = mixPairs.reduce((a, p) => a + p[1], 0)
  let acc = 0
  const mixSegs = mixPairs.map((p) => {
    const frac = p[1] / mixTotal * 100
    const seg = {
      label: p[0],
      count: String(p[1]),
      fill: catDot(p[0]),
      dash: `${frac.toFixed(2)} ${(100 - frac).toFixed(2)}`,
      off: (100 - acc + 25).toFixed(2),
    }
    acc += frac
    return seg
  })

  return { lossBars, neg, pos, mixSegs, mixTotal }
}

// ── Promotion readiness ─────────────────────────────────────────────────────

export interface Criterion {
  label: string
  ok: boolean
  value: string
  assign?: string
}

export function criteria(d: Associate, dd: Detail): { list: Criterion[]; met: number; missing: number } {
  // Only Priya Shah has the full safety set acknowledged; everyone else is
  // measured against how many of the three they have.
  const safetyOk = d.name === 'Priya Shah'
  const safetyHave = Math.min(dd.acks.length, 3)
  const list: Criterion[] = [
    { label: 'Tenure 12 months or more', ok: d.tenureN >= 12, value: d.tenure },
    { label: 'Net score +100 or more', ok: d.net >= 100, value: signed(d.net) },
    {
      label: 'Safety modules acknowledged',
      ok: safetyOk,
      value: safetyOk ? '3 of 3' : `${safetyHave} of 3`,
      assign: safetyOk ? '' : `Assign Missing ${3 - safetyHave} Modules`,
    },
    {
      label: '90 days without a negative event',
      ok: d.net > 0 && d.openEv === 0,
      value: d.openEv > 0 ? 'Last negative Aug 17' : d.net > 0 ? 'Clean' : 'Last negative Aug 12',
    },
  ]
  return { list, met: list.filter((c) => c.ok).length, missing: 3 - safetyHave }
}

// ── Acknowledgements ────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * "Aug 13" as a sortable integer.
 *
 * Deliberately not `new Date()` — a locale-dependent parse would let the
 * server and the browser disagree about the order of two rows.
 */
export function ackDay(text: string): number {
  const [mon, day] = text.split(' ')
  const m = MONTHS.indexOf(mon)
  return m < 0 ? 0 : (m + 1) * 100 + (parseInt(day, 10) || 0)
}

export const ackScore = (text: string): number => (text === '-' ? -1 : parseInt(text, 10) || 0)

export const ACK_STATEMENT =
  '"I confirm that I watched this training in full, completed the quiz, and understand what is expected of me. I understand that repeating this behavior may lead to further action, up to and including termination."'

export const ackMeta = (a: DetailAck): string =>
  `${a.standard === '-' ? 'Person level - no originating event' : `Originating event ${a.standard} · ${a.completed}`} · iPhone 15 · Station receipt ${a.completed}`

// ── Log Event arithmetic ────────────────────────────────────────────────────

export const standardBy = (name: string | null) => STANDARDS.find((s) => s.name === name)

/** Points for the event being logged: direction × the standard's rate × quantity. */
export function eventPoints(standardName: string | null, dir: 'neg' | 'pos', qty: string): number {
  const std = standardBy(standardName)
  if (!std) return 0
  const mag = dir === 'neg' ? std.neg : std.pos
  return (dir === 'neg' ? -1 : 1) * mag * (parseFloat(qty) || 0)
}

// ── Roster figures ──────────────────────────────────────────────────────────

export function summary() {
  const active = activeRoster()
  return {
    active,
    atRisk: active.filter((d) => tierOf(d.net) === 'At Risk').length,
    blocked: active.filter((d) => d.blocked).length,
    average: Math.round(active.reduce((a, d) => a + d.net, 0) / active.length),
    pending: active.filter((d) => d.coach).length,
  }
}

export const rankOf = (name: string): number =>
  activeRoster().slice().sort((a, b) => b.net - a.net).map((x) => x.name).indexOf(name) + 1
