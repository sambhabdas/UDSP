'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast, anchorTo, paginate } from '../../ds/hooks'
import {
  AVAIL_ISSUES, AVAIL_SOURCE, BATCH_PAGE_SIZE, MAX_OFFSET, MAX_RANGE_DAYS, MIN_OFFSET,
  PAGE_SIZE, SCHEDULE_SOURCE, SEED_AUDIT, SEED_BATCHES, SEED_DAS, SEED_EXCLUDED,
  SEED_OVERRIDES, SEED_REMEMBERED, SEED_VALUE_MAP,
} from './data'
import type { AuditRow, Batch, Cell, Da, Exclusion, Issue, Overrides } from './data'
import { columnsFor, effective, weekOfOffset, writeCell as write } from './calc'

export type Tab = 'Week Grid' | 'Import' | 'History'
export type Sort = 'Name' | 'Unavailable days'

export type DialogKind = 'cell' | 'pattern' | 'range' | 'clearWeek' | 'clearDa' | 'rollback' | 'coldRemove'

export interface MenuState {
  kind: 'combo' | 'preset' | 'mvStd' | 'issDa' | 'issStd' | 'fCol' | 'fOp' | 'batchKebab'
  x: number
  y: number
  w: number
  /** Which column-state key + its options, for the mapping combos. */
  comboKey?: string
  comboOpts?: string[]
  source?: string
  issueId?: string
  batch?: Batch
  batchIndex?: number
}

/** The grid's filter drawer, edited as a copy until Apply. */
export interface GridFilters {
  unavailOnly: boolean
  excluded: 'All' | 'Excluded only' | 'Not excluded'
  states: string[]
  sources: string[]
}

export interface HistoryFilters {
  srcs: string[]
  sts: string[]
}

const EMPTY_GRID: GridFilters = { unavailOnly: false, excluded: 'All', states: [], sources: [] }

/** The column mapping, per source kind. */
export interface Mapping {
  daCol: string
  dayCol: string
  valCol: string
  tgtWeek: string
  wkRep: string
  schDaCol: string
  deptCol: string
  hrsFall: string
}

const SEED_MAPPING: Mapping = {
  daCol: 'Transporter ID',
  dayCol: 'Date',
  valCol: 'Value',
  tgtWeek: 'Aug 2 - 8',
  wkRep: 'Jul 19 - 25',
  schDaCol: 'Transporter ID',
  deptCol: 'Department',
  hrsFall: '10',
}

export function useAvailability() {
  const [tab, setTab] = useState<Tab>('Week Grid')

  // The visible span, as day offsets from the anchor Sunday.
  const [selStart, setSelStart] = useState(0)
  const [selEnd, setSelEnd] = useState(6)
  const [calPend, setCalPend] = useState<number | null>(null)
  const [calMonth, setCalMonth] = useState<number | null>(null)
  const [calMenu, setCalMenu] = useState<'month' | 'year' | null>(null)

  const [das, setDas] = useState<Da[]>(SEED_DAS)
  const [excluded] = useState<Exclusion[]>(SEED_EXCLUDED)
  const [overrides, setOverrides] = useState<Overrides>(SEED_OVERRIDES)
  const [audit, setAudit] = useState<AuditRow[]>(SEED_AUDIT)
  const [batches, setBatches] = useState<Batch[]>(SEED_BATCHES)

  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('Name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [copyMode, setCopyMode] = useState('Copy previous week')
  const [openDrop, setOpenDrop] = useState<string | null>(null)

  const [applied, setApplied] = useState<GridFilters>(EMPTY_GRID)
  const [hApplied, setHApplied] = useState<HistoryFilters>({ srcs: [], sts: [] })
  const [fp, setFp] = useState(false)
  const [fpQ, setFpQ] = useState('')
  const [fpOpenSecs, setFpOpenSecs] = useState<string[]>(['rows', 'roster', 'state', 'source'])
  const [draft, setDraft] = useState<GridFilters | null>(null)
  const [hDraft, setHDraft] = useState<HistoryFilters | null>(null)

  // ── Import wizard ─────────────────────────────────────────────────────────
  const [importType, setImportType] = useState(AVAIL_SOURCE)
  const [step, setStep] = useState(1)
  const [mapping, setMapping] = useState<Mapping>(SEED_MAPPING)
  const [vmap, setVmap] = useState<[string, string][]>(SEED_VALUE_MAP)
  const [filters, setFilters] = useState(['Value is empty'])
  const [writeMode, setWriteMode] = useState('This week’s overrides')
  const [customSources, setCustomSources] = useState<string[]>([])
  const [imported, setImported] = useState<Record<string, boolean>>({})
  const [resolved, setResolved] = useState<Record<string, string>>({})
  const [remembered, setRemembered] = useState<[string, string][]>(SEED_REMEMBERED)
  const [pvSort, setPvSort] = useState<{ k: number | null; d: 'asc' | 'desc' }>({ k: null, d: 'asc' })

  const [bq, setBq] = useState('')
  const [bSort, setBSort] = useState<string | null>(null)
  const [bDir, setBDir] = useState<'asc' | 'desc'>('asc')
  const [bPg, setBPg] = useState(1)

  const [gDlg, setGDlg] = useState<'mapping' | 'skipRows' | 'matches' | null>(null)
  const [gCtx, setGCtx] = useState<{ file?: string; src?: string; skipped?: number; unmatched?: number } | null>(null)
  const [fDlg, setFDlg] = useState<'mv' | 'filter' | 'source' | null>(null)
  const [mv, setMv] = useState<{ file: string; std: string | null }>({ file: '', std: null })
  const [ff, setFf] = useState({ col: 'Value', op: 'Equals', val: '' })
  const [cs, setCs] = useState('')

  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuQuery, setMenuQuery] = useState('')

  const [dlg, setDlg] = useState<DialogKind | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})

  const { toast, toastMsg } = useToast(3200)

  /** Every change lands in the audit trail with a name against it. */
  const log = useCallback((action: string, detail: string) => {
    setAudit((a) => [{ when: 'Just now', who: 'You', action, detail }, ...a])
  }, [])

  const openMenu = useCallback((e: React.MouseEvent, kind: MenuState['kind'], extra?: Partial<MenuState>) => {
    e.stopPropagation()
    setMenu({ kind, ...anchorTo(e, 200), ...extra })
    setMenuQuery('')
  }, [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const week = weekOfOffset(selStart)
  const cols = useMemo(() => columnsFor(selStart, selEnd), [selStart, selEnd])

  const exclusionOf = useCallback((id: string) => excluded.find((e) => e.da === id) ?? null, [excluded])

  const eff = useCallback((da: Da, day: number, w: number) => effective(overrides, da, day, w), [overrides])

  /** The roster after search, filters and sort — before paging. */
  const filtered = useMemo(() => {
    let list = das.slice()
    if (sort === 'Name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
      if (sortDir === 'desc') list.reverse()
    } else {
      const unavailable = (d: Da) => cols.filter((c) => effective(overrides, d, c.dow, c.week).t !== 'A').length
      list.sort((a, b) => unavailable(b) - unavailable(a))
    }
    if (q) list = list.filter((d) => `${d.name} ${d.tid}`.toLowerCase().includes(q.toLowerCase()))
    if (applied.unavailOnly) list = list.filter((d) => cols.some((c) => effective(overrides, d, c.dow, c.week).t !== 'A'))
    if (applied.excluded === 'Excluded only') list = list.filter((d) => exclusionOf(d.id))
    if (applied.excluded === 'Not excluded') list = list.filter((d) => !exclusionOf(d.id))
    if (applied.states.length) list = list.filter((d) => cols.some((c) => applied.states.includes(effective(overrides, d, c.dow, c.week).t)))
    if (applied.sources.length) list = list.filter((d) => cols.some((c) => applied.sources.includes(effective(overrides, d, c.dow, c.week).src)))
    return list
  }, [das, sort, sortDir, q, applied, cols, overrides, exclusionOf])

  const roster = paginate(filtered, page, PAGE_SIZE)
  const pages = roster.max
  const currentPage = roster.p
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const rows = roster.slice

  const overridesCount = useMemo(() => {
    const w = overrides[week]
    return w ? Object.keys(w).reduce((a, id) => a + Object.keys(w[id]).length, 0) : 0
  }, [overrides, week])

  const setCell = useCallback((daId: string, day: number, value: Cell | null, w: number) => {
    setOverrides((o) => write(o, daId, day, value, w))
  }, [])

  /** Replace the whole override tree — the bulk "revert to pattern" path. */
  const setOverridesDirect = useCallback((next: Overrides) => setOverrides(next), [])

  /** Step the visible window by its own length, clamped to the calendar. */
  const stepWeek = useCallback((dir: -1 | 1) => {
    setSelStart((s) => {
      const len = selEnd - s + 1
      if (dir < 0) {
        const next = Math.max(MIN_OFFSET, s - len)
        setSelEnd(next + len - 1)
        return next
      }
      const end = Math.min(MAX_OFFSET, selEnd + len)
      setSelEnd(end)
      return end - len + 1
    })
  }, [selEnd])

  const goToday = useCallback(() => { setSelStart(0); setSelEnd(6); setOpenDrop(null) }, [])

  /** The calendar picks a start, then an end; the second click commits. */
  const pickCalendarDay = useCallback((off: number) => {
    if (calPend === null) { setCalPend(off); return }
    let a = calPend
    let b = off
    if (b < a) { const t = a; a = b; b = t }
    if (b - a > MAX_RANGE_DAYS - 1) { toastMsg(`Pick a range of ${MAX_RANGE_DAYS} days or fewer`); return }
    setSelStart(a)
    setSelEnd(b)
    setCalPend(null)
    setOpenDrop(null)
    setCalMonth(null)
    setCalMenu(null)
  }, [calPend, toastMsg])

  const openDlg = useCallback((kind: DialogKind, f: Record<string, unknown> = {}) => {
    setDlg(kind)
    setForm(f)
    setOpenDrop(null)
  }, [])
  const closeDlg = useCallback(() => setDlg(null), [])
  const setF = useCallback((k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v })), [])

  // ── Import figures ────────────────────────────────────────────────────────

  const isSchedSrc = importType === SCHEDULE_SOURCE
  const issues: Issue[] = useMemo(
    // Only the availability report (and anything custom) has rows to argue about.
    () => (isSchedSrc ? [] : AVAIL_ISSUES),
    [isSchedSrc],
  )

  const review = useMemo(() => {
    const real = issues.filter((r) => r.kind !== 'filter')
    const recovered = real
      .filter((r) => resolved[r.id] && resolved[r.id] !== 'Skip these rows')
      .reduce((a, r) => a + r.rows, 0)
    const baseOut = issues.reduce((a, r) => a + r.rows, 0)
    const daPending = issues.filter((r) => r.kind === 'da' && !resolved[r.id]).reduce((a, r) => a + r.rows, 0)
    return {
      inFile: isSchedSrc ? 41 : 42,
      created: isSchedSrc ? 41 : 38 + recovered,
      notImported: isSchedSrc ? 0 : baseOut - recovered,
      daPending,
      pending: real.filter((r) => !resolved[r.id]),
    }
  }, [issues, resolved, isSchedSrc])

  const allSources = useMemo(() => [AVAIL_SOURCE, SCHEDULE_SOURCE, ...customSources], [customSources])

  // ── History ───────────────────────────────────────────────────────────────

  const historyRows = useMemo(() => {
    let list = batches.map((b, i) => ({ b, i }))
    if (hApplied.srcs.length) list = list.filter(({ b }) => hApplied.srcs.includes(b.source))
    if (hApplied.sts.length) list = list.filter(({ b }) => hApplied.sts.includes(b.status))
    const query = bq.trim().toLowerCase()
    if (query) list = list.filter(({ b }) => `${b.source} ${b.file}`.toLowerCase().includes(query))
    if (bSort) {
      const key = bSort as keyof Batch
      list = list.slice().sort((x, y) => ((Number(x.b[key]) || 0) - (Number(y.b[key]) || 0)) * (bDir === 'asc' ? 1 : -1))
    }
    return list
  }, [batches, hApplied, bq, bSort, bDir])

  const history = paginate(historyRows, bPg, BATCH_PAGE_SIZE)
  const bMaxPg = history.max
  const bPage = history.p
  const batchSlice = history.slice

  const sortBatches = useCallback((k: string) => {
    setBSort(k)
    setBDir((d) => (bSort === k && d === 'asc' ? 'desc' : 'asc'))
  }, [bSort])

  const gridDraft = draft ?? applied
  const historyDraft = hDraft ?? hApplied
  const gridFilterCount =
    (applied.unavailOnly ? 1 : 0) + (applied.excluded !== 'All' ? 1 : 0) + applied.states.length + applied.sources.length
  const historyFilterCount = hApplied.srcs.length + hApplied.sts.length

  const openFilters = useCallback(() => {
    setFp(true)
    setFpQ('')
    setOpenDrop(null)
    setMenu(null)
    if (tab === 'History') {
      setHDraft(hApplied)
      setFpOpenSecs(['hsrc', 'hst'])
    } else {
      setDraft(applied)
    }
  }, [tab, applied, hApplied])

  const cancelFilters = useCallback(() => { setFp(false); setDraft(null); setHDraft(null) }, [])

  const applyFilters = useCallback(() => {
    setFp(false)
    if (tab === 'History') { setHApplied(historyDraft); setBPg(1) }
    else { setApplied(gridDraft); setPage(1) }
    setDraft(null)
    setHDraft(null)
  }, [tab, gridDraft, historyDraft])

  return {
    tab, setTab,
    selStart, selEnd, week, cols, calPend, setCalPend, calMonth, setCalMonth, calMenu, setCalMenu,
    stepWeek, goToday, pickCalendarDay,
    das, setDas, excluded, exclusionOf, overrides, setCell, setOverridesDirect, eff, overridesCount,
    audit, log, batches, setBatches,
    q, setQ, sort, setSort, sortDir, setSortDir, page, setPage, pages, currentPage, pageStart,
    filtered, rows, copyMode, setCopyMode, openDrop, setOpenDrop,
    applied, hApplied, gridDraft, historyDraft, setDraft, setHDraft,
    fp, fpQ, setFpQ, fpOpenSecs, setFpOpenSecs, gridFilterCount, historyFilterCount,
    openFilters, cancelFilters, applyFilters,
    importType, setImportType, step, setStep, mapping, setMapping, vmap, setVmap,
    filters, setFilters, writeMode, setWriteMode, customSources, setCustomSources,
    imported, setImported, resolved, setResolved, remembered, setRemembered, pvSort, setPvSort,
    isSchedSrc, issues, review, allSources,
    bq, setBq, bSort, bDir, sortBatches, bPg, setBPg, bPage, bMaxPg, historyRows, batchSlice,
    gDlg, setGDlg, gCtx, setGCtx, fDlg, setFDlg, mv, setMv, ff, setFf, cs, setCs,
    menu, openMenu, closeMenu, menuQuery, setMenuQuery,
    dlg, form, openDlg, closeDlg, setF,
    toast, toastMsg,
  }
}

export type AvailabilityState = ReturnType<typeof useAvailability>
