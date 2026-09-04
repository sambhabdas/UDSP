'use client'

import { useCallback, useMemo, useState } from 'react'
import { useUndoToast } from '../../ds/hooks'
import {
  DEFAULT_GRACE,
  DEFAULT_SCHED_OFFSET,
  DEFAULT_WAVE_OFFSET,
  ME,
  NOW,
  ON_NOW,
  SEED_SERVICE_TYPES,
  SEED_TEMPLATES,
  seedDay,
} from './data'
import type { Day, Itinerary, Minutes, Row, ServiceType, Template } from './data'
import { fmt, parseT } from './calc'

export type Tab = 'loadout' | 'onroad' | 'rts' | 'setup'
export type GroupBy = 'type' | 'wave'

/** Which subset of the roster the board is showing. */
export type BoardFilter =
  | { t: 'chip'; k: 'noVan' | 'noRoute' | 'noWave' | 'noDriver' | 'noStaging' | 'sent' | 'punch' }
  | { t: 'wave'; v: Minutes | null }
  | { t: 'wavestate'; v: Minutes | null; s: 'in' | 'missing' | 'out' }
  | { t: 'warn' }
  | { t: 'rescUn' }

/** Which cell is being typed into. One at a time, across every list. */
export interface EditTarget {
  list: 'r' | 'resc' | 'sb' | 'rts' | 'or' | 'orit' | 'rtsov' | 'oc' | 'co'
  id: string
  f: string
}

/** An anchored popup. `kind` says what it lists; `extra` says for which row. */
export interface MenuState {
  kind: string
  extra?: string | number | null
  x: number
  y: number
  up?: boolean
}

export interface Dismissal {
  who: string
  when: string
  label: string
}

/** What the boards read. Derived from the hook so the two cannot drift. */
export type DispatchState = ReturnType<typeof useDispatch>

export function useDispatch() {
  // ---- the day ------------------------------------------------------------
  const [days, setDays] = useState<Record<number, Day>>(() => ({ 0: seedDay() }))
  const [dayOff, setDayOff] = useState(0)
  const day = days[dayOff] ?? {
    rows: [], resc: [], sb: [], oc: [], co: [], itin: {},
    orMsgs: {}, orNotes: {}, orSent: {}, rtsCounts: {}, rtsNotes: {},
    rtsClosed: null, unmatched: [],
  }
  const isToday = dayOff === 0

  const [savedAt, setSavedAt] = useState(fmt(NOW))
  // The snapshot rides along as the toast's payload, so Undo is offered for
  // exactly as long as the line that offers it.
  const { toast, undoable: undoSnap, toastMsg, clear: clearToast } = useUndoToast<Day>(6000)

  // `setDay`, `act` and `commitEdit` all close over the current day, which is a
  // new object every render. Wrapping them in useCallback would rebuild the
  // callback every render anyway - the memo would be a lie - so they are plain
  // functions. They are only ever called from event handlers.

  /** Write into today and stamp the save clock - every board edits through here. */
  const setDay = (patch: Partial<Day>) => {
    setDays((ds) => ({ ...ds, [dayOff]: { ...(ds[dayOff] ?? seedDay()), ...patch } }))
    setSavedAt(fmt(NOW))
  }

  /** An edit worth offering back. The snapshot is taken before the write, so
   *  Undo restores the whole day rather than guessing at an inverse. */
  const act = (label: string, patch: Partial<Day>) => {
    const before = JSON.parse(JSON.stringify(day)) as Day
    setDay(patch)
    toastMsg(label, before)
  }

  const undo = useCallback(() => {
    if (!undoSnap) return
    setDays((ds) => ({ ...ds, [dayOff]: undoSnap }))
    clearToast()
  }, [undoSnap, dayOff, clearToast])

  // ---- board chrome -------------------------------------------------------
  const [tab, setTab] = useState<Tab>('loadout')
  const [group, setGroup] = useState<GroupBy>('type')
  const [filter, setFilter] = useState<BoardFilter | null>(null)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [cols, setCols] = useState({ staging: true, sched: true, punch: true, last: true })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [schedOff, setSchedOff] = useState(DEFAULT_SCHED_OFFSET)
  const [waveOff, setWaveOff] = useState(DEFAULT_WAVE_OFFSET)
  const grace = DEFAULT_GRACE

  /** Clicking the chip that is already on clears it, so a filter is a toggle. */
  const toggleFilter = useCallback((f: BoardFilter) => {
    setFilter((cur) => (JSON.stringify(cur) === JSON.stringify(f) ? null : f))
    setSel({})
  }, [])

  const [cal, setCal] = useState<{ x: number; y: number; m: number; yr: number } | null>(null)

  // ---- inline editing -----------------------------------------------------
  const [edit, setEdit] = useState<EditTarget | null>(null)
  const [editVal, setEditVal] = useState('')

  /** Stepping to another day clears everything scoped to the one you left, and
   *  seeds the new day so every board has something to read. */
  const goDay = useCallback((off: number) => {
    setDayOff(off)
    setFilter(null)
    setSel({})
    setEdit(null)
    setCal(null)
    setDays((ds) => (ds[off] ? ds : { ...ds, [off]: seedDay() }))
  }, [])

  const startEdit = (list: EditTarget['list'], id: string, f: string, v: unknown) => {
    setEdit({ list, id, f })
    setEditVal(v === null || v === undefined ? '' : String(v))
  }

  const commitEdit = () => {
    if (!edit) return
    const v = editVal.trim()
    const ed = edit

    if (ed.list === 'r') {
      setDay({
        rows: day.rows.map((r) => {
          if (r.id !== ed.id) return r
          const n: Row = { ...r }
          if (ed.f === 'route') n.route = v.toUpperCase()
          if (ed.f === 'staging') n.staging = v
          if (ed.f === 'wave') {
            const t = parseT(v)
            n.wave = t
            // Retyping the wave drops a scheduled-arrival override: the offset
            // is the rule again unless somebody overrides it afresh.
            if (t !== null) { n.schedOv = false; delete n.sched }
          }
          if (ed.f === 'sched') {
            const t = parseT(v)
            if (t !== null) { n.schedOv = true; n.sched = t } else { n.schedOv = false; delete n.sched }
          }
          return n
        }),
      })
    } else if (ed.list === 'resc') {
      setDay({
        resc: day.resc.map((x) =>
          x.id === ed.id ? { ...x, totes: v === '' ? null : parseInt(v) || 0 } : x,
        ),
      })
    } else if (ed.list === 'sb') {
      setDay({
        sb: day.sb.map((x) => {
          if (x.id !== ed.id) return x
          if (ed.f === 'wave') return { ...x, wave: parseT(v) }
          if (ed.f === 'schedArr') return { ...x, schedArr: parseT(v) }
          return x
        }),
      })
    } else if (ed.list === 'rts') {
      if (ed.f === 'counted') {
        const rtsCounts = { ...day.rtsCounts }
        if (v === '') delete rtsCounts[ed.id]
        else rtsCounts[ed.id] = parseInt(v) || 0
        setDay({ rtsCounts })
      } else {
        const rtsNotes = { ...day.rtsNotes }
        if (v === '') delete rtsNotes[ed.id]
        else rtsNotes[ed.id] = { txt: v, who: ME, when: fmt(NOW) }
        setDay({ rtsNotes })
      }
    } else if (ed.list === 'or') {
      const orNotes = { ...day.orNotes }
      const prev = orNotes[ed.id]
      if (v === '' && !prev) { setEdit(null); return }
      if (v === '') delete orNotes[ed.id]
      else orNotes[ed.id] = { txt: v, issue: prev ? prev.issue : false, who: ME, when: fmt(ON_NOW) }
      setDay({ orNotes })
    } else if (ed.list === 'orit') {
      const itin = { ...day.itin }
      const prev = itin[ed.id]
      const it: Itinerary = prev
        ? { ...prev }
        : { st: 'pace', pkg: [0, 100], stp: [0, 100], proj: null }
      // Keep what the feed said, so a typed-over row can still show it.
      if (!it.orig) it.orig = { pkg: it.pkg, stp: it.stp, plan: it.plan, st: it.st }
      it.manual = true
      if (ed.f === 'pkg' || ed.f === 'stp') {
        const m = v.match(/^(\d+)\s*\/\s*(\d+)$/)
        if (!m) {
          setEdit(null)
          if (v !== '') toastMsg('Type it as done/total, e.g. 176/248')
          return
        }
        it[ed.f] = [parseInt(m[1]), parseInt(m[2])]
        if (it.st === 'nodata') it.st = 'pace'
      }
      if (ed.f === 'plan') it.plan = parseT(v) ?? undefined
      if (ed.f === 'proj') it.proj = parseT(v)
      itin[ed.id] = it
      setDay({ itin })
    } else if (ed.list === 'rtsov') {
      const rtsOv = { ...(day.rtsOv ?? {}) }
      const cur = { ...(rtsOv[ed.id] ?? {}) }
      if (ed.f === 'route') {
        if (v) cur.route = v.toUpperCase()
        else delete cur.route
      } else {
        const n = parseInt(v)
        if (v === '' || isNaN(n)) delete cur[ed.f]
        else cur[ed.f] = n
      }
      rtsOv[ed.id] = cur
      setDay({ rtsOv })
    } else if (ed.list === 'oc') {
      setDay({ oc: day.oc.map((x) => (x.id === ed.id ? { ...x, comingAt: v } : x)) })
    } else if (ed.list === 'co') {
      setDay({ co: day.co.map((x) => (x.id === ed.id ? { ...x, reason: v } : x)) })
    }
    setEdit(null)
  }

  // ---- anchored menus -----------------------------------------------------
  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuQ, setMenuQ] = useState('')

  const openMenu = useCallback(
    (e: { stopPropagation: () => void; currentTarget: Element }, kind: string, extra?: string | number | null) => {
      e.stopPropagation()
      const r = e.currentTarget.getBoundingClientRect()
      // Flip a menu that would open past the bottom of the window.
      const up = r.bottom + 280 > window.innerHeight
      setMenu({ kind, extra, x: Math.round(r.left), y: up ? Math.round(window.innerHeight - r.top + 4) : Math.round(r.bottom + 4), up })
      setMenuQ('')
    },
    [],
  )
  const closeMenu = useCallback(() => setMenu(null), [])

  // ---- warnings the board has been told to stop showing -------------------
  const [dismissed, setDismissed] = useState<Record<string, Dismissal>>({})
  const [disLog, setDisLog] = useState<{ row: string; label: string; who: string; when: string }[]>([])
  const [skipped, setSkipped] = useState('')

  // ---- On Road ------------------------------------------------------------
  const [orFilter, setOrFilter] = useState<string | null>(null)
  const [orQ, setOrQ] = useState('')
  const [orSel, setOrSel] = useState<Record<string, boolean>>({})
  const [orCols, setOrCols] = useState({ van: false, notes: true })
  const [orFresh] = useState(fmt(ON_NOW))

  // ---- Setup --------------------------------------------------------------
  const [svcReg, setSvcReg] = useState<ServiceType[]>(SEED_SERVICE_TYPES)
  const [strips, setStrips] = useState({ oc: true, co: true })
  const [tmpls, setTmpls] = useState<Template[]>(SEED_TEMPLATES)
  const [tmplSel, setTmplSel] = useState(0)
  const [tmplEdit, setTmplEdit] = useState<number | null>(null)
  const [tmplDraft, setTmplDraft] = useState('')

  // ---- dialogs ------------------------------------------------------------
  const [dlg, setDlg] = useState<string | null>(null)
  const [dlgData, setDlgData] = useState<Record<string, unknown>>({})
  const [hang, setHang] = useState<{ list: string; id: string; name: string } | null>(null)
  const [hangStage, setHangStage] = useState<string | null>(null)
  const [hangVal, setHangVal] = useState('')

  const openDlg = useCallback((kind: string, data?: Record<string, unknown>) => {
    setDlg(kind)
    setDlgData(data ?? {})
    setMenu(null)
  }, [])
  const closeDlg = useCallback(() => {
    setDlg(null)
    setDlgData({})
  }, [])

  // ---- collapsible panels -------------------------------------------------
  const [panels, setPanels] = useState<Record<string, boolean>>({})
  const togglePanel = useCallback(
    (k: string) => setPanels((p) => ({ ...p, [k]: !p[k] })),
    [],
  )

  // The bench keeps its own selection and filter per list; only Standby shares
  // the roster's `sel`, because Move To can shuffle rows between the two.
  const [selResc, setSelResc] = useState<Record<string, boolean>>({})
  const [qResc, setQResc] = useState('')
  const [qSb, setQSb] = useState('')
  const [selOc, setSelOc] = useState<Record<string, boolean>>({})
  const [qOc, setQOc] = useState('')
  const [selCo, setSelCo] = useState<Record<string, boolean>>({})
  const [qCo, setQCo] = useState('')

  // ---- what the boards filter down to -------------------------------------
  const selIds = useMemo(() => Object.keys(sel).filter((id) => sel[id]), [sel])

  return {
    // day
    day, dayOff, isToday, goDay, setDay, act, savedAt,
    cal, setCal,
    // chrome
    tab, setTab, group, setGroup, filter, setFilter, toggleFilter,
    q, setQ, sel, setSel, selIds,
    sortKey, setSortKey, sortDir, setSortDir,
    cols, setCols, collapsed, setCollapsed,
    schedOff, setSchedOff, waveOff, setWaveOff, grace,
    // editing
    edit, setEdit, editVal, setEditVal, startEdit, commitEdit,
    // menus
    menu, openMenu, closeMenu, menuQ, setMenuQ,
    // warnings
    dismissed, setDismissed, disLog, setDisLog, skipped, setSkipped,
    // on road
    orFilter, setOrFilter, orQ, setOrQ, orSel, setOrSel, orCols, setOrCols, orFresh,
    // setup
    svcReg, setSvcReg, strips, setStrips,
    tmpls, setTmpls, tmplSel, setTmplSel, tmplEdit, setTmplEdit, tmplDraft, setTmplDraft,
    // dialogs
    dlg, dlgData, setDlgData, openDlg, closeDlg,
    hang, setHang, hangStage, setHangStage, hangVal, setHangVal,
    // panels + rescue selection
    panels, togglePanel,
    selResc, setSelResc, qResc, setQResc,
    qSb, setQSb, selOc, setSelOc, qOc, setQOc, selCo, setSelCo, qCo, setQCo,
    // toast
    toast, toastMsg, undoSnap, undo,
  }
}
