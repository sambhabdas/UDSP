'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast, anchorAt, anchorTo } from '../../ds/hooks'
import { ROSTER, TODAY_ISO, coachRank, tierOf, type Associate } from './data'
import { detailFor, summary } from './calc'

export type View = 'roster' | 'detail'
export type SortKey = 'name' | 'net' | 'net2' | 'openEv' | 'coach' | 'el' | 'tenure'
export type AckSortKey = 'module' | 'completed' | 'score'

export interface Sort<K> {
  k: K
  d: 'asc' | 'desc'
}

/** A menu anchored to whatever was clicked, in viewport coordinates. */
export interface MenuState {
  kind: 'kebab' | 'headerMenu' | 'export' | 'coachRow' | 'kudoRow' | 'standard' | 'vehicle' | 'module'
  x: number
  y: number
  w: number
  extra: string | null
}

export type DialogKind = 'event' | 'assign' | 'kudo' | 'promote' | 'reason'

export interface DialogContext {
  kind: 'cancel' | 'kudoDelete'
  label: string
}

export interface EventForm {
  standard: string | null
  dir: 'neg' | 'pos'
  qty: string
  date: string
  desc: string
  vehicle: string | null
}

export interface AssignForm {
  module: string | null
  due: string
  blocks: boolean
}

/** The filter drawer edits a copy, so Cancel really does cancel. */
export interface PendingFilters {
  tiers: Record<string, boolean>
  status: string
  risk: boolean
}

const NEW_EVENT: EventForm = { standard: null, dir: 'neg', qty: '1', date: TODAY_ISO, desc: '', vehicle: null }
const NEW_ASSIGN: AssignForm = { module: null, due: '7', blocks: true }

export function useRoster() {
  const [view, setView] = useState<View>('roster')
  const [da, setDa] = useState<string | null>(null)
  /** The row to keep highlighted after coming back from a detail view. */
  const [lastDa, setLastDa] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [tiers, setTiers] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState('Active')
  const [riskOnly, setRiskOnly] = useState(false)

  const [fpOpen, setFpOpen] = useState(false)
  const [fpSec, setFpSec] = useState<Record<string, boolean>>({ g0: true, g1: true })
  const [pf, setPf] = useState<PendingFilters | null>(null)

  const [sort, setSort] = useState<Sort<SortKey>>({ k: 'net', d: 'asc' })
  const [sel, setSel] = useState<Record<string, boolean>>({})

  const [expandAck, setExpandAck] = useState<number | null>(null)
  const [ackQ, setAckQ] = useState('')
  const [ackSort, setAckSort] = useState<Sort<AckSortKey>>({ k: 'completed', d: 'desc' })

  const [winPreset, setWinPreset] = useState('Last 90 Days')
  const [winOpen, setWinOpen] = useState(false)
  const [winFrom, setWinFrom] = useState('2026-05-20')
  const [winTo, setWinTo] = useState(TODAY_ISO)

  const [dlg, setDlg] = useState<DialogKind | null>(null)
  const [dlgCtx, setDlgCtx] = useState<DialogContext | null>(null)
  const [dlgSubject, setDlgSubject] = useState<string | null>(null)
  const [promo, setPromo] = useState({ date: TODAY_ISO, note: '' })
  const [reasonText, setReasonText] = useState('')
  const [ev, setEv] = useState<EventForm>(NEW_EVENT)
  const [as, setAs] = useState<AssignForm>(NEW_ASSIGN)
  const [kudo, setKudo] = useState({ text: '', date: TODAY_ISO })

  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuQuery, setMenuQuery] = useState('')

  const { toast, toastMsg } = useToast(2400)
  const go = useCallback((m: string) => () => toastMsg(`Opening ${m}`), [toastMsg])

  const openMenu = useCallback((e: React.MouseEvent, kind: MenuState['kind'], extra?: string) => {
    e.stopPropagation()
    // A kebab and the export icon are icons, so their own width tells the
    // menu nothing.
    const at = kind === 'kebab' || kind === 'export' ? anchorAt(e, 210) : anchorTo(e, 240)
    setMenu({ kind, ...at, extra: extra ?? null })
    setMenuQuery('')
  }, [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const openDetail = useCallback((name: string) => {
    setView('detail')
    setDa(name)
    setLastDa(name)
    setMenu(null)
    setExpandAck(null)
  }, [])

  const list = useMemo(() => {
    let rows = ROSTER.filter((d) => (status === 'All' ? true : status === 'Inactive' ? !!d.inactive : !d.inactive))
    if (riskOnly) rows = rows.filter((d) => tierOf(d.net) === 'At Risk' && !d.inactive)
    if (Object.keys(tiers).length) rows = rows.filter((d) => tiers[tierOf(d.net)])
    const q = search.trim().toLowerCase()
    if (q) rows = rows.filter((d) => `${d.name} ${d.tid}`.toLowerCase().includes(q))
    const dir = sort.d === 'asc' ? 1 : -1
    const val = (d: Associate): string | number => {
      switch (sort.k) {
        case 'name': return d.name
        case 'openEv': return d.openEv
        case 'coach': return coachRank(d.coach)
        // Inactive sorts last, blocked first - the order you would triage in.
        case 'el': return d.inactive ? 2 : d.blocked ? 0 : 1
        case 'tenure': return d.tenureN
        default: return d.net
      }
    }
    return rows.slice().sort((a, b) => {
      const x = val(a)
      const y = val(b)
      return (x > y ? 1 : x < y ? -1 : 0) * dir
    })
  }, [status, riskOnly, tiers, search, sort])

  const selCount = Object.keys(sel).length
  const allSelected = list.length > 0 && list.every((d) => sel[d.tid])

  const toggleSel = useCallback((tid: string) => {
    setSel((s) => {
      const next = { ...s }
      if (next[tid]) delete next[tid]
      else next[tid] = true
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSel(allSelected ? {} : Object.fromEntries(list.map((d) => [d.tid, true])))
  }, [allSelected, list])

  const sortBy = useCallback((k: SortKey) => {
    setSort((s) => ({ k, d: s.k === k && s.d === 'asc' ? 'desc' : 'asc' }))
  }, [])

  const sortAcksBy = useCallback((k: AckSortKey) => {
    setAckSort((s) => ({ k, d: s.k === k && s.d === 'asc' ? 'desc' : 'asc' }))
  }, [])

  /** The associate the detail view is showing. */
  const current = useMemo(() => ROSTER.find((x) => x.name === da) ?? ROSTER[0], [da])
  const detail = useMemo(() => detailFor(current), [current])
  const stats = useMemo(() => summary(), [])

  const openDlg = useCallback((kind: DialogKind, subject?: string) => {
    setDlg(kind)
    setDlgSubject(subject ?? null)
    setMenu(null)
    if (kind === 'event') setEv(NEW_EVENT)
    if (kind === 'assign') setAs(NEW_ASSIGN)
    if (kind === 'kudo') setKudo({ text: '', date: TODAY_ISO })
    if (kind === 'promote') setPromo({ date: TODAY_ISO, note: '' })
  }, [])

  const openReason = useCallback((ctx: DialogContext) => {
    setDlg('reason')
    setDlgCtx(ctx)
    setMenu(null)
    setReasonText('')
  }, [])

  const closeDlg = useCallback(() => {
    setDlg(null)
    setDlgCtx(null)
    setMenu(null)
  }, [])

  // ── The filter drawer ─────────────────────────────────────────────────────

  const pending: PendingFilters = useMemo(
    () => pf ?? { tiers: { ...tiers }, status, risk: riskOnly },
    [pf, tiers, status, riskOnly],
  )
  const filterCount = Object.keys(tiers).length + (status !== 'Active' ? 1 : 0) + (riskOnly ? 1 : 0)

  const openFilters = useCallback(() => {
    setFpOpen(true)
    setMenu(null)
    setPf({ tiers: { ...tiers }, status, risk: riskOnly })
  }, [tiers, status, riskOnly])

  const applyFilters = useCallback(() => {
    setFpOpen(false)
    setTiers(pending.tiers)
    setStatus(pending.status)
    setRiskOnly(pending.risk)
    toastMsg('Filters applied')
  }, [pending, toastMsg])

  return {
    view, setView, da, lastDa, openDetail, current, detail, stats,
    search, setSearch, tiers, status, riskOnly, setRiskOnly, setStatus,
    fpOpen, setFpOpen, fpSec, setFpSec, pf, setPf, pending, filterCount, openFilters, applyFilters,
    sort, sortBy, list,
    sel, selCount, allSelected, toggleSel, selectAll, setSel,
    expandAck, setExpandAck, ackQ, setAckQ, ackSort, sortAcksBy,
    winPreset, setWinPreset, winOpen, setWinOpen, winFrom, setWinFrom, winTo, setWinTo,
    dlg, dlgCtx, dlgSubject, openDlg, openReason, closeDlg,
    promo, setPromo, reasonText, setReasonText, ev, setEv, as, setAs, kudo, setKudo,
    menu, openMenu, closeMenu, menuQuery, setMenuQuery,
    toast, toastMsg, go,
  }
}

export type RosterState = ReturnType<typeof useRoster>
