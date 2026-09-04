// The rule engine.
//
// Two severities, and the difference is the whole point. A HARD rule is a
// refusal: the shift cannot exist, and the export asks you to confirm before it
// writes one. A SOFT rule is a warning: it goes through, but only with a typed
// reason attached to your name.

import { DEPTS, EXCLUDED, HOURS_CAP } from './data'
import type { Da, Dept, Exclusion, Override, Shift } from './data'

export type RuleStatus = 'ok' | 'soft' | 'hard'

export interface RuleLine {
  status: RuleStatus
  label: string
}

export interface CheckResult {
  lines: RuleLine[]
  hard: string[]
  soft: string[]
  ok: boolean
}

export interface Availability {
  t: 'A' | 'U' | 'PTO'
  h?: number
  reason?: string
}

/** The world one check runs against. */
export interface Ctx {
  das: Da[]
  depts: Dept[]
  excluded: Exclusion[]
  shifts: Shift[]
  overrides: Record<string, Record<number, Override>>
}

export const daOf = (ctx: Ctx, id: string): Da => ctx.das.find((d) => d.id === id) as Da
export const deptOf = (ctx: Ctx, id: string): Dept => ctx.depts.find((d) => d.id === id) as Dept
export const exclusionOf = (ctx: Ctx, id: string): Exclusion | null => ctx.excluded.find((e) => e.da === id) ?? null

export const lenOf = (ctx: Ctx, s: Shift): number => s.len ?? deptOf(ctx, s.dept).len
export const startOf = (ctx: Ctx, s: Shift): number => s.start ?? deptOf(ctx, s.dept).start

export const shiftAt = (ctx: Ctx, da: string, day: number): Shift | null =>
  ctx.shifts.find((s) => s.da === da && s.day === day) ?? null

export const weekHours = (ctx: Ctx, da: string): number =>
  ctx.shifts.filter((s) => s.da === da).reduce((a, s) => a + lenOf(ctx, s), 0)

/** Approved time off wins over the DA's own availability pattern. */
export function availOf(ctx: Ctx, da: string, day: number): Availability {
  const ov = ctx.overrides[da]
  if (ov?.[day]) return ov[day]
  return daOf(ctx, da).avail[day] ? { t: 'A' } : { t: 'U' }
}

/**
 * Can this DA take this department on this day?
 *
 * `ignore` is the shift being moved or edited - it has to be taken out of the
 * arithmetic or a shift would always collide with itself.
 */
export function check(ctx: Ctx, daId: string, day: number, deptId: string, ignore?: Shift | null): CheckResult {
  const da = daOf(ctx, daId)
  const dp = deptOf(ctx, deptId)
  const lines: RuleLine[] = []
  const hard: string[] = []
  const soft: string[] = []
  const add = (status: RuleStatus, label: string) => {
    lines.push({ status, label })
    if (status === 'hard') hard.push(label)
    if (status === 'soft') soft.push(label)
  }

  const existing = shiftAt(ctx, daId, day)
  if (existing && existing !== ignore) add('hard', 'Already has a shift that day - one shift per DA per day')
  else add('ok', 'One shift per DA per day')

  if (da.blocked) add('hard', 'Blocked - overdue blocking coaching')

  const av = availOf(ctx, daId, day)
  if (av.t === 'PTO') add('hard', 'Approved time off that day - always hard')
  else if (av.t === 'U') add('hard', 'Unavailable that day')
  else add('ok', 'Available that day')

  if (dp.qual && !da.quals.includes(dp.qual)) add('hard', `Not qualified - ${dp.name} requires ${dp.qual}`)
  else if (dp.qual) add('ok', `Qualified - holds ${dp.qual}`)

  if (dp.cap) {
    const n = ctx.shifts.filter((s) => s.da === daId && s.dept === deptId && s !== ignore).length
    if (n >= dp.cap) add('soft', `Over the ${dp.name} weekly cap of ${dp.cap}`)
    else add('ok', `${dp.name} weekly cap of ${dp.cap}`)
  }

  const h = weekHours(ctx, daId) - (ignore ? lenOf(ctx, ignore) : 0) + dp.len
  if (h > HOURS_CAP) add('hard', `Over the ${HOURS_CAP} h cap - would be ${h} h`)
  else add('ok', `Under the ${HOURS_CAP} h cap - ${h} h after`)

  // An exclusion is the owner's instruction to the auto-scheduler, not a ban:
  // a human can still assign the shift, with a reason on the record.
  const ex = exclusionOf(ctx, daId)
  if (ex) add('soft', `Excluded by the owner - ${ex.reason}${ex.until ? ` · until ${ex.until}` : ''}`)

  return { lines, hard, soft, ok: hard.length === 0 }
}

export interface Violation {
  key: string
  da: string
  day: number | null
  dept: string | null
  rule: string
  detail: string
  shift: Shift | null
}

export interface Violations {
  hard: Violation[]
  soft: Violation[]
  overridden: Violation[]
}

export interface Override_ {
  key: string
  reason: string
}

/** Everything wrong with the week as it currently stands. */
export function violations(ctx: Ctx, overriddenKeys: Override_[], fmtT: (m: number) => string): Violations {
  const hard: Violation[] = []
  const softRows: Violation[] = []

  ctx.shifts.forEach((s) => {
    const av = availOf(ctx, s.da, s.day)
    if (av.t === 'PTO') {
      hard.push({
        key: s.da + s.day, da: s.da, day: s.day, dept: s.dept,
        rule: 'Approved time off',
        detail: `${av.h} h approved · shift ${fmtT(startOf(ctx, s))} (${lenOf(ctx, s)}h)`,
        shift: s,
      })
    }
    const dp = deptOf(ctx, s.dept)
    if (dp.qual && !daOf(ctx, s.da).quals.includes(dp.qual)) {
      hard.push({
        key: `q${s.da}${s.day}`, da: s.da, day: s.day, dept: s.dept,
        rule: 'Not qualified', detail: `${dp.name} requires ${dp.qual}`, shift: s,
      })
    }
  })

  ctx.das.forEach((d) => {
    const h = weekHours(ctx, d.id)
    if (h > HOURS_CAP) {
      hard.push({
        key: `h${d.id}`, da: d.id, day: null, dept: null,
        rule: 'Hours cap', detail: `${HOURS_CAP} h cap · has ${h} h`, shift: null,
      })
    }
  })

  ctx.excluded.forEach((e) => {
    const n = ctx.shifts.filter((s) => s.da === e.da).length
    if (n > 0) {
      softRows.push({
        key: `x${e.da}`, da: e.da, day: null, dept: null,
        rule: 'Excluded by the owner',
        detail: `${e.reason}${e.until ? ` · until ${e.until}` : ''} · ${n}${n === 1 ? ' shift' : ' shifts'}`,
        shift: null,
      })
    }
  })

  const isOverridden = (r: Violation): boolean => overriddenKeys.some((o) => o.key === r.key)
  return { hard, soft: softRows.filter((r) => !isOverridden(r)), overridden: softRows.filter(isOverridden) }
}

/** Rank by net score, highest first - the order every picker offers. */
export function rankMap(das: Da[]): Record<string, number> {
  const out: Record<string, number> = {}
  das.slice().sort((a, b) => b.score - a.score).forEach((d, i) => { out[d.id] = i + 1 })
  return out
}

export { DEPTS, EXCLUDED }
