'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useUndoToast } from '../../ds/hooks'
import {
  DAS, DEPTS, EXCLUDED, MAX_WEEK, MIN_WEEK,
  SEED_AUDIT, SEED_EXPORT_LOG, SEED_NEEDS, SEED_OVERRIDES, SEED_SHIFTS,
} from './data'
import type { AuditRow, Da, Dept, Exclusion, ExportLogRow, Override, Shift } from './data'
import { ANCHOR_WEEK, dateOf, fmtT } from './date'
import type { Ctx, Override_ } from './rules'
import { availOf, check, deptOf, lenOf, rankMap, shiftAt, startOf, violations, weekHours } from './rules'

export type DialogKind =
  | 'add' | 'shift' | 'swap' | 'swapConfirm' | 'reason' | 'viol'
  | 'need' | 'depts' | 'copy' | 'clear' | 'stats' | 'export'

/** Everything a dialog needs, in one loose bag - each one reads its own keys. */
export type Form = Record<string, unknown>

/** What is being dragged: a bare need from the pool, or an existing shift. */
export interface Drag {
  dept: string
  day?: number
  shift?: Shift
  fromDa?: string
  fromDay?: number
}

export function useSchedule() {
  const [week, setWeek] = useState(ANCHOR_WEEK)
  const [depts, setDepts] = useState<Dept[]>(DEPTS)
  const [das] = useState<Da[]>(DAS)
  const [excluded] = useState<Exclusion[]>(EXCLUDED)
  const [shiftsByWeek, setShiftsByWeek] = useState<Record<number, Shift[]>>(SEED_SHIFTS)
  const [overridesByWeek] = useState<Record<number, Record<string, Record<number, Override>>>>(SEED_OVERRIDES)
  const [needsByWeek, setNeedsByWeek] = useState<Record<number, Record<string, number[]>>>(SEED_NEEDS)
  const [softOverrides, setSoftOverrides] = useState<Override_[]>([])
  const [exportLog, setExportLog] = useState<ExportLogRow[]>(SEED_EXPORT_LOG)
  const [audit, setAudit] = useState<AuditRow[]>(SEED_AUDIT)

  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'Rank' | 'Name' | 'Hours'>('Rank')
  const [drop, setDrop] = useState<string | null>(null)
  const [poolOpen, setPoolOpen] = useState(true)
  const [calMonth, setCalMonth] = useState<number | null>(null)
  const [calMenu, setCalMenu] = useState<'month' | 'year' | null>(null)

  // Filters - the drawer edits a draft and only writes it back on Apply.
  const [fIssue, setFIssue] = useState<string | null>(null)
  const [fViol, setFViol] = useState(false)
  const [fNoShift, setFNoShift] = useState(false)
  const [fExcluded, setFExcluded] = useState('All')
  const [fpOpen, setFpOpen] = useState(false)
  const [fpQuery, setFpQuery] = useState('')
  const [fpDraft, setFpDraft] = useState<{ fViol: boolean; fNoShift: boolean; fExcluded: string } | null>(null)
  const [fpClosed, setFpClosed] = useState<string[]>([])

  const [dlg, setDlg] = useState<DialogKind | null>(null)
  const [form, setForm] = useState<Form>({})
  const [drag, setDrag] = useState<Drag | null>(null)
  const [dragHover, setDragHover] = useState<{ da: string; day: number } | null>(null)

  // The flag rides along as the toast's payload, so an Undo can never outlive
  // the line that offered it.
  const { toast, undoable: toastUndo, toastMsg: rawToast, clear: clearToast } = useUndoToast<true>(3400)
  const toastMsg = useCallback((text: string, undoable = false) => {
    rawToast(text, undoable || null)
  }, [rawToast])
  const undoSnap = useRef<{ shifts: Record<number, Shift[]>; overrides: Override_[] } | null>(null)

  const log = useCallback((action: string, detail: string) => {
    setAudit((a) => [{ when: 'Just now', who: 'You', action, detail }, ...a])
  }, [])

  /** One level of undo, taken before every destructive act. */
  const snap = useCallback(() => {
    undoSnap.current = {
      shifts: JSON.parse(JSON.stringify(shiftsByWeek)),
      overrides: JSON.parse(JSON.stringify(softOverrides)),
    }
  }, [shiftsByWeek, softOverrides])

  const undo = useCallback(() => {
    if (!undoSnap.current) return
    setShiftsByWeek(undoSnap.current.shifts)
    setSoftOverrides(undoSnap.current.overrides)
    undoSnap.current = null
    clearToast()
  }, [clearToast])

  const shifts = useMemo(() => shiftsByWeek[week] ?? [], [shiftsByWeek, week])
  const needs = needsByWeek[week] ?? null
  // Memoised so the empty-object fallback does not hand `ctx` a fresh identity
  // on every render and re-run every derived value below it.
  const overrides = useMemo(() => overridesByWeek[week] ?? {}, [overridesByWeek, week])

  const ctx: Ctx = useMemo(
    () => ({ das, depts, excluded, shifts, overrides }),
    [das, depts, excluded, shifts, overrides],
  )

  const viol = useMemo(() => violations(ctx, softOverrides, fmtT), [ctx, softOverrides])
  const ranks = useMemo(() => rankMap(das), [das])

  const filled = useCallback(
    (deptId: string, day: number): number => shifts.filter((s) => s.dept === deptId && s.day === day).length,
    [shifts],
  )

  /** The roster rows, after sort, search and every filter. */
  const rows = useMemo(() => {
    let list = das.slice()
    if (sort === 'Rank') list.sort((a, b) => ranks[a.id] - ranks[b.id])
    if (sort === 'Name') list.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'Hours') list.sort((a, b) => weekHours(ctx, b.id) - weekHours(ctx, a.id))
    if (q) list = list.filter((d) => `${d.name} ${d.tid}`.toLowerCase().includes(q.toLowerCase()))
    const all = [...viol.hard, ...viol.soft]
    if (fViol) list = list.filter((d) => all.some((v) => v.da === d.id))
    if (fIssue) list = list.filter((d) => all.some((v) => v.da === d.id && v.rule === fIssue))
    if (fNoShift) list = list.filter((d) => weekHours(ctx, d.id) > 0)
    if (fExcluded === 'Excluded only') list = list.filter((d) => excluded.some((e) => e.da === d.id))
    if (fExcluded === 'Not excluded') list = list.filter((d) => !excluded.some((e) => e.da === d.id))
    return list
  }, [das, sort, ranks, ctx, q, viol, fViol, fIssue, fNoShift, fExcluded, excluded])

  // ── Mutations ─────────────────────────────────────────────────────────────

  const assign = useCallback((daId: string, day: number, deptId: string, extra: Partial<Shift> = {}) => {
    setShiftsByWeek((w) => {
      const next = { ...w, [week]: [...(w[week] ?? [])] }
      next[week].push({ da: daId, day, dept: deptId, manual: true, ...extra })
      return next
    })
  }, [week])

  const removeShift = useCallback((s: Shift) => {
    setShiftsByWeek((w) => ({ ...w, [week]: (w[week] ?? []).filter((v) => !(v.da === s.da && v.day === s.day)) }))
  }, [week])

  const moveShift = useCallback((s: Shift, toDa: string, toDay: number) => {
    setShiftsByWeek((w) => {
      const list = (w[week] ?? []).filter((v) => !(v.da === s.da && v.day === s.day))
      list.push({ da: toDa, day: toDay, dept: s.dept, manual: true, start: s.start, len: s.len })
      return { ...w, [week]: list }
    })
  }, [week])

  const swapShifts = useCallback((a: Shift, b: Shift) => {
    setShiftsByWeek((w) => {
      const list = (w[week] ?? []).map((v) => ({ ...v }))
      const s1 = list.find((v) => v.da === a.da && v.day === a.day)
      const s2 = list.find((v) => v.da === b.da && v.day === b.day)
      if (s1 && s2) {
        const tmp = s1.da
        s1.da = s2.da
        s2.da = tmp
        s1.manual = true
        s2.manual = true
      }
      return { ...w, [week]: list }
    })
  }, [week])

  const reassign = useCallback((s: Shift, toDa: string) => {
    setShiftsByWeek((w) => ({
      ...w,
      [week]: (w[week] ?? []).map((v) => (v.da === s.da && v.day === s.day ? { ...v, da: toDa, manual: true } : v)),
    }))
  }, [week])

  const setNeed = useCallback((deptId: string, day: number, value: number) => {
    setNeedsByWeek((n) => {
      const next = JSON.parse(JSON.stringify(n)) as Record<number, Record<string, number[]>>
      next[week][deptId][day] = value
      return next
    })
  }, [week])

  const clearWeek = useCallback(() => {
    setShiftsByWeek((w) => {
      const next = { ...w }
      delete next[week]
      return next
    })
  }, [week])

  // ── Dialogs ───────────────────────────────────────────────────────────────

  const openDlg = useCallback((kind: DialogKind, f: Form = {}) => {
    setDlg(kind)
    setForm(f)
    setDrop(null)
  }, [])
  const closeDlg = useCallback(() => setDlg(null), [])
  const setF = useCallback((k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v })), [])

  const openAdd = useCallback((daId: string | null, day: number | null) => {
    openDlg('add', { da: daId, day, dept: 'DOT', daQ: '', reason: '', editing: null, note: '' })
  }, [openDlg])

  const openReason = useCallback((title: string, softLines: string[], commit: (reason: string) => void) => {
    openDlg('reason', { title, softLines, commit, reason: '' })
  }, [openDlg])

  const openExport = useCallback((logFirst: boolean) => {
    openDlg('export', {
      preset: 'Paycom', format: 'CSV', range: 'This week',
      pto: true, scores: false, unfilled: false, confirmHard: false,
      logFirst, fname: null,
    })
  }, [openDlg])

  // ── Drop handling ─────────────────────────────────────────────────────────

  const handleDrop = useCallback((daId: string, day: number) => {
    const d = drag
    setDrag(null)
    setDragHover(null)
    if (!d) return

    const target = shiftAt(ctx, daId, day)

    if (d.shift) {
      if (d.fromDa === daId && d.fromDay === day) return
      // Two shifts meeting is a swap, and a swap needs both halves checked.
      if (target) { openDlg('swapConfirm', { a: d.shift, b: target }); return }
      const chk = check(ctx, daId, day, d.shift.dept, d.shift)
      if (!chk.ok) { toastMsg(`Refused - ${chk.hard[0]}`); return }
      const commit = (reason?: string) => {
        snap()
        moveShift(d.shift as Shift, daId, day)
        setDlg(null)
        log('Move', `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.fromDay as number]} ${d.shift?.dept} · ${ctx.das.find((x) => x.id === d.fromDa)?.name} to ${ctx.das.find((x) => x.id === daId)?.name}${reason ? ` · ${reason}` : ''}`)
        toastMsg(`Moved to ${ctx.das.find((x) => x.id === daId)?.name} · ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}`, true)
      }
      if (chk.soft.length) openReason('Move with a warning', chk.soft, commit)
      else commit()
      return
    }

    const chk = check(ctx, daId, day, d.dept, null)
    if (!chk.ok) { toastMsg(`Refused - ${chk.hard[0]}`); return }
    const commit = (reason?: string) => {
      snap()
      assign(daId, day, d.dept)
      setDlg(null)
      log('Assign', `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]} ${d.dept} · ${ctx.das.find((x) => x.id === daId)?.name}${reason ? ` · ${reason}` : ''}`)
      toastMsg(`Assigned ${ctx.das.find((x) => x.id === daId)?.name} · ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]} ${deptOf(ctx, d.dept).code}`, true)
    }
    if (chk.soft.length) openReason('Assign with a warning', chk.soft, commit)
    else commit()
  }, [drag, ctx, openDlg, toastMsg, snap, moveShift, log, openReason, assign])

  const clearFilters = useCallback(() => {
    setQ('')
    setFViol(false)
    setFNoShift(false)
    setFExcluded('All')
    setFIssue(null)
  }, [])

  const filtersApplied = fViol || fNoShift || fExcluded !== 'All'

  return {
    week, setWeek, weekPrev: () => setWeek((w) => Math.max(MIN_WEEK, w - 1)), weekNext: () => setWeek((w) => Math.min(MAX_WEEK, w + 1)),
    depts, setDepts, das, excluded, shifts, needs, overrides, ctx, viol, ranks, filled, rows,
    shiftsByWeek, needsByWeek, softOverrides, setSoftOverrides, exportLog, setExportLog, audit,
    hasDraft: shifts.length > 0,
    q, setQ, sort, setSort, drop, setDrop, poolOpen, setPoolOpen,
    calMonth, setCalMonth, calMenu, setCalMenu,
    fIssue, setFIssue, fViol, setFViol, fNoShift, setFNoShift, fExcluded, setFExcluded,
    fpOpen, setFpOpen, fpQuery, setFpQuery, fpDraft, setFpDraft, fpClosed, setFpClosed, filtersApplied,
    clearFilters,
    dlg, form, openDlg, closeDlg, setF, openAdd, openReason, openExport,
    drag, setDrag, dragHover, setDragHover, handleDrop,
    assign, removeShift, moveShift, swapShifts, reassign, setNeed, clearWeek,
    snap, undo, log, toast, toastUndo, toastMsg,
    // Re-exported so the views do not each have to thread `ctx` through.
    availOf: (da: string, day: number) => availOf(ctx, da, day),
    shiftAt: (da: string, day: number) => shiftAt(ctx, da, day),
    weekHours: (da: string) => weekHours(ctx, da),
    lenOf: (s: Shift) => lenOf(ctx, s),
    startOf: (s: Shift) => startOf(ctx, s),
    deptOf: (id: string) => deptOf(ctx, id),
    daOf: (id: string) => das.find((d) => d.id === id) as Da,
    exclusionOf: (id: string) => excluded.find((e) => e.da === id) ?? null,
    check: (da: string, day: number, dept: string, ignore?: Shift | null) => check(ctx, da, day, dept, ignore),
    dateOf,
  }
}

export type SchedState = ReturnType<typeof useSchedule>
