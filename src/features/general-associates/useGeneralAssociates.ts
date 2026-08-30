'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast, anchorAt } from '../../ds/hooks'
import { DAS, FILTER_SECTIONS, coachingOf } from './data'
import type { Da, FilterKey } from './data'
import { searchText, tierOf } from './calc'

export type View = 'dir' | 'profile'
export type Tab = 'overview' | 'schedule' | 'performance' | 'dispatch' | 'timecard' | 'docs'
export type SortKey = 'name' | 'pos' | 'next' | 'hours' | 'net' | 'elig' | 'att' | 'ten'
export type MenuKind = 'export' | 'row' | 'hdrMore'
export type DialogKind = 'da' | 'coach' | 'excl'

export interface Sort {
  k: SortKey
  /** 1 ascending, -1 descending. A third click clears the sort entirely. */
  dir: 1 | -1
}

/** The four axes, applied together. `status` is one-of; the rest are any-of. */
export interface Filters {
  status: string
  quals: string[]
  veh: string[]
  flags: string[]
}

const NO_FILTERS: Filters = { status: 'Active', quals: [], veh: [], flags: [] }

/** The floating menu is anchored in viewport coordinates, like the design. */
export interface MenuAt {
  kind: MenuKind
  /** For a row menu, whose row it was. */
  extra: string | null
  x: number
  y: number
  w: number
}

/** The Add / Edit Associate form. `id` null means this is a new record. */
export interface DaForm {
  id: string | null
  tr: string
  nm: string
  ee: string
  ph: string
  em: string
  adp: string
  rate: string
  ot: string
  quals: string[]
  veh: string[]
}

export interface CoachForm {
  module: string | null
  due: string
  block: boolean
  q: string
}

export interface ExclForm {
  reason: string
  until: string
  note: string
}

const TOAST_MS = 5000

export function useGeneralAssociates() {
  const [view, setView] = useState<View>('dir')
  const [daId, setDaId] = useState<string | null>(null)
  /** The row the directory tints blue — the one most recently opened. */
  const [lastOpened, setLastOpened] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort | null>(null)

  // `applied` is what the directory filters on; `draft` is what the drawer is
  // editing. Cancel throws the draft away, which is the whole point of two.
  const [applied, setApplied] = useState<Filters>(NO_FILTERS)
  const [draft, setDraft] = useState<Filters | null>(null)
  const [openSections, setOpenSections] = useState<Record<FilterKey, boolean>>({
    status: true,
    quals: true,
    veh: true,
    flags: true,
  })

  const [menu, setMenu] = useState<MenuAt | null>(null)
  const [dlg, setDlg] = useState<DialogKind | null>(null)
  const [form, setForm] = useState<DaForm | null>(null)
  const [coachForm, setCoachForm] = useState<CoachForm | null>(null)
  const [exclForm, setExclForm] = useState<ExclForm | null>(null)
  /** Reminders are keyed by DA + module, and remember the time they went. */
  const [reminded, setReminded] = useState<Record<string, string>>({})

  const { toast, toastMsg } = useToast(TOAST_MS)

  // The menu closes on any mousedown outside it. Buttons that open one carry
  // data-pop so their own click does not immediately close what it opened.
  useEffect(() => {
    if (!menu) return
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-pop]')) setMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  /** Whoever is open. With nobody chosen the first record stands in. */
  const cur: Da = useMemo(() => DAS.find((d) => d.id === daId) ?? DAS[0], [daId])

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const f = applied
    const passes = (d: Da): boolean => {
      if (f.status === 'Active' && d.status !== 'active') return false
      if (f.status === 'Inactive' && d.status !== 'inactive') return false
      if (f.quals.length && !f.quals.some((x) => d.quals.includes(x))) return false
      if (f.veh.length && !f.veh.some((x) => (x === 'None' ? d.veh.length === 0 : d.veh.includes(x)))) return false
      if (f.flags.includes('Blocked') && !d.blocked) return false
      if (f.flags.includes('At Risk') && tierOf(d.net).label !== 'At Risk') return false
      if (f.flags.includes('Excluded') && !d.excluded) return false
      if (f.flags.includes('Awaiting Ack') && !d.awaitingAck) return false
      if (needle && !searchText(d).includes(needle)) return false
      return true
    }

    const vis = DAS.filter(passes)
    if (!sort) return vis.sort((a, b) => (a.name < b.name ? -1 : 1))

    const value = (d: Da): string | number => {
      switch (sort.k) {
        case 'name': return d.name.toLowerCase()
        // A DA with no next shift sorts last, whichever way the column points.
        case 'next': return d.next === '-' ? '￿' : d.next
        case 'pos': return d.quals.join(',')
        case 'hours': return d.hoursPP
        case 'net': return d.net
        case 'elig': return d.blocked ? 1 : 0
        case 'att': return d.abs
        case 'ten': return d.tenure
      }
    }
    return vis.sort((a, b) => {
      const va = value(a)
      const vb = value(b)
      return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir
    })
  }, [applied, q, sort])

  /** asc → desc → off. The third click drops back to the name order. */
  const onSort = useCallback((k: SortKey) => {
    setSort((s) => (s && s.k === k ? (s.dir === 1 ? { k, dir: -1 } : null) : { k, dir: 1 }))
  }, [])

  const openMenu = useCallback((e: React.MouseEvent, kind: MenuKind, extra: string | null = null, w = 240) => {
    e.stopPropagation()
    setMenu({ kind, extra, ...anchorAt(e, w) })
  }, [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const openProfile = useCallback((d: Da, to: Tab = 'overview') => {
    setView('profile')
    setDaId(d.id)
    setLastOpened(d.id)
    setTab(to)
    setMenu(null)
  }, [])

  /** Point the profile-shaped state at a DA without leaving the roster — the
   *  row menu's Assign Coaching and Exclude both act on a record in place. */
  const focusDa = useCallback((id: string) => setDaId(id), [])

  const goBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setView('dir')
  }, [])

  const filterCount =
    (applied.status !== 'Active' ? 1 : 0) + applied.quals.length + applied.veh.length + applied.flags.length

  const openFilters = useCallback(() => {
    setDraft({
      status: applied.status,
      quals: [...applied.quals],
      veh: [...applied.veh],
      flags: [...applied.flags],
    })
  }, [applied])
  const closeFilters = useCallback(() => setDraft(null), [])
  const clearFilters = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDraft({ ...NO_FILTERS })
  }, [])
  const applyFilters = useCallback(() => {
    if (draft) setApplied(draft)
    setDraft(null)
    toastMsg('Filters applied')
  }, [draft, toastMsg])
  const toggleSection = useCallback((key: FilterKey) => {
    setOpenSections((o) => ({ ...o, [key]: !o[key] }))
  }, [])
  const pickFilter = useCallback((key: FilterKey, kind: 'radio' | 'multi', option: string) => {
    setDraft((d) => {
      if (!d) return d
      if (kind === 'radio') return { ...d, status: option }
      const arr = d[key] as string[]
      return { ...d, [key]: arr.includes(option) ? arr.filter((x) => x !== option) : [...arr, option] }
    })
  }, [])

  const closeDlg = useCallback(() => {
    setDlg(null)
    setForm(null)
    setCoachForm(null)
    setExclForm(null)
  }, [])

  /** Editing prefills from the record; the rate pair is not stored per DA. */
  const editDa = useCallback((d: Da) => {
    setForm({ id: d.id, tr: d.tr, nm: d.name, ee: d.ee, ph: d.phone, em: '', adp: '', rate: '$21.50', ot: '$32.25', quals: [...d.quals], veh: [...d.veh] })
    setDlg('da')
  }, [])
  const addDa = useCallback(() => {
    setForm({ id: null, tr: '', nm: '', ee: '', ph: '', em: '', adp: '', rate: '', ot: '', quals: [], veh: [] })
    setDlg('da')
  }, [])
  const patchForm = useCallback((patch: Partial<DaForm>) => {
    setForm((f) => (f ? { ...f, ...patch } : f))
  }, [])
  const saveDa = useCallback(() => {
    if (!form) return
    if (!form.tr.trim() || !form.nm.trim()) {
      toastMsg('Transporter ID and name are required')
      return
    }
    setDlg(null)
    setForm(null)
    toastMsg(form.id ? `${form.nm} saved` : `${form.nm} created`)
  }, [form, toastMsg])

  const openCoach = useCallback(() => {
    setCoachForm({ module: null, due: '7', block: true, q: '' })
    setDlg('coach')
  }, [])
  const patchCoach = useCallback((patch: Partial<CoachForm>) => {
    setCoachForm((c) => (c ? { ...c, ...patch } : c))
  }, [])
  const saveCoach = useCallback(() => {
    if (!coachForm) return
    if (!coachForm.module) {
      toastMsg('Pick a module first')
      return
    }
    const due = Math.max(1, parseInt(coachForm.due) || 7)
    setDlg(null)
    setCoachForm(null)
    toastMsg(
      `${coachForm.module} assigned to ${cur.name} · due in ${due} days` +
        (coachForm.block ? ' · blocks the shift when overdue' : ' · coaching-only'),
    )
  }, [coachForm, cur.name, toastMsg])

  const openExcl = useCallback(() => {
    setExclForm({ reason: 'Leave', until: '', note: '' })
    setDlg('excl')
  }, [])
  const patchExcl = useCallback((patch: Partial<ExclForm>) => {
    setExclForm((x) => (x ? { ...x, ...patch } : x))
  }, [])
  const saveExcl = useCallback(() => {
    if (!exclForm) return
    if (exclForm.reason === 'Other' && !exclForm.note.trim()) {
      toastMsg('A note is required when the reason is Other')
      return
    }
    setDlg(null)
    setExclForm(null)
    toastMsg(`${cur.name} excluded - ${exclForm.reason}${exclForm.until ? ` · until ${exclForm.until}` : ' · until removed'}`)
  }, [exclForm, cur.name, toastMsg])

  /** The header's Exclude button reinstates instead when one is in force. */
  const toggleExclude = useCallback(() => {
    if (cur.excluded) toastMsg(`${cur.name} reinstated`)
    else openExcl()
  }, [cur, openExcl, toastMsg])

  const remind = useCallback((module: string) => {
    setReminded((r) => ({ ...r, [cur.id + module]: '16:09' }))
    toastMsg('Reminder sent - logged to the Inbox timeline')
  }, [cur.id, toastMsg])

  const coaching = useMemo(() => coachingOf(cur.id), [cur.id])
  const openCoaching = useMemo(() => coaching.filter((c) => c.state !== 'Acknowledged'), [coaching])

  return {
    view, setView,
    cur, rows, lastOpened,
    tab, setTab,
    q, setQ,
    sort, onSort,
    filterCount, draft, openSections, openFilters, closeFilters, clearFilters, applyFilters, toggleSection, pickFilter,
    sections: FILTER_SECTIONS,
    menu, openMenu, closeMenu,
    openProfile, goBack, focusDa,
    dlg, form, editDa, addDa, patchForm, saveDa, closeDlg,
    coachForm, openCoach, patchCoach, saveCoach,
    exclForm, openExcl, patchExcl, saveExcl, toggleExclude,
    coaching, openCoaching, reminded, remind,
    toast, toastMsg,
  }
}

export type GaState = ReturnType<typeof useGeneralAssociates>
