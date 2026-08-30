'use client'

import { useCallback, useMemo, useState } from 'react'
import { useUndoToast } from '../../ds/hooks'
import {
  CURRENT_USER,
  DEFAULT_MONTHS,
  LOCKED_THROUGH,
  REGISTRY,
  SEED_NOTES,
  SEED_PKG_WINDOWS,
  SEED_TRAIN_WINDOWS,
  SEED_TYPES,
  TIMELINE_ANCHOR,
  TODAY,
  WEEK0,
  ZOOM_STEPS,
} from './data'
import type { Note, PaidBy, RateKind, RateWindow, ServiceType, WindowState } from './data'
import {
  addDays,
  addMonths,
  applyWindow,
  cents,
  fmtD,
  fromIso,
  iso,
  money,
  pkgsOn,
  rangeDays,
  revenueFor,
  routesOn,
  trainingsOn,
  windowState,
  winOn,
} from './calc'

/** Which column the table is ordered by. */
export type SortKey = 'name' | 'hours' | 'paid' | 'rate' | 'from' | 'to' | 'routes' | 'revenue'

export interface Filters {
  hours: string | null
  paidBy: string | null
  to: string | null
}

/** The rate editor, while it is open. */
export interface Editor {
  kind: RateKind
  typeId: string | null
  rate: string
  from: string
  to: string
  /** On: the rate runs from `from` until something later changes it. */
  carry: boolean
  error: string
}

/** Everything a rate change touches, kept so Undo can put it all back. */
interface Snapshot {
  types: ServiceType[]
  pkgWindows: RateWindow[]
  trainWindows: RateWindow[]
}

/** What the sections read. Derived from the hook so the two cannot drift. */
export type RateCardsState = ReturnType<typeof useRateCards>

// The design file computes a grain picker, a range stepper and an export menu
// that its own markup never renders, so the range it actually shows is the
// default: the seeded week, Sun Jul 26 – Sat Aug 1, 2026.
const RANGE_START = WEEK0
const RANGE_END = addDays(WEEK0, 6)

export function useRateCards() {
  const [types, setTypes] = useState<ServiceType[]>(SEED_TYPES)
  const [pkgWindows, setPkgWindows] = useState<RateWindow[]>(SEED_PKG_WINDOWS)
  const [trainWindows, setTrainWindows] = useState<RateWindow[]>(SEED_TRAIN_WINDOWS)

  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [filters, setFilters] = useState<Filters>({ hours: null, paidBy: null, to: null })
  const [fpOpen, setFpOpen] = useState(false)
  // The panel edits a draft; nothing reaches the table until Apply.
  const [draft, setDraft] = useState<Filters | null>(null)
  const [fpSec, setFpSec] = useState<Record<string, boolean>>({ hours: true, paidBy: true, to: true })

  const [editor, setEditor] = useState<Editor | null>(null)
  const [dpOpen, setDpOpen] = useState<'from' | 'to' | null>(null)
  const [dpMonth, setDpMonth] = useState<Date | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [addPick, setAddPick] = useState<string | null>(null)
  const [addName, setAddName] = useState('')
  const [addHours, setAddHours] = useState('')
  const [addPaid, setAddPaid] = useState<PaidBy>('Amazon')
  const [addQuery, setAddQuery] = useState('')
  const [addMenuOpen, setAddMenuOpen] = useState(false)

  const [tlAnchor, setTlAnchor] = useState<Date>(TIMELINE_ANCHOR)
  const [tlMonths, setTlMonths] = useState(DEFAULT_MONTHS)

  const [notes, setNotes] = useState<Note[]>(SEED_NOTES)
  const [noteText, setNoteText] = useState('')

  // A change that can be undone holds the toast twice as long — the offer is
  // useless if it goes before it is read.
  const { toast: toastText, undoable: undoSnap, toastMsg: toast, clear: clearToast } =
    useUndoToast<Snapshot>(3000, 6000)

  const undo = useCallback(() => {
    if (!undoSnap) return
    setTypes(undoSnap.types)
    setPkgWindows(undoSnap.pkgWindows)
    setTrainWindows(undoSnap.trainWindows)
    clearToast()
  }, [undoSnap, clearToast])

  const snapshot = useCallback(
    (): Snapshot => ({
      types: types.map((t) => ({ ...t, windows: t.windows.map((w) => ({ ...w })) })),
      pkgWindows: pkgWindows.map((w) => ({ ...w })),
      trainWindows: trainWindows.map((w) => ({ ...w })),
    }),
    [types, pkgWindows, trainWindows],
  )

  // ---- rows -----------------------------------------------------------------

  const rowData = useMemo(() => {
    let list = types.slice()
    if (filters.hours) list = list.filter((t) => `${t.hours} hr` === filters.hours)
    if (filters.paidBy) list = list.filter((t) => t.paidBy === filters.paidBy)
    if (filters.to) list = list.filter((t) => windowState(t) === filters.to)

    const rows = list.map((t) => {
      const rev = revenueFor(t, RANGE_START, RANGE_END)
      const routes = rangeDays(RANGE_START, RANGE_END).reduce((a, d) => a + routesOn(t, d), 0)
      return { t, w: winOn(t.windows, TODAY), routes, rev: rev.sum, rateCount: rev.rateCount }
    })

    if (!sortKey) return rows
    const key: Record<SortKey, (r: (typeof rows)[number]) => string | number> = {
      name: (r) => r.t.name,
      hours: (r) => r.t.hours,
      paid: (r) => r.t.paidBy,
      rate: (r) => r.w?.rate ?? -1,
      from: (r) => r.w?.from ?? '',
      to: (r) => windowState(r.t),
      routes: (r) => r.routes,
      revenue: (r) => r.rev,
    }
    const kf = key[sortKey]
    return rows.slice().sort((a, b) => {
      const x = kf(a)
      const y = kf(b)
      const d = typeof x === 'string' ? x.localeCompare(y as string) : x - (y as number)
      return sortDir === 'desc' ? -d : d
    })
  }, [types, filters, sortKey, sortDir])

  // Two plain setters rather than one nested in the other's updater: an
  // updater that also sets state runs twice under StrictMode.
  const sortBy = useCallback(
    (k: SortKey) => {
      setSortDir((dir) => (sortKey === k && dir === 'asc' ? 'desc' : 'asc'))
      setSortKey(k)
    },
    [sortKey],
  )

  const totals = useMemo(
    () => ({
      routes: rowData.reduce((a, r) => a + r.routes, 0),
      revenue: rowData.reduce((a, r) => a + r.rev, 0),
      types: rowData.length,
    }),
    [rowData],
  )

  // ---- the two Others rows (never filtered) ---------------------------------

  const others = useMemo(() => {
    const dayList = rangeDays(RANGE_START, RANGE_END)
    let pkgCount = 0
    let pkgRev = 0
    dayList.forEach((d) => {
      const p = winOn(pkgWindows, d)
      pkgCount += pkgsOn(d)
      if (p?.paid) pkgRev += pkgsOn(d) * p.rate
    })
    let trainCount = 0
    let trainRev = 0
    dayList.forEach((d) => {
      const t = winOn(trainWindows, d)
      trainCount += trainingsOn(d)
      if (t?.paid) trainRev += trainingsOn(d) * t.rate
    })
    return {
      pkg: { win: winOn(pkgWindows, TODAY), count: pkgCount, revenue: pkgRev },
      train: { win: winOn(trainWindows, TODAY), count: trainCount, revenue: trainRev },
    }
  }, [pkgWindows, trainWindows])

  // ---- filters --------------------------------------------------------------

  const hoursOptions = useMemo(() => {
    const out: string[] = []
    types.forEach((t) => {
      const label = `${t.hours} hr`
      if (!out.includes(label)) out.push(label)
    })
    return out.sort((a, b) => parseInt(b) - parseInt(a))
  }, [types])

  const countFor = useCallback(
    (key: keyof Filters, option: string) =>
      types.filter((t) =>
        key === 'hours'
          ? `${t.hours} hr` === option
          : key === 'paidBy'
            ? t.paidBy === option
            : windowState(t) === option,
      ).length,
    [types],
  )

  const appliedCount = (['hours', 'paidBy', 'to'] as const).filter((k) => filters[k]).length
  const pf = draft ?? filters

  const openFilters = useCallback(() => {
    setDraft(filters)
    setFpOpen(true)
  }, [filters])

  const toggleDraft = useCallback((key: keyof Filters, value: string) => {
    setDraft((d) => {
      const base = d ?? { hours: null, paidBy: null, to: null }
      return { ...base, [key]: base[key] === value ? null : value }
    })
  }, [])

  const applyFilters = useCallback(() => {
    setFilters(pf)
    setFpOpen(false)
  }, [pf])

  // ---- the editor -----------------------------------------------------------

  const openEditor = useCallback(
    (typeId: string | null, dayIso?: string | null, kind?: RateKind) => {
      const t = typeId ? types.find((x) => x.id === typeId) : null
      if (t && t.paidBy === 'DSP') {
        toast('Unpaid Rescues is paid by the DSP, so its rate is locked at $0.00.')
        return
      }
      const k: RateKind = kind ?? (typeId ? 'route' : 'package')
      const day = dayIso ?? iso(TODAY)
      const list = t ? t.windows : k === 'training' ? trainWindows : pkgWindows
      const cur = winOn(list, fromIso(day))
      const hasEnd = !!cur?.to
      setEditor({
        kind: k,
        typeId: typeId ?? null,
        rate: cur ? cur.rate.toFixed(2) : '',
        from: day,
        to: hasEnd ? (cur!.to as string) : day,
        carry: !hasEnd,
        error: '',
      })
      setDpOpen(null)
      setDpMonth(null)
    },
    [types, pkgWindows, trainWindows, toast],
  )

  const patchEditor = useCallback(
    (p: Partial<Editor>) => setEditor((e) => (e ? { ...e, error: '', ...p } : e)),
    [],
  )

  const closeEditor = useCallback(() => {
    setEditor(null)
    setDpOpen(null)
  }, [])

  const commit = useCallback(() => {
    if (!editor) return
    const rate = parseFloat(editor.rate)
    if (isNaN(rate) || rate <= 0) {
      setEditor((e) =>
        e
          ? {
              ...e,
              error:
                'A zero here would read as a real price. Leave the day unpriced instead, or set Paid by: DSP on the service type.',
            }
          : e,
      )
      return
    }
    if (!editor.carry && editor.to < editor.from) {
      setEditor((e) =>
        e
          ? {
              ...e,
              error: `An end before the start would overlap the window it closes. Pick an end on or after ${fmtD(fromIso(editor.from))}.`,
            }
          : e,
      )
      return
    }

    const snap = snapshot()
    const meta = { by: CURRENT_USER, at: fmtD(TODAY, true) }
    const fromD = fromIso(editor.from)

    // Payroll has closed the days up to LOCKED_THROUGH; they keep the old rate
    // whatever this change says, and the toast says how many.
    let locked = 0
    const stop = editor.carry ? addDays(fromD, 120) : fromIso(editor.to)
    for (let d = new Date(fromD); d <= stop && d <= LOCKED_THROUGH; d = addDays(d, 1)) locked += 1
    const lockedNote = locked
      ? ` · ${locked} locked ${locked === 1 ? 'day keeps' : 'days keep'} the old rate`
      : ''

    if (editor.kind === 'route') {
      const t = types.find((x) => x.id === editor.typeId)
      if (!t) return
      const next = applyWindow(t.windows, rate, editor.from, editor.to, editor.carry, meta)
      setTypes((ts) => ts.map((x) => (x.id === t.id ? { ...x, windows: next } : x)))
      setEditor(null)
      toast(`${t.name} ${t.hours} hr is ${money(rate)} from ${fmtD(fromD)}${lockedNote}`, snap)
      return
    }

    const isPkg = editor.kind === 'package'
    const list = isPkg ? pkgWindows : trainWindows
    const next = applyWindow(list, rate, editor.from, editor.to, editor.carry, {
      paid: true,
      ...meta,
    })
    if (isPkg) setPkgWindows(next)
    else setTrainWindows(next)
    setEditor(null)
    toast(
      isPkg
        ? `Packages pay ${cents(rate)} from ${fmtD(fromD)}${lockedNote}`
        : `Training pays ${money(rate)} from ${fmtD(fromD)}${lockedNote}`,
      snap,
    )
  }, [editor, types, pkgWindows, trainWindows, snapshot, toast])

  // ---- add a service type ---------------------------------------------------

  const registryMatches = useMemo(() => {
    const q = addQuery.trim().toLowerCase()
    return REGISTRY.filter(
      (g) =>
        !types.some((t) => t.name === g.name && t.hours === g.hours) &&
        (!q || `${g.name} ${g.hours} hr ${g.paidBy}`.toLowerCase().includes(q)),
    )
  }, [types, addQuery])

  const addReady = !!(addPick || (addName.trim() && addHours))

  const openAdd = useCallback(() => {
    setAddOpen(true)
    setAddPick(null)
    setAddName('')
    setAddHours('')
    setAddPaid('Amazon')
    setAddQuery('')
    setAddMenuOpen(false)
  }, [])

  const commitAdd = useCallback(() => {
    const def = addPick
      ? REGISTRY.find((g) => g.name + g.hours === addPick)
      : addName.trim() && addHours
        ? { name: addName.trim(), hours: parseInt(addHours, 10), paidBy: addPaid }
        : null
    if (!def) return

    const id = def.name.toLowerCase().replace(/[^a-z0-9]/g, '') + def.hours
    if (types.some((t) => t.id === id)) {
      setAddOpen(false)
      toast(`${def.name} ${def.hours} hr is already on this page.`)
      return
    }

    const dsp = def.paidBy === 'DSP'
    setTypes((ts) =>
      ts.concat([
        {
          id,
          name: def.name,
          hours: def.hours,
          paidBy: def.paidBy,
          created: iso(TODAY),
          // A DSP-paid type is born locked at zero; an Amazon one is born
          // unpriced, and the editor opens straight away to price it.
          windows: dsp
            ? [{ rate: 0, from: iso(TODAY), to: null, by: 'System', at: fmtD(TODAY, true) }]
            : [],
        },
      ]),
    )
    setAddOpen(false)
    setAddMenuOpen(false)
    if (dsp) toast(`${def.name} ${def.hours} hr added · locked at $0.00`)
    else openEditor(id, iso(TODAY))
  }, [addPick, addName, addHours, addPaid, types, toast, openEditor])

  // ---- timeline -------------------------------------------------------------

  const zoomIndex = Math.max(0, ZOOM_STEPS.indexOf(tlMonths))
  const zoomIn = useCallback(() => {
    setTlMonths((m) => {
      const i = ZOOM_STEPS.indexOf(m)
      return i > 0 ? ZOOM_STEPS[i - 1] : m
    })
  }, [])
  const zoomOut = useCallback(() => {
    setTlMonths((m) => {
      const i = ZOOM_STEPS.indexOf(m)
      return i >= 0 && i < ZOOM_STEPS.length - 1 ? ZOOM_STEPS[i + 1] : m
    })
  }, [])

  // ---- notes ----------------------------------------------------------------

  const postNote = useCallback(() => {
    const text = noteText.trim()
    if (!text) return
    setNotes((n) =>
      [
        {
          author: CURRENT_USER,
          at: `${TODAY.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, 9:14 am`,
          text,
        },
      ].concat(n),
    )
    setNoteText('')
  }, [noteText])

  return {
    types, pkgWindows, trainWindows,
    rangeStart: RANGE_START, rangeEnd: RANGE_END,
    rowData, totals, others,
    sortKey, sortDir, sortBy,
    filters, appliedCount, filtered: !!(filters.hours || filters.paidBy || filters.to),
    fpOpen, setFpOpen, openFilters, pf, toggleDraft, applyFilters,
    clearDraft: () => setDraft({ hours: null, paidBy: null, to: null }),
    fpSec, toggleSection: (k: string) => setFpSec((s) => ({ ...s, [k]: !s[k] })),
    hoursOptions, countFor,
    editor, openEditor, patchEditor, closeEditor, commit,
    dpOpen, setDpOpen, dpMonth, setDpMonth,
    addOpen, setAddOpen, openAdd, commitAdd, addReady,
    addPick, setAddPick, addName, setAddName, addHours, setAddHours,
    addPaid, setAddPaid, addQuery, setAddQuery, addMenuOpen, setAddMenuOpen, registryMatches,
    tlAnchor, tlMonths, zoomIndex, zoomIn, zoomOut,
    tlPrev: () => setTlAnchor((a) => addMonths(a, -1)),
    tlNext: () => setTlAnchor((a) => addMonths(a, 1)),
    notes, noteText, setNoteText, postNote,
    toast, toastText, undoSnap, undo,
  }
}

export type { WindowState }
