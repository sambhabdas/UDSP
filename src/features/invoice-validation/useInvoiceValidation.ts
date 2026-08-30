'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../ds/hooks'
import { FIRST_WEEK, LAST_WEEK, NOW_STAMP, TODAY, WHO, seedInvoices } from './data'
import type { Invoice } from './data'
import type { Day } from './date'
import { before, fmt, toSerial, weekEnd, weekStart } from './date'
import { billedTotal, compare, dataOf, hasInvoice, statusName } from './calc'
import type { Comparison } from './calc'
import { money } from './fmt'

export type Tab = 'dash' | 'val'
export type SortKey = 'week' | 'total' | 'status' | 'disputed' | 'discr' | 'stake'
export type SortDir = 'asc' | 'desc'

export type DialogKind =
  | 'na' | 'expect' | 'delete' | 'disputeIt' | 'revert' | 'accept' | 'resolve'
  | 'ref' | 'reviewed' | 'adjusted' | 'history' | 'approve' | 'dispute' | 'manual'

/** The rate editor — one service type, from one day, optionally carried on. */
export interface RateEditor {
  name: string
  rate: number
  units: number
  week: number
  rateVal: string
  carry: boolean
  from: Day
}

const PARSE_STAGES = [
  'reading the invoice',
  'extracting the billed lines',
  'pulling the work summary',
  'comparing',
]

export function useInvoiceValidation() {
  const [tab, setTab] = useState<Tab>('dash')
  const [inv, setInv] = useState<Record<number, Invoice>>(seedInvoices)
  const [vWeek, setVWeek] = useState(32)
  const [weeksOpen, setWeeksOpen] = useState(false)
  const [menuRow, setMenuRow] = useState<number | null>(null)

  const [filter, setFilter] = useState('All')
  /** The drawer's draft, thrown away on Cancel. */
  const [draftFilter, setDraftFilter] = useState<string | null>(null)
  const [fpOpen, setFpOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [parsing, setParsing] = useState(false)
  const [parsePct, setParsePct] = useState(0)
  const [replacing, setReplacing] = useState<number | null>(null)
  const [mismatchOnly, setMismatchOnly] = useState(false)
  const [routesOpen, setRoutesOpen] = useState(true)

  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [generated, setGenerated] = useState<Record<number, boolean>>({})
  /** Rate overrides, keyed by service-type name and shared across weeks. */
  const [rates, setRates] = useState<Record<string, number>>({})

  const [dialog, setDialog] = useState<DialogKind | null>(null)
  const [dlgRow, setDlgRow] = useState<number | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [editor, setEditor] = useState<RateEditor | null>(null)
  const [dpOpen, setDpOpen] = useState(false)
  const [dpMonth, setDpMonth] = useState<Day>({ y: 2026, m: 7, d: 1 })

  const { toast, toastMsg } = useToast(3200)

  const parseTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => () => { if (parseTimer.current) clearInterval(parseTimer.current) }, [])

  const closeTransient = useCallback(() => {
    setWeeksOpen(false)
    setMenuRow(null)
  }, [])

  // Escape unwinds one layer at a time, innermost first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (dpOpen) setDpOpen(false)
      else if (editor) setEditor(null)
      else if (dialog) { setDialog(null); setFields({}) }
      else if (menuRow !== null || weeksOpen) closeTransient()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dpOpen, editor, dialog, menuRow, weeksOpen, closeTransient])

  /** Every week whose Saturday is already behind us expects an invoice. */
  const elapsed = useMemo(() => {
    const out: number[] = []
    for (let n = FIRST_WEEK; n <= LAST_WEEK; n++) if (before(weekEnd(2026, n), TODAY)) out.push(n)
    return out
  }, [])

  const comparisonOf = useCallback(
    (n: number): Comparison => compare(n, inv[n], rates),
    [inv, rates],
  )
  const weekFigures = useCallback((n: number) => dataOf(n, inv[n]), [inv])

  /** Records one change and stamps the history in the same breath. */
  const patchInvoice = useCallback(
    (n: number, patch: Partial<Invoice>, action?: string, detail = '') => {
      setInv((s) => {
        const cur = s[n]
        const history = action ? [{ when: NOW_STAMP, who: WHO, action, detail }, ...cur.history] : cur.history
        return { ...s, [n]: { ...cur, ...patch, history } }
      })
    },
    [],
  )

  const openWeek = useCallback((n: number) => {
    setTab('val')
    setVWeek(n)
    setMenuRow(null)
    setMismatchOnly(false)
  }, [])

  const onSort = useCallback((k: SortKey) => {
    setSortKey((cur) => {
      if (cur !== k) { setSortDir('asc'); return k }
      if (sortDir === 'asc') { setSortDir('desc'); return k }
      setSortDir('desc')
      return null
    })
  }, [sortDir])

  /** The dashboard list — filtered, searched, then sorted. */
  const rows = useMemo(() => {
    let list = elapsed.slice()
    if (filter !== 'All') {
      list = list.filter((x) =>
        filter === 'Pending' ? inv[x].status === 'pending' && !inv[x].na : statusName(inv[x]) === filter,
      )
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((x) => {
        const i = inv[x]
        const hay = [
          `W${x} · 2026`,
          statusName(i),
          i.caseRef ?? '',
          i.decidedBy ?? '',
        ].join(' ').toLowerCase()
        return hay.includes(q)
      })
    }
    // Dispute first, then pending, then validated, then the N/A weeks.
    const rank = (x: number): number => {
      const i = inv[x]
      return i.na ? 3 : i.status === 'dispute' ? 0 : i.status === 'pending' ? 1 : 2
    }
    if (sortKey === null) return list.sort((a, b) => b - a)
    const value = (x: number): number => {
      switch (sortKey) {
        case 'week': return x
        case 'total': return hasInvoice(inv[x]) ? billedTotal(dataOf(x, inv[x])) : -1
        case 'status': return rank(x)
        case 'disputed': return inv[x].disputedOn ? toSerial(inv[x].disputedOn as Day) : 0
        case 'discr': return hasInvoice(inv[x]) ? compare(x, inv[x], rates).count : -1
        case 'stake': return inv[x].status === 'dispute' ? compare(x, inv[x], rates).atStake : -1
      }
    }
    return list.sort((a, b) => {
      const dd = value(a) - value(b)
      return (sortDir === 'desc' ? -dd : dd) || b - a
    })
  }, [elapsed, filter, query, sortKey, sortDir, inv, rates])

  // ── The validate tab ──────────────────────────────────────────────────────

  const cur = inv[vWeek]
  const has = hasInvoice(cur)
  const decided = cur.status !== 'pending'
  const isReplacing = replacing === vWeek && !decided

  // The progress counter lives in a ref as well as in state: the interval has
  // to read it to know when to stop, and a setState updater is not the place to
  // fire off the side effects that finishing the upload needs.
  const pctRef = useRef(0)
  const startParse = useCallback((n: number) => {
    setParsing(true)
    setParsePct(0)
    pctRef.current = 0
    if (parseTimer.current) clearInterval(parseTimer.current)
    parseTimer.current = setInterval(() => {
      pctRef.current = Math.min(100, pctRef.current + 12)
      setParsePct(pctRef.current)
      if (pctRef.current < 100) return
      if (parseTimer.current) { clearInterval(parseTimer.current); parseTimer.current = null }
      patchInvoice(n, { uploaded: true, source: 'pdf' }, 'Uploaded', `Invoice_W${n}_2026.pdf`)
      setParsing(false)
      setParsePct(0)
      setReplacing(null)
      setDrafts({})
      setGenerated({})
      toastMsg('Figures extracted and compared.')
    }, 160)
  }, [patchInvoice, toastMsg])

  /** Upload cycles: nothing → parse; already there → arm a replace; armed → cancel. */
  const upload = useCallback(() => {
    if (decided || parsing) return
    if (isReplacing) { setReplacing(null); return }
    if (has) { setReplacing(vWeek); return }
    startParse(vWeek)
  }, [decided, parsing, isReplacing, has, vWeek, startParse])

  const cancelParse = useCallback(() => {
    if (parseTimer.current) { clearInterval(parseTimer.current); parseTimer.current = null }
    pctRef.current = 0
    setParsing(false)
    setParsePct(0)
    toastMsg('Upload cancelled. Nothing was stored.')
  }, [toastMsg])

  const parseStage = PARSE_STAGES[Math.min(PARSE_STAGES.length - 1, Math.floor(parsePct / 26))]

  const openEditor = useCallback((name: string, r: number, units: number, week: number) => {
    const from = weekStart(2026, week)
    setEditor({ name, rate: r, units, week, rateVal: r.toFixed(2), carry: true, from })
    setDpOpen(false)
    setDpMonth({ y: from.y, m: from.m, d: 1 })
  }, [])

  const patchEditor = useCallback((patch: Partial<RateEditor>) => {
    setEditor((e) => (e ? { ...e, ...patch } : e))
  }, [])

  const saveRate = useCallback(() => {
    if (!editor) return
    const v = parseFloat(editor.rateVal) || 0
    if (v <= 0 || v === editor.rate) return
    setRates((r) => ({ ...r, [editor.name]: v }))
    setEditor(null)
    setDpOpen(false)
    setDrafts({})
    toastMsg(`${editor.name} is ${money(v)} from ${fmt(editor.from)}${editor.carry ? ', carried forward.' : '.'}`)
  }, [editor, toastMsg])

  const openDialog = useCallback((kind: DialogKind, row: number, f: Record<string, string> = {}) => {
    closeTransient()
    setDialog(kind)
    setDlgRow(row)
    setFields(f)
  }, [closeTransient])

  const closeDialog = useCallback(() => {
    setDialog(null)
    setFields({})
  }, [])

  const setField = useCallback((k: string, v: string) => setFields((f) => ({ ...f, [k]: v })), [])

  return {
    tab, setTab,
    inv, elapsed, rows, comparisonOf, weekFigures, patchInvoice,
    vWeek, cur, has, decided, isReplacing, openWeek,
    weeksOpen, setWeeksOpen, menuRow, setMenuRow, closeTransient,
    filter, setFilter, draftFilter, setDraftFilter, fpOpen, setFpOpen,
    query, setQuery, sortKey, sortDir, onSort,
    parsing, parsePct, parseStage, upload, cancelParse, setReplacing,
    mismatchOnly, setMismatchOnly, routesOpen, setRoutesOpen,
    drafts, setDrafts, generated, setGenerated, rates,
    dialog, dlgRow, fields, setField, openDialog, closeDialog,
    editor, openEditor, patchEditor, saveRate, setEditor,
    dpOpen, setDpOpen, dpMonth, setDpMonth,
    toast, toastMsg,
  }
}

export type IvState = ReturnType<typeof useInvoiceValidation>
