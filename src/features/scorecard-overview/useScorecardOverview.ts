'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast } from '../../ds/hooks'
import { dataFor } from './data'
import {
  buildCategories, buildDeductions, buildLine, buildStack, buildTiers, buildTrend,
  bonusTotal, declines, improvements, rankedRoster, sourceTotals,
} from './calc'
import {
  BONUS_ROWS, BONUS_SEGS, COMPLETION_VALS, SOURCE_ROWS, SOURCE_SEGS, TIME_VALS,
} from './data'

export type SortKey = 'name' | 'net' | 'tier' | 'blocked'
export interface Sort {
  k: SortKey
  d: 'asc' | 'desc'
}

/**
 * Every filter on the page is one of three kinds — a window, a category, or a
 * "top N" — so each panel keeps its own trio rather than sharing one, letting
 * the Kudos table look at this month while the leaderboard looks at all time.
 */
export interface PanelFilters {
  cat: string
  win: string
  top: string
  q: string
  from: string
  to: string
}

const panel = (win: string, top: string): PanelFilters => ({ cat: 'Overall', win, top, q: '', from: '', to: '' })

export function useScorecardOverview() {
  // Named `period`, not `window` — shadowing the global in a client module is a
  // trap waiting for the first line that needs the real one.
  const [period, setPeriod] = useState('This month')
  const [winFrom, setWinFrom] = useState('')
  const [winTo, setWinTo] = useState('')

  const [scoreBy, setScoreBy] = useState('Fleet Net')
  const [fnWin, setFnWin] = useState('12 weeks')

  const [risk, setRisk] = useState<PanelFilters>(panel('This month', 'All'))
  const [board, setBoard] = useState<PanelFilters>({ ...panel('All time', 'Top 3'), cat: 'Overall' })
  const [kudos, setKudos] = useState<PanelFilters>(panel('This month', 'Top 3'))
  const [decline, setDecline] = useState<PanelFilters>(panel('This month', 'Top 3'))

  const [riskSort, setRiskSort] = useState<Sort>({ k: 'net', d: 'asc' })

  /** At most one menu is open at a time, so the page tracks a single id. */
  const [drop, setDrop] = useState<string | null>(null)
  const toggleDrop = useCallback((id: string) => setDrop((d) => (d === id ? null : id)), [])
  const closeDrop = useCallback(() => setDrop((d) => (d ? null : d)), [])

  const { toast, toastMsg } = useToast(2400)

  /** Every deep link on the page lands as a toast — the destinations are other pages. */
  const go = useCallback((m: string) => () => toastMsg(`Opening ${m}`), [toastMsg])

  const d = useMemo(() => dataFor(period), [period])
  const categories = useMemo(() => buildCategories(d), [d])
  const trend = useMemo(() => buildTrend(scoreBy, fnWin), [scoreBy, fnWin])
  const deductions = useMemo(() => buildDeductions(), [])
  const bonuses = useMemo(() => buildStack(BONUS_ROWS, BONUS_SEGS, '+'), [])
  const sources = useMemo(() => buildStack(SOURCE_ROWS, SOURCE_SEGS, ''), [])
  const completion = useMemo(() => buildLine(COMPLETION_VALS, 100, (v) => `${v}%`), [])
  const timeToClose = useMemo(() => buildLine(TIME_VALS, 5, (v) => `${v.toFixed(1)} days`), [])
  const tiers = useMemo(() => buildTiers(), [])
  const ranked = useMemo(() => rankedRoster(), [])

  const kudosRows = useMemo(() => improvements(kudos.cat, kudos.win), [kudos.cat, kudos.win])
  const declineRows = useMemo(() => declines(decline.cat, decline.win), [decline.cat, decline.win])

  const totals = useMemo(() => ({
    bonuses: bonusTotal(),
    sources: sourceTotals(),
    completionAvg: Math.round(COMPLETION_VALS.reduce((a, b) => a + b, 0) / COMPLETION_VALS.length),
    timeAvg: (TIME_VALS.reduce((a, b) => a + b, 0) / TIME_VALS.length).toFixed(1),
  }), [])

  const sortRisk = useCallback((k: SortKey) => {
    setRiskSort((s) => ({ k, d: s.k === k && s.d === 'asc' ? 'desc' : 'asc' }))
  }, [])

  return {
    period, setPeriod, winFrom, setWinFrom, winTo, setWinTo,
    scoreBy, setScoreBy, fnWin, setFnWin,
    risk, setRisk, board, setBoard, kudos, setKudos, decline, setDecline,
    riskSort, sortRisk,
    drop, toggleDrop, closeDrop,
    toast, toastMsg, go,
    d, categories, trend, deductions, bonuses, sources, completion, timeToClose, tiers, ranked,
    kudosRows, declineRows, totals,
  }
}

export type OverviewState = ReturnType<typeof useScorecardOverview>
