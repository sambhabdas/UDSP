'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../ds/hooks'
import {
  MONTHS,
  MONTHS_FULL,
  SEED_BATCHES,
  SEED_EDITS,
  VEHICLES,
  seedCells,
  weeks,
} from './data'
import type { Batch, CellEdit, Cells, Status } from './data'
import { allWeeks, amazonFor, cell, incomplete, isLocked, money, vanNet } from './calc'

export type Tab = 'dash' | 'ins' | 'lease' | 'amz'

/** A cell address inside the grid, by row and column index. */
export interface Addr {
  r: number
  c: number
}

/**
 * The selection: an anchor, a focus, and any cells ctrl-clicked in or out of
 * the rectangle they span.
 */
export interface Selection {
  a: Addr
  f: Addr
  extras: Record<string, boolean>
}

export interface EditTarget {
  tab: string
  vid: string
  col: string | number
}

/** A restatement waiting on a reason. */
export interface Retro {
  key: string
  num: number | null
  old: number
  label: string
  vid: string
}

export interface FilterDraft {
  sts: Record<string, boolean>
  inc: boolean
}

export function useFleetFinancials() {
  const [tab, setTab] = useState<Tab>('dash')
  const [month, setMonth] = useState(6)
  const [year, setYear] = useState(2026)
  const [periodOpen, setPeriodOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('net')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [sSts, setSSts] = useState<Record<string, boolean>>({})
  const [onlyIncomplete, setOnlyIncomplete] = useState(false)
  const [fpOpen, setFpOpen] = useState(false)
  const [fpSec, setFpSec] = useState<Record<string, boolean>>({ g0: true })
  const [pf, setPf] = useState<FilterDraft | null>(null)

  const [cells, setCells] = useState<Cells>(seedCells)
  const [stmt, setStmt] = useState('$24,420.00')

  const [edit, setEdit] = useState<EditTarget | null>(null)
  const [editValue, setEditValue] = useState('')
  const [retro, setRetro] = useState<Retro | null>(null)
  const [retroReason, setRetroReason] = useState('')

  const [importOpen, setImportOpen] = useState(false)
  const [impStep, setImpStep] = useState(1)
  const [impFileName, setImpFileName] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [kebabOpen, setKebabOpen] = useState(false)
  const [resolvePickerOpen, setResolvePickerOpen] = useState(false)
  const [resolvedVan, setResolvedVan] = useState<string | null>(null)

  const [sel, setSel] = useState<Selection | null>(null)
  const [dragging, setDragging] = useState(false)
  const [fillDrag, setFillDrag] = useState(false)
  const [hoverBar, setHoverBar] = useState<number | null>(null)

  const [edits, setEdits] = useState<CellEdit[]>(SEED_EDITS)
  const [batches, setBatches] = useState<Batch[]>(SEED_BATCHES)

  const { toast, toastMsg } = useToast(2200)

  // ---- what the grid is showing -------------------------------------------

  const isDash = tab === 'dash'
  const isIns = tab === 'ins'
  const isLease = tab === 'lease'
  const isAmz = tab === 'amz'
  const isGrid = !isDash
  const gridTab = isIns ? 'ins' : isLease ? 'lease' : 'amz'
  /** Insurance and lease are per month across a year; Amazon is per week. */
  const monthly = isIns || isLease

  const WK = useMemo(() => weeks(month), [month])
  const cols = useMemo(
    () => (isAmz ? WK.map((w) => ({ id: w.id as string | number, label: w.label })) : MONTHS.map((m, i) => ({ id: i as string | number, label: m }))),
    [isAmz, WK],
  )

  const q = search.trim().toLowerCase()
  const match = useCallback(
    (v: { name: string; vin: string }) => !q || `${v.name} ${v.vin}`.toLowerCase().includes(q),
    [q],
  )
  const stsSel = Object.keys(sSts)
  const sMatch = useCallback((v: { status: string }) => !stsSel.length || !!sSts[v.status], [stsSel.length, sSts])

  /** The grid's row order: on-fleet first, then off-fleet, then the unallocated line. */
  const rowIds = useMemo(() => {
    const on = VEHICLES.filter((v) => v.status !== 'Off fleet').filter(match).filter(sMatch)
    const off = VEHICLES.filter((v) => v.status === 'Off fleet').filter(match).filter(sMatch)
    const ids = on.concat(off).map((v) => v.id)
    return ids.length ? ids.concat(['unalloc']) : ids
  }, [match, sMatch])

  const colIds = useMemo(() => cols.map((c) => c.id), [cols])

  // ---- selection -----------------------------------------------------------

  const selRect = useCallback(() => {
    if (!sel) return null
    return {
      r1: Math.min(sel.a.r, sel.f.r), r2: Math.max(sel.a.r, sel.f.r),
      c1: Math.min(sel.a.c, sel.f.c), c2: Math.max(sel.a.c, sel.f.c),
    }
  }, [sel])

  const inSel = useCallback(
    (r: number, c: number): boolean => {
      if (!sel) return false
      const k = `${r}|${c}`
      if (sel.extras[k] !== undefined) return sel.extras[k]
      const rc = { r1: Math.min(sel.a.r, sel.f.r), r2: Math.max(sel.a.r, sel.f.r), c1: Math.min(sel.a.c, sel.f.c), c2: Math.max(sel.a.c, sel.f.c) }
      return r >= rc.r1 && r <= rc.r2 && c >= rc.c1 && c <= rc.c2
    },
    [sel],
  )

  // ---- writing -------------------------------------------------------------

  /** Twenty steps of undo, each an inverse of the cells one action touched. */
  const undoStack = useRef<{ k: string; old: number | null }[][]>([])

  const pushUndo = (keys: string[]) => {
    const inv = keys.map((k) => ({ k, old: cells[k] === undefined ? null : cells[k] }))
    undoStack.current = undoStack.current.slice(-19).concat([inv])
  }

  const undo = () => {
    const inv = undoStack.current.pop()
    if (!inv) { toastMsg('Nothing to undo'); return }
    setCells((cur) => {
      const next = { ...cur }
      inv.forEach((x) => { if (x.old === null) delete next[x.k]; else next[x.k] = x.old })
      return next
    })
    toastMsg(`Undone · ${inv.length}${inv.length === 1 ? ' cell' : ' cells'}`)
  }

  const periodOf = (parts: string[]): string =>
    parts[0] === 'amz'
      ? (allWeeks().find((w) => w.id === parts[2])?.label ?? parts[2])
      : `${MONTHS[Number(parts[2])]} ${year}`

  const writeCell = (key: string, num: number | null, old: number | null, reason: string) => {
    pushUndo([key])
    const parts = key.split('|')
    setCells((cur) => {
      const next = { ...cur }
      if (num === null) delete next[key]
      else next[key] = num
      return next
    })
    const veh = VEHICLES.find((v) => v.id === parts[1])
    setEdits((e) => [{
      when: 'Aug 16, 10:12',
      period: periodOf(parts),
      vehicle: veh ? veh.name : 'Fleet (unallocated)',
      change: `${old === null ? '(blank)' : money(old, true)} → ${num === null ? '(blank)' : money(num, true)}`,
      reason,
      by: 'You',
    }, ...e])
    toastMsg(reason ? 'Restated' : 'Saved')
  }

  const startEdit = (t: string, vid: string, col: string | number, cur: number | null) => {
    setEdit({ tab: t, vid, col })
    setEditValue(cur === null ? '' : `$${cur}`)
  }

  /**
   * Commit an edit. A period that has already closed cannot be changed quietly
   * — it opens the restatement dialog and asks why.
   */
  const commitEdit = () => {
    if (!edit) return
    const key = `${edit.tab}|${edit.vid}|${edit.col}`
    const raw = editValue.replace(/[$,\s]/g, '')
    const num = raw === '' ? null : Number(raw)
    if (raw !== '' && isNaN(num!)) {
      setEdit(null)
      toastMsg('Not a number. Nothing was written')
      return
    }
    const old = cells[key] === undefined ? null : cells[key]
    const ended = edit.tab === 'amz'
      ? (allWeeks().find((w) => w.id === edit.col)?.ended ?? false)
      : Number(edit.col) < 6
    if (ended && old !== null && old !== num) {
      const label = edit.tab === 'amz'
        ? allWeeks().find((w) => w.id === edit.col)!.label
        : `${MONTHS[Number(edit.col)]} ${year}`
      setRetro({ key, num, old, label, vid: edit.vid })
      setRetroReason('')
      setEdit(null)
      return
    }
    writeCell(key, num, old, '')
    setEdit(null)
  }

  const locked = useCallback(
    (vid: string, ci: number) => isLocked(cells, gridTab, vid, colIds[ci], ci, month),
    [cells, gridTab, colIds, month],
  )

  const fillDown = useCallback(() => {
    const rc = selRect()
    if (!rc || rc.r2 === rc.r1) return
    const next = { ...cells }
    const keys: string[] = []
    let n = 0
    for (let c = rc.c1; c <= rc.c2; c++) {
      const src = cell(cells, gridTab, rowIds[rc.r1], colIds[c])
      if (src === null) continue
      for (let r = rc.r1 + 1; r <= rc.r2; r++) {
        const id = rowIds[r]
        if (!id || locked(id, c)) continue
        const k = `${gridTab}|${id}|${colIds[c]}`
        keys.push(k)
        next[k] = src
        n++
      }
    }
    if (!n) return
    pushUndo(keys)
    setCells(next)
    toastMsg(`Filled ${n} cells`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells, gridTab, rowIds, colIds, selRect, locked, toastMsg])

  const copySel = () => {
    const rc = selRect()
    if (!rc) return
    const lines: string[] = []
    for (let r = rc.r1; r <= rc.r2; r++) {
      const row: string[] = []
      for (let c = rc.c1; c <= rc.c2; c++) {
        const id = rowIds[r]
        const v = inSel(r, c) && id ? cell(cells, gridTab, id, colIds[c]) : null
        row.push(v === null ? '' : v.toFixed(2))
      }
      lines.push(row.join('\t'))
    }
    navigator.clipboard?.writeText(lines.join('\n'))
    toastMsg(`Copied ${(rc.r2 - rc.r1 + 1) * (rc.c2 - rc.c1 + 1)} cells`)
  }

  const pasteAt = (text: string) => {
    const rc = selRect()
    if (!rc) return
    const grid = text.replace(/\r/g, '').split('\n').filter((l) => l !== '').map((l) => l.split('\t'))
    const next = { ...cells }
    const touched: string[] = []
    let written = 0
    let skipped = 0
    let restated = 0
    grid.forEach((line, dr) =>
      line.forEach((raw, dc) => {
        const r = rc.r1 + dr
        const c = rc.c1 + dc
        if (r >= rowIds.length || c >= colIds.length) { skipped++; return }
        const id = rowIds[r]
        if (!id || locked(id, c)) { skipped++; return }
        const clean = raw.replace(/[$,\s]/g, '')
        if (clean === '') return
        const num = Number(clean)
        if (isNaN(num)) { skipped++; return }
        const key = `${gridTab}|${id}|${colIds[c]}`
        // A paste over a closed period is still a restatement — it is counted
        // and named, even though it does not stop to ask.
        const isClosed = gridTab === 'amz' ? true : Number(colIds[c]) < 6
        if (isClosed && next[key] !== undefined && next[key] !== num) restated++
        touched.push(key)
        next[key] = num
        written++
      }),
    )
    if (written === 0) {
      toastMsg(`Nothing pasted${skipped ? ` · ${skipped} cells skipped` : ''}`)
      return
    }
    pushUndo(touched)
    setCells(next)
    setEdits((e) => [{
      when: 'Aug 16, 10:12',
      period: `${MONTHS_FULL[month]} ${year}`,
      vehicle: `Paste · ${written} cells`,
      change: 'Pasted from clipboard',
      reason: restated ? `${restated} restated` : '',
      by: 'You',
    }, ...e])
    toastMsg(`Pasted ${written} cells${restated ? ` · ${restated} restated` : ''}${skipped ? ` · ${skipped} skipped` : ''}`)
  }

  // ---- keyboard and mouse --------------------------------------------------

  // Refs let the window listeners see current state without rebinding on every
  // keystroke, which would drop a held mouse button mid-drag.
  const api = useRef({ fillDown, copySel, pasteAt, undo, startEdit, locked, sel, edit, importOpen, historyOpen, retro, rowIds, colIds, gridTab, cells })
  api.current = { fillDown, copySel, pasteAt, undo, startEdit, locked, sel, edit, importOpen, historyOpen, retro, rowIds, colIds, gridTab, cells }

  useEffect(() => {
    const onUp = () => {
      setFillDrag((f) => {
        if (f) api.current.fillDown()
        return false
      })
      setDragging(false)
    }

    const onKey = (e: KeyboardEvent) => {
      const a = api.current
      if (a.edit || a.importOpen || a.historyOpen || a.retro || !a.sel) return
      if (e.key === 'Escape') { setSel(null); return }
      const arrows: Record<string, [number, number]> = {
        ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
      }
      if (arrows[e.key] || e.key === 'Tab') {
        e.preventDefault()
        const d = arrows[e.key] ?? (e.shiftKey ? [0, -1] : [0, 1])
        const nr = Math.max(0, Math.min(a.rowIds.length - 1, a.sel.f.r + d[0]))
        const nc = Math.max(0, Math.min(a.colIds.length - 1, a.sel.f.c + d[1]))
        const f = { r: nr, c: nc }
        // Shift-arrow grows the selection; a plain arrow moves it.
        setSel(e.shiftKey && arrows[e.key] ? { a: a.sel!.a, f, extras: a.sel!.extras } : { a: f, f, extras: {} })
        return
      }
      const id = a.rowIds[a.sel.f.r]
      if (!id) return
      const colId = a.colIds[a.sel.f.c]
      const val = cell(a.cells, a.gridTab, id, colId)
      const mod = e.ctrlKey || e.metaKey
      if (mod && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); a.copySel(); return }
      if (mod && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); a.undo(); return }
      if (mod && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); a.fillDown(); return }
      if (a.locked(id, a.sel.f.c)) return
      if (e.key === 'Enter') { e.preventDefault(); a.startEdit(a.gridTab, id, colId, val); return }
      if (mod) return
      // Typing a digit starts an edit with that digit already in it.
      if (/^[0-9.$-]$/.test(e.key)) {
        e.preventDefault()
        setEdit({ tab: a.gridTab, vid: id, col: colId })
        setEditValue(e.key === '$' ? '$' : `$${e.key}`)
      }
    }

    const onPaste = (e: ClipboardEvent) => {
      const a = api.current
      if (a.edit || a.importOpen || a.historyOpen || a.retro || !a.sel) return
      const text = e.clipboardData?.getData('text')
      if (!text) return
      e.preventDefault()
      a.pasteAt(text)
    }

    window.addEventListener('mouseup', onUp)
    window.addEventListener('keydown', onKey)
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('paste', onPaste)
    }
  }, [])

  // ---- rollups -------------------------------------------------------------

  const rollup = useMemo(() => {
    const perVan = { amz: 0, lease: 0, ins: 0, oop: 0 }
    VEHICLES.forEach((v) => {
      perVan.amz += amazonFor(cells, v.id, month)
      perVan.lease += cell(cells, 'lease', v.id, month) ?? 0
      perVan.ins += cell(cells, 'ins', v.id, month) ?? 0
      perVan.oop += v.oop
    })
    const un = { amz: 0, lease: cell(cells, 'lease', 'unalloc', month) ?? 0, ins: cell(cells, 'ins', 'unalloc', month) ?? 0 }
    WK.forEach((w) => { un.amz += cell(cells, 'amz', 'unalloc', w.id) ?? 0 })
    const perVanNet = perVan.amz - perVan.lease - perVan.ins - perVan.oop
    const unNet = un.amz - un.lease - un.ins
    return {
      perVan, un, unNet,
      tot: { amz: perVan.amz + un.amz, lease: perVan.lease + un.lease, ins: perVan.ins + un.ins, oop: perVan.oop, net: perVanNet + unNet },
    }
  }, [cells, month, WK])

  const pageClick = () => {
    if (periodOpen || kebabOpen) {
      setPeriodOpen(false)
      setKebabOpen(false)
    }
  }

  const draft: FilterDraft = pf ?? { sts: { ...sSts }, inc: onlyIncomplete }
  const fpCount = Object.keys(sSts).length + (onlyIncomplete ? 1 : 0)

  return {
    tab, setTab, month, setMonth, year, setYear, periodOpen, setPeriodOpen, monthly,
    isDash, isGrid, isIns, isLease, isAmz, gridTab, cols, colIds, rowIds, WK,
    search, setSearch, match, sMatch, stsSel,
    sortKey, setSortKey, sortDir, setSortDir,
    sSts, setSSts, onlyIncomplete, setOnlyIncomplete,
    fpOpen, setFpOpen, fpSec, setFpSec, pf, setPf, draft, fpCount,
    cells, stmt, setStmt,
    edit, setEdit, editValue, setEditValue, startEdit, commitEdit, locked,
    retro, setRetro, retroReason, setRetroReason, writeCell,
    importOpen, setImportOpen, impStep, setImpStep, impFileName, setImpFileName,
    historyOpen, setHistoryOpen, kebabOpen, setKebabOpen,
    resolvePickerOpen, setResolvePickerOpen, resolvedVan, setResolvedVan,
    sel, setSel, dragging, setDragging, fillDrag, setFillDrag, selRect, inSel,
    hoverBar, setHoverBar,
    edits, setEdits, batches, setBatches,
    toast, toastMsg, pageClick,
    rollup, incompleteOf: (v: (typeof VEHICLES)[number]) => incomplete(cells, v, month),
    vanNetOf: (v: (typeof VEHICLES)[number]) => vanNet(cells, v, month),
    amazonOf: (vid: string) => amazonFor(cells, vid, month),
  }
}

export type FleetFinancialsState = ReturnType<typeof useFleetFinancials>
export type { Status }
