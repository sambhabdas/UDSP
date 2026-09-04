'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast, clampLeft } from '../../ds/hooks'
import {
  ADD_POOL,
  BASE_DAY,
  DEFAULT_GRACE,
  DEFAULT_LEAD,
  LUNCH_BODY,
  NOW,
  PEOPLE,
  PUNCH_BODY,
  SEED_REMINDED,
  WORK_TYPES,
} from './data'
import type { FillKey, Person, TileKey, WarnKey, Work } from './data'
import { dateLabel, evalRow, onARoute, onClock, remindable, severity } from './calc'
import { fmt } from './calc'

export type Tab = 'board' | 'setup'

export type BoardFilter = { t: 'chip'; k: WarnKey } | { t: 'tile'; k: TileKey }

export type SortKey = 'name' | 'in' | 'sched' | 'work' | 'ls' | 'le'

export interface MenuState {
  kind: 'assign' | 'assignRow' | 'addrow' | 'export'
  extra?: string
  w: number
  x: number
  y: number
  /** Where the inline search sits - over the control that opened the menu. */
  tx: number
  ty: number
  tw: number
  th: number
}

export interface ImportState {
  file: string | null
  fills: Record<FillKey, boolean>
}

export function useCompliance() {
  const [tab, setTab] = useState<Tab>('board')
  const [dayOff, setDayOff] = useState(0)
  const [filter, setFilter] = useState<BoardFilter | null>(null)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [sortC, setSortC] = useState<{ k: SortKey; dir: 1 | -1 } | null>(null)
  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuQ, setMenuQ] = useState('')
  // Compliance holds its line longest - its messages carry a reason.
  const { toast, toastMsg } = useToast(5000)

  const [autoOn, setAutoOn] = useState(true)
  const [lead, setLead] = useState(DEFAULT_LEAD)
  const [grace, setGrace] = useState(DEFAULT_GRACE)
  const [leadDraft, setLeadDraft] = useState(String(DEFAULT_LEAD))
  const [graceDraft, setGraceDraft] = useState(String(DEFAULT_GRACE))

  const [workTypes, setWorkTypes] = useState(WORK_TYPES)
  const [assigned, setAssigned] = useState<Record<string, Work | 'none'>>({})
  const [added, setAdded] = useState<Person[]>([])
  const [reminded, setReminded] = useState(SEED_REMINDED)

  const [lunchBodySaved, setLunchBodySaved] = useState(LUNCH_BODY)
  const [punchBodySaved, setPunchBodySaved] = useState(PUNCH_BODY)
  const [lunchDraft, setLunchDraft] = useState<string | null>(null)
  const [punchDraft, setPunchDraft] = useState<string | null>(null)
  const [mtSel, setMtSel] = useState(0)

  const [imp, setImp] = useState<ImportState | null>(null)


  // A click anywhere outside a popover closes the menu.
  useEffect(() => {
    if (!menu) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-pop]')) setMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  const openMenu = useCallback((e: React.MouseEvent, kind: MenuState['kind'], extra?: string) => {
    e.stopPropagation()
    const rc = e.currentTarget.getBoundingClientRect()
    // The three pickers get a search field sized to the control they came from;
    // Export is a plain list.
    const searchable = kind !== 'export'
    const w = searchable ? Math.max(Math.round(rc.width), 240) : 240
    const x = clampLeft(rc.left, w)
    setMenu({
      kind, extra, w, x, y: rc.bottom + 4,
      tx: searchable ? x : rc.left,
      ty: rc.top,
      tw: searchable ? w : Math.max(Math.round(rc.width), 160),
      th: Math.max(Math.round(rc.height), 28),
    })
    setMenuQ('')
  }, [])

  // ---- the day ------------------------------------------------------------

  const isToday = dayOff === 0
  const day = useMemo(() => new Date(BASE_DAY.y, BASE_DAY.m, BASE_DAY.d + dayOff), [dayOff])

  const goDay = (delta: number) => {
    setDayOff((v) => v + delta)
    setFilter(null)
    setSel({})
  }

  // Only today has punches. Other days show the empty state rather than
  // claiming a score for a day that has not happened.
  const people = useMemo(() => (isToday ? [...PEOPLE, ...added] : []), [isToday, added])

  const evald = useMemo(
    () => people.map((p) => evalRow(p, { grace, lead, assigned })),
    [people, grace, lead, assigned],
  )

  const toggleFilter = (f: BoardFilter) => {
    setFilter((cur) => (JSON.stringify(cur) === JSON.stringify(f) ? null : f))
    setSel({})
  }

  const vis = useMemo(() => {
    const pass = (x: (typeof evald)[number]): boolean => {
      if (!filter) return true
      if (filter.t === 'chip') return x.warns.includes(filter.k)
      const inNow = onClock(x.p)
      switch (filter.k) {
        case 'routes': return onARoute(x.work)
        case 'in': return inNow
        case 'onroutes': return inNow && onARoute(x.work)
        case 'rescues': return inNow && !!x.work && x.work.kind === 'rescue' && !x.work.left
        case 'ops': return inNow && !!x.work && (x.work.kind === 'ops' || x.work.kind === 'training') && !x.work.left
        case 'standby': return inNow && !!x.work && x.work.kind === 'standby' && !x.work.left
        case 'lunches': return inNow && x.p.ls === null
      }
    }
    const needle = q.trim().toLowerCase()
    const list = evald.filter(
      (x) =>
        pass(x) &&
        (!needle ||
          x.p.name.toLowerCase().includes(needle) ||
          (!!x.work && x.work.label.toLowerCase().includes(needle))),
    )
    list.sort((a, b) => severity(a) - severity(b))
    if (sortC) {
      const val = (x: (typeof evald)[number]): string | number => {
        switch (sortC.k) {
          case 'name': return x.p.name.toLowerCase()
          case 'in': return x.p.inP ?? 9999
          case 'sched': return x.p.sched ?? 9999
          case 'work': return x.work ? x.work.label.toLowerCase() : '￿'
          case 'ls': return x.p.ls ?? 9999
          case 'le': return x.p.le ?? 9999
        }
      }
      list.sort((a, b) => {
        const va = val(a)
        const vb = val(b)
        return (va < vb ? -1 : va > vb ? 1 : 0) * sortC.dir
      })
    }
    return list
  }, [evald, filter, q, sortC])

  const selIds = useMemo(() => Object.keys(sel).filter((k) => sel[k]), [sel])
  /** Selection if there is one, otherwise everything on screen. */
  const targets = selIds.length ? vis.filter((x) => sel[x.p.id]) : vis
  const remindables = targets.filter(remindable)

  const doRemind = (list: typeof vis) => {
    if (!list.length) { toastMsg('Nobody remindable in the target'); return }
    const next = { ...reminded }
    list.forEach((x) => { next[x.p.id] = { at: fmt(NOW), mode: 'manual' } })
    setReminded(next)
    toastMsg(
      `${list.length} reminder${list.length > 1 ? 's' : ''} sent - each row got the template it needs, logged to the Inbox timeline`,
    )
  }

  // ---- work assignment ----------------------------------------------------

  /** Which rows a menu action lands on: one row, the selection, or the board. */
  const menuTargets = (wholeBoardFallback: boolean): string[] => {
    if (menu?.kind === 'assignRow' && menu.extra) return [menu.extra]
    if (selIds.length) return selIds
    return wholeBoardFallback ? targets.map((x) => x.p.id) : []
  }

  const assignWork = (label: string, kind: Work['kind'], ids: string[]) => {
    const next = { ...assigned }
    ids.forEach((id) => { next[id] = { kind, label, set: fmt(NOW), left: null } })
    setAssigned(next)
    setMenu(null)
  }

  const endWork = (ids: string[]) => {
    const next = { ...assigned }
    ids.forEach((id) => {
      const override = next[id]
      const cur = override && override !== 'none' ? override : people.find((p) => p.id === id)?.work
      if (cur) next[id] = { ...cur, left: fmt(NOW) }
    })
    setAssigned(next)
    setMenu(null)
    toastMsg(`Work ended - left ${fmt(NOW)} written on ${ids.length} rows`)
  }

  const clearWork = (ids: string[]) => {
    const next = { ...assigned }
    ids.forEach((id) => { next[id] = 'none' })
    setAssigned(next)
    setMenu(null)
    toastMsg(`Work cleared on ${ids.length}${ids.length === 1 ? ' row' : ' rows'} - the seat is blank again`)
  }

  const addRow = (name: string) => {
    setAdded((list) => [
      ...list,
      { id: `a${Date.now()}`, name, sched: null, inP: null, out: null, ls: null, le: null, work: null, hasRow: false, phone: true },
    ])
    setMenu(null)
    toastMsg(`${name} added to the board - punches land on the row from the next import`)
  }

  const addWorkType = (label: string, ids: string[]) => {
    setWorkTypes((list) => [...list, label])
    assignWork(label, 'custom', ids)
    setMenuQ('')
    toastMsg(`${label} added to the work list and assigned to ${ids.length}`)
  }

  // ---- message setup ------------------------------------------------------

  const lunchBody = lunchDraft ?? lunchBodySaved
  const punchBody = punchDraft ?? punchBodySaved
  const body = mtSel === 0 ? lunchBody : punchBody
  const setBody = (v: string) => (mtSel === 0 ? setLunchDraft(v) : setPunchDraft(v))

  const discard = () => {
    setLunchDraft(null)
    setPunchDraft(null)
    setLeadDraft(String(lead))
    setGraceDraft(String(grace))
    toastMsg('Changes discarded')
  }

  const save = () => {
    // The drafts are free text; the saved values are clamped to what the
    // scheduler can actually act on.
    const nextLead = Math.min(120, Math.max(5, parseInt(leadDraft, 10) || DEFAULT_LEAD))
    const nextGrace = Math.min(60, Math.max(0, parseInt(graceDraft, 10) || DEFAULT_GRACE))
    setLead(nextLead)
    setGrace(nextGrace)
    setLeadDraft(String(nextLead))
    setGraceDraft(String(nextGrace))
    setLunchBodySaved(lunchBody)
    setPunchBodySaved(punchBody)
    setLunchDraft(null)
    setPunchDraft(null)
    toastMsg('Saved - the grace moves both the auto send and the late threshold')
  }

  return {
    tab, setTab,
    dayOff, isToday, day, dateLabel: dateLabel(day), goDay,
    filter, toggleFilter, q, setQ,
    sel, setSel, selIds, sortC, setSortC,
    menu, setMenu, openMenu, menuQ, setMenuQ,
    toast, toastMsg,
    autoOn, setAutoOn, lead, grace,
    leadDraft, setLeadDraft, graceDraft, setGraceDraft,
    workTypes, assigned, added, reminded,
    people, evald, vis, targets, remindables, doRemind,
    menuTargets, assignWork, endWork, clearWork, addRow, addWorkType, addPool: ADD_POOL,
    imp, setImp,
    mtSel, setMtSel, lunchBody, punchBody, lunchBodySaved, punchBodySaved,
    lunchDraft, punchDraft, body, setBody, discard, save,
  }
}

export type ComplianceState = ReturnType<typeof useCompliance>
