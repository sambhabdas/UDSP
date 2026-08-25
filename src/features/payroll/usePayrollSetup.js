import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addDays, DAY_MS, fmtD, fromIso, generatePeriods, periodWeeks } from './calendar.js'
import {
  CURRENT_USER,
  EMPTY_MANUAL,
  TODAY,
  TODAY_LABEL,
  TODAY_LABEL_LONG,
  figuresFor,
  initialYears,
  seedPeriodStates,
} from './data.js'

const CLOSED_MENUS = {
  yearsOpen: false,
  yearMenuOpen: false,
  periodsOpen: false,
  calFilterOpen: false,
}

export function usePayrollSetup() {
  const [years, setYears] = useState(initialYears)
  const [year, setYear] = useState(2026)
  const [tab, setTab] = useState('cal')
  const [drafts, setDrafts] = useState({})
  const [periodStates, setPeriodStates] = useState(() =>
    seedPeriodStates(initialYears()[2026].rows),
  )

  const [menus, setMenus] = useState(CLOSED_MENUS)
  const [form, setForm] = useState({ seedVal: '', payVal: '', error: '', warning: '' })
  const [edit, setEdit] = useState({ row: null, val: '', error: '' })
  const [period, setPeriod] = useState(null)
  const [periodQuery, setPeriodQuery] = useState('')
  const [calFilter, setCalFilter] = useState('All')
  const [sort, setSort] = useState({ key: 'n', dir: 'asc' })
  const [parsing, setParsing] = useState({ active: false, stage: '' })
  const [manualOpen, setManualOpen] = useState(false)
  const [manual, setManual] = useState(EMPTY_MANUAL)
  const [unmappedRowsOpen, setUnmappedRowsOpen] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [typedVal, setTypedVal] = useState('')
  const [reasonVal, setReasonVal] = useState('')
  const [toastText, setToastText] = useState('')

  const toastTimer = useRef(null)
  const parseTimers = useRef([])

  useEffect(
    () => () => {
      clearTimeout(toastTimer.current)
      parseTimers.current.forEach(clearTimeout)
    },
    [],
  )

  const toast = useCallback((text) => {
    setToastText(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastText(''), 3000)
  }, [])

  const closeMenus = useCallback(() => setMenus(CLOSED_MENUS), [])
  const openMenu = useCallback(
    (name) => setMenus((m) => ({ ...CLOSED_MENUS, [name]: !m[name] })),
    [],
  )

  const yearState = years[year]
  const draft = drafts[year] || null
  const isLocked = yearState.status === 'locked'
  // A draft on an unlocked year is a preview: generated but not yet committed.
  const isPreview = !isLocked && !!draft
  const rows = isLocked ? yearState.rows : draft ? draft.rows : null

  const lockedYears = useMemo(
    () => Object.keys(years).filter((y) => years[y].status === 'locked').map(Number),
    [years],
  )

  // ---- Tab A: the calendar ----

  const generate = useCallback(() => {
    const seedD = form.seedVal ? fromIso(form.seedVal) : null
    const payD = form.payVal ? fromIso(form.payVal) : null
    if (!seedD || !payD) return
    if (seedD.getDay() !== 0) {
      return setForm((f) => ({
        ...f,
        error:
          'The first week must start on a Sunday. Weeks follow the Amazon invoice week, Sunday to Saturday.',
      }))
    }
    const p1end = addDays(seedD, 13)
    const off = (payD - p1end) / DAY_MS
    if (off < 0) {
      return setForm((f) => ({
        ...f,
        error: `The pay date must be on or after the end of payroll #1 (${fmtD(p1end, true)}).`,
      }))
    }
    if (off > 14) {
      return setForm((f) => ({
        ...f,
        error:
          'The pay date can be at most 14 days after the period ends. The same gap is used for all 26 payrolls.',
      }))
    }

    // A week can belong to only one pay period — check both directions against
    // every locked year, and warn (never block) on a gap.
    let warning = ''
    for (const ly of lockedYears) {
      const lrows = years[ly].rows
      const lStart = lrows[0].start
      const lEnd = lrows[lrows.length - 1].end
      const nEnd = addDays(seedD, 26 * 14 - 1)
      if (seedD <= lEnd && nEnd >= lStart) {
        const col = lrows.find((r) => seedD <= r.end && nEnd >= r.start)
        return setForm((f) => ({
          ...f,
          error: `${periodWeeks(col.start)} already belong to ${ly} · P${col.n}. A week can belong to only one pay period.`,
        }))
      }
      if (seedD > lEnd) {
        const gapDays = (seedD - lEnd) / DAY_MS - 1
        if (gapDays >= 7) {
          warning = `${Math.floor(gapDays / 7)} weeks between ${ly} · P26 and this start date are not in any calendar. You can still continue.`
        }
      }
      if (nEnd < lStart) {
        const gapDays = (lStart - nEnd) / DAY_MS - 1
        if (gapDays >= 7) {
          warning = `${Math.floor(gapDays / 7)} weeks between P26 of this calendar and ${ly} · P1 are not in any calendar. You can still continue.`
        }
      }
    }

    setDrafts((d) => ({
      ...d,
      [year]: { rows: generatePeriods(seedD, payD), by: CURRENT_USER, on: TODAY_LABEL_LONG, dirty: true },
    }))
    setForm((f) => ({ ...f, error: '', warning }))
  }, [form.seedVal, form.payVal, lockedYears, years, year])

  // A hand-edited pay date must stay after its period ends, within 14 days of
  // it, and after the previous period's pay date.
  const commitEdit = useCallback(
    (row) => {
      const nd = fromIso(edit.val)
      const prev = row.n > 1 ? draft.rows[row.n - 2].pay : null
      if (nd < row.end) {
        return setEdit((e) => ({
          ...e,
          error: `P${row.n}: the pay date must be on or after the end of the period (${fmtD(row.end)}).`,
        }))
      }
      if ((nd - row.end) / DAY_MS > 14) {
        return setEdit((e) => ({
          ...e,
          error: `P${row.n}: the pay date can be at most 14 days after the period ends.`,
        }))
      }
      if (prev && nd <= prev) {
        return setEdit((e) => ({
          ...e,
          error: `P${row.n}: the pay date must fall after the pay date of P${row.n - 1} (${fmtD(prev)}).`,
        }))
      }
      setDrafts((d) => {
        const cur = d[year]
        return {
          ...d,
          [year]: {
            ...cur,
            rows: cur.rows.map((x) => (x.n === row.n ? { ...x, pay: nd, overridden: true } : x)),
            dirty: true,
          },
        }
      })
      setEdit({ row: null, val: '', error: '' })
    },
    [edit.val, draft, year],
  )

  // ---- Tab B: the payroll intake ----

  // Tab B reads the locked year; a year unlocked for editing keeps serving it,
  // because unlocking recalculates nothing.
  const dataYear = useMemo(() => {
    if (lockedYears[0]) return lockedYears[0]
    const fromUnlock = Object.keys(drafts).find((y) => drafts[y] && drafts[y].fromUnlock)
    return fromUnlock ? Number(fromUnlock) : null
  }, [lockedYears, drafts])

  const dataRows = useMemo(() => {
    if (!dataYear) return []
    return years[dataYear] && years[dataYear].rows
      ? years[dataYear].rows
      : drafts[dataYear]
        ? drafts[dataYear].rows
        : []
  }, [dataYear, years, drafts])

  // Default to the most recent closed period that still needs work.
  const defaultPeriod = useCallback(() => {
    const ended = dataRows.filter((r) => r.end < TODAY)
    const unposted = ended.filter((r) => periodStates[r.n] && periodStates[r.n].status !== 'posted')
    if (unposted.length) return unposted[unposted.length - 1].n
    if (ended.length) return ended[ended.length - 1].n
    const cur = dataRows.find((r) => r.start <= TODAY && r.end >= TODAY)
    return cur ? cur.n : null
  }, [dataRows, periodStates])

  const activePeriod = period != null ? period : dataYear ? defaultPeriod() : null
  const periodRow = dataRows.find((r) => r.n === activePeriod) || null
  const periodState = activePeriod != null ? periodStates[activePeriod] || { status: 'empty' } : null
  const periodStatus = periodState ? periodState.status : 'empty'
  const figures = periodState && periodState.fig ? periodState.fig : null

  const simulateUpload = useCallback(() => {
    if (periodStatus === 'posted' || parsing.active || activePeriod == null) return
    const stages = [
      'Reading the sheet…',
      'Grouping rows by position…',
      'Adding up gross pay and employer taxes…',
    ]
    setParsing({ active: true, stage: stages[0] })
    parseTimers.current.forEach(clearTimeout)
    parseTimers.current = stages.map((sg, i) =>
      setTimeout(() => setParsing({ active: true, stage: sg }), i * 600),
    )
    parseTimers.current.push(
      setTimeout(() => {
        setParsing({ active: false, stage: '' })
        setPeriodStates((ps) => ({
          ...ps,
          [activePeriod]: {
            status: 'uploaded',
            source: {
              file: `PaycomReport_P${activePeriod}.xlsx`,
              by: CURRENT_USER,
              on: TODAY_LABEL,
            },
            fig: figuresFor(activePeriod),
            unmapped: activePeriod % 3 === 1,
          },
        }))
        toast('Figures extracted. Review them, then post.')
      }, 1900),
    )
  }, [periodStatus, parsing.active, activePeriod, toast])

  const saveManual = useCallback(() => {
    const n = (k) => parseFloat(manual[k]) || 0
    setPeriodStates((ps) => ({
      ...ps,
      [activePeriod]: {
        status: 'uploaded',
        source: { manual: true, by: CURRENT_USER, on: TODAY_LABEL },
        fig: { dg: n('dg'), dt: n('dt'), pg: n('pg'), pt: n('pt'), tg: n('tg'), tt: n('tt') },
      },
    }))
    setManualOpen(false)
    toast('Figures saved. Post them when you are ready.')
  }, [manual, activePeriod, toast])

  const openPeriodFromCalendar = useCallback((n) => {
    setTab('data')
    setPeriod(n)
    setManualOpen(false)
    setUnmappedRowsOpen(false)
  }, [])

  const closeDialog = useCallback(() => setDialog(null), [])

  return {
    // year + calendar
    years,
    setYears,
    year,
    setYear,
    yearState,
    isLocked,
    isPreview,
    rows,
    draft,
    drafts,
    setDrafts,
    lockedYears,
    tab,
    setTab,
    form,
    setForm,
    generate,
    edit,
    setEdit,
    commitEdit,
    calFilter,
    setCalFilter,
    sort,
    setSort,
    // menus
    menus,
    openMenu,
    closeMenus,
    // payroll intake
    dataYear,
    dataRows,
    periodStates,
    setPeriodStates,
    activePeriod,
    setPeriod,
    periodRow,
    periodState,
    periodStatus,
    figures,
    periodQuery,
    setPeriodQuery,
    parsing,
    simulateUpload,
    manualOpen,
    setManualOpen,
    manual,
    setManual,
    saveManual,
    unmappedRowsOpen,
    setUnmappedRowsOpen,
    openPeriodFromCalendar,
    // dialog + toast
    dialog,
    setDialog,
    closeDialog,
    typedVal,
    setTypedVal,
    reasonVal,
    setReasonVal,
    toast,
    toastText,
  }
}
