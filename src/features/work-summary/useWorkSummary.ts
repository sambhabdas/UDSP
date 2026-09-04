'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { clampLeft, useUndoToast } from '../../ds/hooks'
import {
  BASE_DAY,
  LAUNCHED,
  ME,
  SEED_FILE,
  SEED_MANUAL,
  SEED_MARKS,
  SEED_RESCUES,
  SEED_TYPES,
  SEED_TYPE_NOTES,
  STAMP_TIME,
  dateLabel,
} from './data'
import type {
  FileCounts,
  Mark,
  Note,
  PaidBy,
  RescSortKey,
  Rescue,
  ServiceType,
  Status,
  TypeSortKey,
} from './data'

export type MenuKind = 'status' | 'export' | 'unmatched' | 'addtype' | 'swaptype' | 'addresc' | 'paid'

export interface MenuState {
  kind: MenuKind
  extra?: string
  x: number
  y: number
  /** Where the inline search sits - over the control that opened the menu. */
  tx: number
  ty: number
  tw: number
  th: number
}

/** Which cell is being typed into. `list` names the field, `id` the row. */
export interface EditTarget {
  list: string
  id: string
}

/** The Add / Edit Service Type dialog's draft. */
export interface TypeForm {
  id: string | null
  name: string
  hrs: number
  /** Free-typed hours, when none of the four presets fit. */
  other: string
  paid: PaidBy
  amz: string
  veh: string[]
  counts: 'typed' | 'fed'
}

/** One service-type row with the file counts and the count that ran. */
export interface TypeRow {
  t: ServiceType
  f: FileCounts | null
  ran: number | null
}

export function useWorkSummary() {
  const [dayOff, setDayOff] = useState(0)
  const [status, setStatus] = useState<Status>('pending')
  const [statusStamp, setStatusStamp] = useState<{ who: string; when: string } | null>(null)

  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [sel2, setSel2] = useState<Record<string, boolean>>({})
  const [q, setQ] = useState('')

  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuW, setMenuW] = useState(240)
  const [menuQ, setMenuQ] = useState('')


  const [edit, setEdit] = useState<EditTarget | null>(null)
  const [editVal, setEditVal] = useState('')

  const [types, setTypes] = useState<ServiceType[]>(SEED_TYPES)
  const [file, setFile] = useState<Record<string, FileCounts>>(SEED_FILE)
  const [manual, setManual] = useState<Record<string, number>>(SEED_MANUAL)
  const [typeNotes, setTypeNotes] = useState<Record<string, Note>>(SEED_TYPE_NOTES)
  const [rescNotes, setRescNotes] = useState<Record<string, Note>>({})
  const [marks, setMarks] = useState<Record<string, Mark>>(SEED_MARKS)
  const [resc, setResc] = useState<Rescue[]>(SEED_RESCUES)

  const [typeSort, setTypeSort] = useState<{ k: TypeSortKey; dir: 1 | -1 } | null>(null)
  const [rescSort, setRescSort] = useState<{ k: RescSortKey; dir: 1 | -1 } | null>(null)

  const [form, setForm] = useState<TypeForm | null>(null)

  // ---- chrome --------------------------------------------------------------

  // The callback rides along as the toast's payload, so the Undo offer and the
  // line that makes it expire together.
  const { toast, undoable: undo, toastMsg, clear: clearToast } = useUndoToast<() => void>(6000)

  useEffect(() => {
    if (!menu) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-pop]')) setMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  const openMenu = useCallback((e: React.MouseEvent, kind: MenuKind, extra?: string, w?: number) => {
    e.stopPropagation()
    const rc = e.currentTarget.getBoundingClientRect()
    // The three pickers get a search field sized to the control they came from;
    // the rest are plain lists at a fixed or caller-given width.
    const searchable = kind === 'addtype' || kind === 'addresc' || kind === 'swaptype'
    const mw = searchable
      ? Math.max(Math.round(rc.width), 300)
      : kind === 'paid'
        ? Math.max(Math.round(rc.width), 160)
        : (w ?? 240)
    const x = clampLeft(rc.left, mw)
    setMenu({
      kind, extra, x, y: rc.bottom + 4,
      tx: searchable ? x : rc.left,
      ty: rc.top,
      tw: searchable ? mw : Math.max(Math.round(rc.width), 160),
      th: Math.max(Math.round(rc.height), 28),
    })
    setMenuW(mw)
    setMenuQ('')
  }, [])

  // ---- the day -------------------------------------------------------------

  const locked = status === 'match'
  const isToday = dayOff === 0
  /** Only today has a file behind it; other days show a bare table. */
  const hasData = isToday
  const day = useMemo(() => new Date(BASE_DAY.y, BASE_DAY.m, BASE_DAY.d + dayOff), [dayOff])

  const goDay = (delta: number) => {
    setDayOff((v) => v + delta)
    setSel({})
    setSel2({})
  }

  /** A locked day refuses every edit, and says why. */
  const guard = (): boolean => {
    if (!locked) return false
    toastMsg('Day locked - move the status off Match to reopen')
    return true
  }

  const unpaidN = Object.values(marks).filter((m) => m === 'unpaid').length

  /**
   * How many routes a type ran.
   *
   * The fed row is the rescue table's Unpaid count and is never typed. A typed
   * override wins over the file. Otherwise the file's allocation less what was
   * cancelled and dropped - and a type with no Amazon name has no file row, so
   * it has no answer at all.
   */
  const ranOf = useCallback(
    (t: ServiceType): number | null => {
      if (t.fed) return unpaidN
      if (manual[t.id] !== undefined) return manual[t.id]
      if (t.amz) {
        const f = file[t.id]
        return f ? f.a - f.c - f.d : null
      }
      return null
    },
    [unpaidN, manual, file],
  )

  const rows: TypeRow[] = useMemo(
    () => types.map((t) => ({ t, f: hasData ? (file[t.id] ?? null) : null, ran: hasData ? ranOf(t) : null })),
    [types, hasData, file, ranOf],
  )

  const totRan = rows.reduce((a, r) => a + (r.ran ?? 0), 0)
  const routeHrs = rows.reduce((a, r) => a + (r.ran ?? 0) * r.t.hrs, 0)
  const totA = rows.reduce((a, r) => a + (r.f ? r.f.a : 0), 0)
  const totC = rows.reduce((a, r) => a + (r.f ? r.f.c : 0), 0)
  const totD = rows.reduce((a, r) => a + (r.f ? r.f.d : 0), 0)
  const totDel = rows.reduce((a, r) => a + (r.f ? r.f.del : 0), 0)
  const amzRan = rows.filter((r) => r.t.paid === 'Amazon').reduce((a, r) => a + (r.ran ?? 0), 0)

  const assignedResc = resc.filter((x) => x.assigned)
  const notMarked = assignedResc.filter((x) => !marks[x.id]).length
  const expected = LAUNCHED + unpaidN
  const gap = expected - totRan

  const selIds = Object.keys(sel).filter((k) => sel[k])
  const sel2Ids = Object.keys(sel2).filter((k) => sel2[k])

  const needle = q.trim().toLowerCase()
  const visRows = rows.filter((r) => !needle || r.t.name.toLowerCase().includes(needle))

  // ---- actions -------------------------------------------------------------

  /** Marking only bites on an assigned rescue: nothing else ran. */
  const setMark = (ids: string[], mark: Mark | null) => {
    if (guard()) return
    const next = { ...marks }
    ids.forEach((id) => {
      const x = resc.find((y) => y.id === id)
      if (!x || !x.assigned) return
      if (mark === null) delete next[id]
      else next[id] = mark
    })
    setMarks(next)
    setMenu(null)
    setSel2({})
    toastMsg(
      mark === 'unpaid'
        ? 'Marked unpaid - the fed row, route-hrs and both check sides moved together'
        : mark === 'paid'
          ? 'Marked paid - costs nothing, counts nowhere'
          : 'Back to not marked',
    )
  }

  const startEdit = (list: string, id: string, v0: string | number) => {
    if (locked) {
      toastMsg('Day locked - move the status off Match to reopen')
      return
    }
    setEdit({ list, id })
    setEditVal(v0 === '' ? '' : String(v0))
  }

  /**
   * Write the cell back. Each field parses its own way, and a value that will
   * not parse leaves the row as it was rather than writing a zero.
   */
  const commitEdit = () => {
    if (!edit) return
    const v = editVal.trim()
    const { list, id } = edit

    if (list === 'xrt' || list === 'xwh' || list === 'xto') {
      setResc((cur) =>
        cur.map((x) => {
          if (x.id !== id) return x
          if (list === 'xrt') return { ...x, route: v.toUpperCase() }
          if (list === 'xwh') return { ...x, where: v || '-' }
          const p = parseInt(v.replace(/[^0-9]/g, ''), 10)
          return { ...x, totes: v === '' || isNaN(p) ? null : p }
        }),
      )
      setEdit(null)
      return
    }

    if (list === 'hrs') {
      const n = parseFloat(v)
      if (v === '' || isNaN(n) || n <= 0) { setEdit(null); return }
      const me = types.find((x) => x.id === id)!
      // Service type + hours is the key; two rows cannot share one.
      if (types.some((x) => x.id !== id && x.name.trim().toLowerCase() === me.name.trim().toLowerCase() && x.hrs === n)) {
        setEdit(null)
        toastMsg(`Service type + hours must be unique - another type already holds ${me.name} · ${n}`)
        return
      }
      setTypes((cur) => cur.map((x) => (x.id === id ? { ...x, hrs: n } : x)))
      setEdit(null)
      return
    }

    if (list === 'fa' || list === 'fc' || list === 'fd' || list === 'fdel') {
      const n = parseInt(v.replace(/[^0-9]/g, ''), 10)
      if (v === '' || isNaN(n)) { setEdit(null); return }
      const key = ({ fa: 'a', fc: 'c', fd: 'd', fdel: 'del' } as const)[list]
      setFile((cur) => ({ ...cur, [id]: { ...{ a: 0, c: 0, d: 0, del: 0 }, ...cur[id], [key]: n } }))
      setEdit(null)
      return
    }

    if (list === 'ran') {
      setManual((cur) => {
        const next = { ...cur }
        if (v === '') delete next[id]
        else next[id] = parseInt(v, 10) || 0
        return next
      })
      setEdit(null)
      return
    }

    if (list === 'tn' || list === 'rn') {
      const write = list === 'tn' ? setTypeNotes : setRescNotes
      write((cur) => {
        const next = { ...cur }
        if (v === '') delete next[id]
        else next[id] = { txt: v, who: ME, when: STAMP_TIME }
        return next
      })
      setEdit(null)
    }
  }

  /** Save the dialog. `again` clears it for the next one instead of closing. */
  const saveType = (again: boolean) => {
    if (!form) return
    const f = form
    if (!f.name.trim()) { toastMsg('Name the service type first'); return }
    if (types.some((t) => t.id !== f.id && t.name.trim().toLowerCase() === f.name.trim().toLowerCase() && t.hrs === f.hrs)) {
      toastMsg(`Service type + hours must be unique - another type already holds ${f.name.trim()} · ${f.hrs}`)
      return
    }
    // Only a type with no Amazon name can take the rescue feed, and only one
    // row can hold it - assigning it takes it off whoever had it.
    const fed = !f.amz && f.counts === 'fed'
    if (fed && types.some((t) => t.fed && t.id !== f.id)) {
      toastMsg(`The rescue feed moved to ${f.name.trim()} - one fed type at a time`)
    }
    const blank: TypeForm = { id: null, name: '', hrs: f.hrs, other: '', paid: 'Amazon', amz: '', veh: [], counts: 'typed' }

    if (f.id) {
      setTypes((cur) =>
        cur.map((t) =>
          t.id === f.id
            ? { id: t.id, name: f.name.trim(), hrs: f.hrs, paid: f.paid, amz: f.amz.trim(), veh: f.veh, fed }
            : fed ? { ...t, fed: false } : t,
        ),
      )
      setForm(again ? blank : null)
      toastMsg(`${f.name.trim()} saved - unlocked days re-derive, locked days keep the values they froze with`)
      return
    }

    const t: ServiceType = {
      id: `t${Date.now()}`, name: f.name.trim(), hrs: f.hrs, paid: f.paid,
      amz: f.amz.trim(), veh: f.veh, fed,
    }
    setTypes((cur) => (fed ? cur.map((x) => ({ ...x, fed: false })) : cur).concat([t]))
    setForm(again ? blank : null)
    toastMsg(
      `${f.name.trim()} · ${f.hrs} hr added - its row appears from today forward and the stored week re-matches` +
        (f.veh.length === 0 ? ' · no allowed vehicle types, so auto-assign leaves its band’s vans blank' : ''),
    )
  }

  const blankForm = (over: Partial<TypeForm> = {}): TypeForm => ({
    id: null, name: '', hrs: 10, other: '', paid: 'Amazon', amz: '', veh: [], counts: 'typed', ...over,
  })

  return {
    dayOff, isToday, hasData, day, dateLabel: dateLabel(day), goDay,
    status, setStatus, statusStamp, setStatusStamp, locked, guard,
    sel, setSel, selIds, sel2, setSel2, sel2Ids, q, setQ,
    menu, setMenu, openMenu, menuW, menuQ, setMenuQ,
    toast, toastMsg, undo, clearToast,
    edit, setEdit, editVal, setEditVal, startEdit, commitEdit,
    types, setTypes, file, manual, typeNotes, rescNotes, marks, setMark, resc, setResc,
    typeSort, setTypeSort, rescSort, setRescSort,
    form, setForm, saveType, blankForm,
    rows, visRows, totRan, routeHrs, totA, totC, totD, totDel, amzRan,
    unpaidN, notMarked, expected, gap,
  }
}

export type WorkSummaryState = ReturnType<typeof useWorkSummary>
