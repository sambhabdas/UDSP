'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast } from '../../ds/hooks'
import { DAS, DEPTS, SEED_EXCLUDED, SEED_NEEDS, W31_NEEDS } from './data'
import type { Dept, Exclusion, Needs } from './data'
import { exclusionOn, simulateRun } from './solver'
import type { Run, RuleFlags } from './solver'

export type Tab = 'Setup' | 'Result'
export type DialogKind = 'exclude' | 'template' | 'runConfirm' | 'send' | 'discard'
export type Form = Record<string, unknown>

/** Which collapsible sections start open. */
const DEFAULT_SECTIONS: Record<number, boolean> = { 1: true, 5: true, 6: true, 7: true }

export function useAutoSchedule() {
  const [tab, setTab] = useState<Tab>('Setup')
  const [week, setWeek] = useState(32)
  const [depts, setDepts] = useState<Dept[]>(DEPTS)
  const [needs, setNeeds] = useState<Needs>(SEED_NEEDS)
  const [excluded, setExcluded] = useState<Exclusion[]>(SEED_EXCLUDED)

  const [vWindow, setVWindow] = useState('7')
  const [vCap, setVCap] = useState('50')
  const [enf, setEnf] = useState<Record<string, 'Hard' | 'Soft'>>({ hours: 'Hard', deptCap: 'Soft', avail: 'Hard' })
  const [rules, setRules] = useState<RuleFlags>({})
  const [scoreWin, setScoreWin] = useState(30)
  const [rankSource, setRankSource] = useState('Scorecard net score')
  /** Which days the next run will touch at all. */
  const [runDays, setRunDays] = useState([1, 1, 1, 1, 1, 1, 1])

  // The week-31 run in the log is the same solver over the needs it was given,
  // so the page never shows a figure it could not reproduce.
  const [runs, setRuns] = useState<Run[]>(() => [
    simulateRun({
      week: 31, needs: W31_NEEDS, when: 'Jul 24, 2026 · 6:02 PM', by: 'D. Whitfield',
      excluded: SEED_EXCLUDED, cap: 50, rules: {},
    }),
  ])
  const [resultWeek, setResultWeek] = useState(31)
  const [resultRun, setResultRun] = useState(0)

  const [openSections, setOpenSections] = useState<Record<number, boolean>>(DEFAULT_SECTIONS)
  const [drop, setDrop] = useState<string | null>(null)
  const [logDay, setLogDay] = useState('All')
  const [flagsOnly, setFlagsOnly] = useState(false)
  const [logQuery, setLogQuery] = useState('')

  const [dlg, setDlg] = useState<DialogKind | null>(null)
  const [form, setForm] = useState<Form>({})

  const { toast, toastMsg } = useToast(3200)

  const cap = parseInt(vCap, 10) || 50

  const toggleSection = useCallback((n: number) => {
    setOpenSections((o) => ({ ...o, [n]: !o[n] }))
  }, [])

  const toggleRule = useCallback((key: string) => {
    setRules((r) => ({ ...r, [key]: r[key] === false }))
  }, [])

  /** Everyone who could take a shift that day, before any department gate. */
  const eligibleOn = useCallback(
    (day: number): number =>
      DAS.filter((d) => !d.blocked && d.avail[day] && !exclusionOn(excluded, d.id, week, day, rules)).length,
    [excluded, week, rules],
  )

  /** …and the same after the department's own qualification gate. */
  const eligibleFor = useCallback(
    (dp: Dept, day: number): number =>
      DAS.filter(
        (d) => !d.blocked && d.avail[day] && !exclusionOn(excluded, d.id, week, day, rules) &&
          (!dp.qual || d.quals.includes(dp.qual)),
      ).length,
    [excluded, week, rules],
  )

  const neededOn = useCallback(
    (day: number): number => depts.reduce((a, dp) => a + (needs[dp.id]?.[day] ?? 0), 0),
    [depts, needs],
  )

  const totalNeeded = useMemo(
    () => depts.reduce((a, dp) => a + (needs[dp.id] ?? []).reduce((x, y) => x + y, 0), 0),
    [depts, needs],
  )

  const setNeed = useCallback((deptId: string, day: number, value: number) => {
    setNeeds((n) => {
      const next = JSON.parse(JSON.stringify(n)) as Needs
      next[deptId][day] = value
      return next
    })
  }, [])

  /** A new shift template arrives with the same count on every day. */
  const addNeedRow = useCallback((deptId: string, perDay: number) => {
    setNeeds((n) => (n[deptId] ? n : { ...n, [deptId]: [perDay, perDay, perDay, perDay, perDay, perDay, perDay] }))
  }, [])

  const targetHasDraft = runs.some((r) => r.week === week && !r.discarded)

  const executeRun = useCallback(() => {
    // A day switched off is run as if nothing were needed on it.
    const adjusted: Needs = {}
    Object.keys(needs).forEach((k) => { adjusted[k] = needs[k].map((v, i) => (runDays[i] ? v : 0)) })
    const run = simulateRun({ week, needs: adjusted, when: 'Just now', by: 'You', excluded, cap, rules, depts })
    setRuns((rs) => [run, ...rs])
    setResultRun(0)
    setResultWeek(week)
    setTab('Result')
    setDlg(null)
    toastMsg(`Run complete - ${run.assigns.length} of ${run.total} Slots filled; the draft is on Schedule`)
  }, [needs, runDays, week, excluded, cap, rules, depts, toastMsg])

  const runClick = useCallback(() => {
    if (!totalNeeded) {
      toastMsg('Set at least one needed slot first - the matrix is all zero')
      return
    }
    if (targetHasDraft) { setDlg('runConfirm'); setForm({}) }
    else executeRun()
  }, [totalNeeded, targetHasDraft, executeRun, toastMsg])

  /** The run the Result tab is showing. */
  const currentRun = useMemo(() => {
    const byIndex = runs[resultRun]
    if (byIndex && byIndex.week === resultWeek) return byIndex
    return runs.find((r) => r.week === resultWeek) ?? null
  }, [runs, resultRun, resultWeek])

  const currentIndex = currentRun ? runs.indexOf(currentRun) : -1

  const openDlg = useCallback((kind: DialogKind, f: Form = {}) => {
    setDlg(kind)
    setForm(f)
    setDrop(null)
  }, [])
  const closeDlg = useCallback(() => setDlg(null), [])
  const setF = useCallback((k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v })), [])

  return {
    tab, setTab, week, setWeek, depts, setDepts, needs, setNeed, addNeedRow, excluded, setExcluded,
    vWindow, setVWindow, vCap, setVCap, cap, enf, setEnf, rules, toggleRule,
    scoreWin, setScoreWin, rankSource, setRankSource,
    runDays, setRunDays,
    runs, setRuns, resultWeek, setResultWeek, resultRun, setResultRun, currentRun, currentIndex,
    openSections, toggleSection, drop, setDrop,
    logDay, setLogDay, flagsOnly, setFlagsOnly, logQuery, setLogQuery,
    dlg, form, openDlg, closeDlg, setF,
    eligibleOn, eligibleFor, neededOn, totalNeeded, targetHasDraft,
    runClick, executeRun,
    exclusionOn: (daId: string, day: number) => exclusionOn(excluded, daId, week, day, rules),
    toast, toastMsg,
  }
}

export type AutoState = ReturnType<typeof useAutoSchedule>
