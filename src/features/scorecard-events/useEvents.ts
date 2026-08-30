'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast, anchorAt, anchorTo, paginate } from '../../ds/hooks'
import {
  DONE_LIST, EXTEND_ISO, LEDGER, OPEN_LIST, PAGE_SIZE, STANDARDS, TODAY_ISO,
  coachRank, statusRank,
  type DoneRow, type LedgerRow, type OpenRow,
} from './data'

export type Tab = 'all' | 'open' | 'done'

export interface Sort {
  k: string
  d: 'asc' | 'desc'
}

export interface MenuState {
  kind: string
  x: number
  y: number
  w: number
  /** The row a kebab was opened on, or nothing for the combo menus. */
  row?: LedgerRow | OpenRow | DoneRow
  tab?: Tab
}

export type DialogKind = 'event' | 'reassign' | 'extend' | 'reason' | 'ack'

export interface DialogContext {
  kind?: 'assign' | 'reassign' | 'void' | 'restore' | 'cancel' | 'manual' | 'ack'
  label: string
  row?: DoneRow
}

/** The filter drawer's working copy. */
export interface Filters {
  da: string
  std: string
  mod: string
  cats: Record<string, boolean>
  srcs: Record<string, boolean>
  sts: Record<string, boolean>
  voided: boolean
  blocked: boolean
  repeats: boolean
}

const EMPTY: Filters = { da: 'All', std: 'All', mod: 'All', cats: {}, srcs: {}, sts: {}, voided: false, blocked: false, repeats: false }

const NEW_EVENT = { da: null as string | null, standard: null as string | null, dir: 'neg' as 'neg' | 'pos', qty: '1', date: TODAY_ISO, desc: '', vehicle: null as string | null }

export type { Page } from '../../ds/hooks'

export function useEvents() {
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [datePreset] = useState('Last 30 Days')

  const [applied, setApplied] = useState<Filters>(EMPTY)
  const [pf, setPf] = useState<Filters | null>(null)
  const [fpOpen, setFpOpen] = useState(false)
  const [fpSec, setFpSec] = useState<Record<string, boolean>>({ g0: true, g1: false, g2: false })

  const [sortAll, setSortAll] = useState<Sort>({ k: 'date', d: 'desc' })
  const [sortOpen, setSortOpen] = useState<Sort>({ k: 'due', d: 'asc' })
  const [sortDone, setSortDone] = useState<Sort>({ k: 'completed', d: 'desc' })

  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [convo, setConvo] = useState<Record<string, boolean>>({})

  const [pgAll, setPgAll] = useState(1)
  const [pgOpen, setPgOpen] = useState(1)
  const [pgDone, setPgDone] = useState(1)

  const [dlg, setDlg] = useState<DialogKind | null>(null)
  const [dlgCtx, setDlgCtx] = useState<DialogContext | null>(null)
  const [ev, setEv] = useState(NEW_EVENT)
  const [re, setRe] = useState<{ module: string | null; due: string }>({ module: null, due: '7' })
  const [ex, setEx] = useState({ date: EXTEND_ISO, reason: '' })
  const [reasonText, setReasonText] = useState('')

  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuQuery, setMenuQuery] = useState('')

  const { toast, toastMsg } = useToast(2400)
  const go = useCallback((m: string) => () => toastMsg(`Opening ${m}`), [toastMsg])

  const openMenu = useCallback((e: React.MouseEvent, kind: string, extra?: { row?: LedgerRow | OpenRow | DoneRow; tab?: Tab }) => {
    e.stopPropagation()
    // A kebab is an icon, so its own width tells the menu nothing.
    const at = kind === 'kebab' ? anchorAt(e, 230) : anchorTo(e, 240)
    setMenu({ kind, ...at, ...extra })
    setMenuQuery('')
  }, [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const q = search.trim().toLowerCase()
  // The window is fixed at 30 days; the design file's preset control was cut
  // from the markup, so the value it would have set never changes.
  const minDay = datePreset === 'Last 7 Days' ? 12 : datePreset === 'Last 30 Days' ? -20 : -90

  // ── All ───────────────────────────────────────────────────────────────────

  const ledger = useMemo(() => {
    let L = LEDGER.filter((r) => r.day >= minDay)
    if (applied.std !== 'All') L = L.filter((r) => r.standard === applied.std)
    if (applied.da !== 'All') L = L.filter((r) => r.da === applied.da)
    const catKeys = Object.keys(applied.cats)
    const srcKeys = Object.keys(applied.srcs)
    const stKeys = Object.keys(applied.sts)
    if (catKeys.length) L = L.filter((r) => applied.cats[r.cat])
    if (applied.mod !== 'All') L = L.filter((r) => r.module === applied.mod)
    if (srcKeys.length) L = L.filter((r) => srcKeys.some((k) => r.source.includes(k)))
    if (stKeys.length) L = L.filter((r) => (r.coach ? applied.sts[r.coach] : applied.sts.None))
    if (q) L = L.filter((r) => `${r.da} ${r.standard}`.toLowerCase().includes(q))
    return L
  }, [applied, q, minDay])

  const nonVoided = useMemo(() => ledger.filter((r) => !r.voided), [ledger])

  const allSorted = useMemo(() => {
    // "Voided Only" swaps the list rather than adding to it — a voided event
    // is not part of any total, so it never mixes with live rows.
    const shown = applied.voided ? ledger.filter((r) => r.voided) : nonVoided
    const dir = sortAll.d === 'asc' ? 1 : -1
    const v = (x: LedgerRow): string | number => {
      switch (sortAll.k) {
        case 'da': return x.da
        case 'pts': return x.pts
        case 'standard': return x.standard
        case 'source': return x.source
        // A row with no module sorts to the end either way.
        case 'module': return x.module ?? 'zzz'
        case 'coach': return coachRank(x.coach)
        default: return x.day
      }
    }
    return shown.slice().sort((a, b) => {
      const xa = v(a)
      const xb = v(b)
      return (xa > xb ? 1 : xa < xb ? -1 : 0) * dir
    })
  }, [ledger, nonVoided, applied.voided, sortAll])

  // ── Open ──────────────────────────────────────────────────────────────────

  const openSorted = useMemo(() => {
    let O = OPEN_LIST.slice()
    if (applied.blocked) O = O.filter((r) => r.blocked)
    const stKeys = Object.keys(applied.sts)
    if (stKeys.length) O = O.filter((r) => stKeys.some((k) => r.status.includes(k)))
    if (applied.da !== 'All') O = O.filter((r) => r.da === applied.da)
    if (applied.std !== 'All') O = O.filter((r) => r.standard === applied.std)
    if (applied.mod !== 'All') O = O.filter((r) => r.module === applied.mod)
    if (q) O = O.filter((r) => `${r.da} ${r.standard ?? ''} ${r.module}`.toLowerCase().includes(q))
    const dir = sortOpen.d === 'asc' ? 1 : -1
    const v = (x: OpenRow): string | number => {
      switch (sortOpen.k) {
        case 'da': return x.da
        case 'standard': return x.standard ?? 'zzz'
        case 'module': return x.module
        case 'assigned': return x.assigned
        case 'reminded': return x.remN
        case 'status': return statusRank(x.status)
        default: return x.dueN
      }
    }
    return O.sort((a, b) => {
      const xa = v(a)
      const xb = v(b)
      return (xa > xb ? 1 : xa < xb ? -1 : 0) * dir
    })
  }, [applied, q, sortOpen])

  // ── Completed ─────────────────────────────────────────────────────────────

  const doneSorted = useMemo(() => {
    let D = DONE_LIST.slice()
    if (applied.repeats) D = D.filter((r) => r.repeat)
    if (applied.da !== 'All') D = D.filter((r) => r.da === applied.da)
    if (applied.std !== 'All') D = D.filter((r) => r.standard === applied.std)
    if (applied.mod !== 'All') D = D.filter((r) => r.module === applied.mod)
    if (q) D = D.filter((r) => `${r.da} ${r.standard ?? ''} ${r.module}`.toLowerCase().includes(q))
    const dir = sortDone.d === 'asc' ? 1 : -1
    const v = (x: DoneRow): string | number => {
      switch (sortDone.k) {
        case 'da': return x.da
        case 'time': return x.timeN
        case 'score': return x.scoreN
        case 'standard': return x.standard ?? 'zzz'
        case 'module': return x.module
        case 'ack': return x.ack
        default: return x.day
      }
    }
    return D.sort((a, b) => {
      const xa = v(a)
      const xb = v(b)
      return (xa > xb ? 1 : xa < xb ? -1 : 0) * dir
    })
  }, [applied, q, sortDone])

  const pageAll = useMemo(() => paginate(allSorted, pgAll, PAGE_SIZE), [allSorted, pgAll])
  const pageOpen = useMemo(() => paginate(openSorted, pgOpen, PAGE_SIZE), [openSorted, pgOpen])
  const pageDone = useMemo(() => paginate(doneSorted, pgDone, PAGE_SIZE), [doneSorted, pgDone])

  const page = tab === 'all' ? pageAll : tab === 'open' ? pageOpen : pageDone
  const setPage = tab === 'all' ? setPgAll : tab === 'open' ? setPgOpen : setPgDone

  const selCount = Object.keys(sel).length
  const allSelected = openSorted.length > 0 && openSorted.every((r) => sel[r.da + r.module])

  const pickTab = useCallback((t: Tab) => {
    setTab(t)
    setSel({})
    setMenu(null)
    setPgAll(1)
    setPgOpen(1)
    setPgDone(1)
  }, [])

  const sortBy = useCallback((k: string) => {
    const [s, set] = tab === 'all' ? [sortAll, setSortAll] : tab === 'open' ? [sortOpen, setSortOpen] : [sortDone, setSortDone]
    set({ k, d: s.k === k && s.d === 'asc' ? 'desc' : 'asc' })
  }, [tab, sortAll, sortOpen, sortDone])

  const sort = tab === 'all' ? sortAll : tab === 'open' ? sortOpen : sortDone

  const pending = useMemo(() => pf ?? applied, [pf, applied])

  const filterCount =
    (applied.da !== 'All' ? 1 : 0) + (applied.std !== 'All' ? 1 : 0) + (applied.mod !== 'All' ? 1 : 0) +
    Object.keys(applied.cats).length + Object.keys(applied.srcs).length + Object.keys(applied.sts).length +
    (applied.voided ? 1 : 0) + (applied.blocked ? 1 : 0) + (applied.repeats ? 1 : 0)

  const openFilters = useCallback(() => {
    setFpOpen(true)
    setMenu(null)
    setPf(applied)
  }, [applied])

  const applyFilters = useCallback(() => {
    setFpOpen(false)
    setMenu(null)
    setApplied(pending)
    setPgAll(1)
    setPgOpen(1)
    setPgDone(1)
    toastMsg('Filters applied')
  }, [pending, toastMsg])

  const openDlg = useCallback((kind: DialogKind, ctx?: DialogContext) => {
    setDlg(kind)
    setDlgCtx(ctx ?? null)
    setMenu(null)
  }, [])
  const closeDlg = useCallback(() => { setDlg(null); setDlgCtx(null); setMenu(null) }, [])

  const resetEvent = useCallback(() => setEv(NEW_EVENT), [])

  const toggleSel = useCallback((key: string) => {
    setSel((s) => {
      const next = { ...s }
      if (next[key]) delete next[key]
      else next[key] = true
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSel(allSelected ? {} : Object.fromEntries(openSorted.map((r) => [r.da + r.module, true])))
  }, [allSelected, openSorted])

  const toggleConvo = useCallback((key: string, da: string) => {
    setConvo((c) => {
      const next = { ...c }
      const on = !next[key]
      if (on) next[key] = true
      else delete next[key]
      toastMsg(on ? `Post event conversation recorded · ${da}` : `Post event conversation unmarked · ${da}`)
      return next
    })
  }, [toastMsg])

  const stdObj = useMemo(() => STANDARDS.find((x) => x.name === ev.standard), [ev.standard])
  const evPoints = useMemo(() => {
    if (!stdObj) return 0
    const mag = ev.dir === 'neg' ? stdObj.neg : stdObj.pos
    return (ev.dir === 'neg' ? -1 : 1) * mag * (parseFloat(ev.qty) || 0)
  }, [stdObj, ev.dir, ev.qty])

  const totals = useMemo(() => ({
    deductions: nonVoided.reduce((a, r) => a + (r.pts < 0 ? r.pts : 0), 0),
    bonuses: nonVoided.reduce((a, r) => a + (r.pts > 0 ? r.pts : 0), 0),
    events: nonVoided.length,
  }), [nonVoided])

  return {
    tab, pickTab, setTab, search, setSearch, datePreset,
    applied, setApplied, pending, setPf, fpOpen, setFpOpen, fpSec, setFpSec, filterCount, openFilters, applyFilters,
    sort, sortBy,
    sel, selCount, allSelected, toggleSel, selectAll, setSel, convo, toggleConvo,
    pageAll, pageOpen, pageDone, page, setPage,
    dlg, dlgCtx, openDlg, closeDlg,
    ev, setEv, resetEvent, re, setRe, ex, setEx, reasonText, setReasonText, stdObj, evPoints,
    menu, openMenu, closeMenu, menuQuery, setMenuQuery,
    totals, openCount: OPEN_LIST.length,
    toast, toastMsg, go,
  }
}

export type EventsState = ReturnType<typeof useEvents>
