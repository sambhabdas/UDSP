// The solver.
//
// A deterministic greedy fill: walk the days in order, the departments in fill
// priority, and the roster in rank order, taking the first DA who clears every
// gate. Nothing is random, so the same inputs always produce the same run -
// which is what makes the assignment log worth reading.

import { DAS, DEPTS } from './data'
import type { Da, Dept, Exclusion, Needs } from './data'

/** Which rules are switched on for a run. A missing key means on. */
export type RuleFlags = Record<string, boolean>

export interface Assignment {
  day: number
  dept: string
  da: string
  /** Where the DA stood in the ranking when the solver reached them. */
  rank: number
  score: number
  hoursAfter: number
  flag: string
}

export interface Unfilled {
  day: number
  dept: string
  open: number
  why: string
}

export interface Run {
  week: number
  when: string
  by: string
  needs: Needs
  assigns: Assignment[]
  /** Why each DA did not get a shift, per day. */
  skipsByDay: Record<number, Record<string, string>>
  unfilled: Unfilled[]
  total: number
  capSnap: number
  discarded: boolean
}

export interface RunInput {
  week: number
  needs: Needs
  when: string
  by: string
  excluded: Exclusion[]
  cap: number
  rules: RuleFlags
  depts?: Dept[]
  das?: Da[]
}

/**
 * Is this DA excluded on this day?
 *
 * An exclusion with `untilDay32` lapses part-way through week 32, so the same
 * person is out on Sunday and back in on Thursday.
 */
export function exclusionOn(
  excluded: Exclusion[],
  daId: string,
  week: number,
  day: number,
  rules: RuleFlags = {},
): Exclusion | null {
  if (rules.excluded === false) return null
  const e = excluded.find((x) => x.da === daId)
  if (!e) return null
  if (week === 32 && e.untilDay32 != null) return day <= e.untilDay32 ? e : null
  return e
}

export function simulateRun(input: RunInput): Run {
  const { week, needs, when, by, excluded, cap, rules } = input
  const depts = input.depts ?? DEPTS
  const das = (input.das ?? DAS).slice().sort((a, b) => b.score - a.score)

  const assigns: Assignment[] = []
  const skipsByDay: Record<number, Record<string, string>> = {}
  const hours: Record<string, number> = {}
  const perDeptCount: Record<string, number> = {}

  for (let day = 0; day < 7; day++) {
    // One shift per DA per day is absolute, so a DA taken by an earlier
    // department is out of the running for the rest of that day.
    const taken: Record<string, boolean> = {}
    skipsByDay[day] = {}

    depts.forEach((dp) => {
      let need = needs[dp.id]?.[day] ?? 0
      for (const d of das) {
        if (need <= 0) break
        if (taken[d.id]) continue

        const ex = exclusionOn(excluded, d.id, week, day, rules)
        let skip: string | null = null
        if (ex) skip = `excluded - ${ex.reason}`
        else if (d.blocked) skip = 'blocked - overdue coaching'
        else if (!d.avail[day] && rules.avail !== false) skip = 'unavailable'

        if (skip) {
          skipsByDay[day][d.id] ??= skip
          continue
        }

        if (dp.qual && !d.quals.includes(dp.qual)) {
          skipsByDay[day][d.id] ??= `not qualified - ${dp.id}`
          continue
        }

        const already = perDeptCount[d.id + dp.id] ?? 0
        if (dp.cap && already >= dp.cap && rules.deptCap !== false) {
          skipsByDay[day][d.id] ??= `dept cap reached - ${dp.id}`
          continue
        }

        if ((hours[d.id] ?? 0) + dp.len > cap && rules.cap !== false && rules.hours !== false) {
          skipsByDay[day][d.id] = 'at cap'
          continue
        }

        assigns.push({
          day,
          dept: dp.id,
          da: d.id,
          rank: das.indexOf(d) + 1,
          score: d.score,
          hoursAfter: (hours[d.id] ?? 0) + dp.len,
          flag: dp.cap && already + 1 > dp.cap ? `Over ${dp.name} weekly cap - Soft allowed` : '',
        })
        hours[d.id] = (hours[d.id] ?? 0) + dp.len
        perDeptCount[d.id + dp.id] = already + 1
        taken[d.id] = true
        need -= 1
      }
    })

    // Everyone left over was simply outranked, which is worth saying plainly.
    das.forEach((d) => {
      if (!taken[d.id] && !skipsByDay[day][d.id]) skipsByDay[day][d.id] = 'ranked below the cut'
    })
  }

  const unfilled: Unfilled[] = []
  depts.forEach((dp) =>
    (needs[dp.id] ?? []).forEach((need, day) => {
      const got = assigns.filter((a) => a.day === day && a.dept === dp.id).length
      if (need <= got) return
      // Roll the day's individual skips up into a count per reason.
      const reasons: Record<string, number> = {}
      Object.keys(skipsByDay[day]).forEach((id) => {
        const head = skipsByDay[day][id].split(' - ')[0]
        reasons[head] = (reasons[head] ?? 0) + 1
      })
      unfilled.push({
        day,
        dept: dp.id,
        open: need - got,
        why: Object.keys(reasons).map((r) => `${r} ${reasons[r]}`).join(' · ') || '0 eligible remained',
      })
    }))

  const total = depts.reduce((a, dp) => a + (needs[dp.id] ?? []).reduce((x, y) => x + y, 0), 0)

  return { week, when, by, needs: JSON.parse(JSON.stringify(needs)), assigns, skipsByDay, unfilled, total, capSnap: cap, discarded: false }
}
