'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast, anchorTo, paginate } from '../../ds/hooks'
import {
  BATCHES, PAGE_SIZE, SEED_REMEMBERED, SEED_SKIP_VALUES, SEED_VALUE_MAP, SOURCES,
  isRosterSource, issuesFor,
} from './data'
import type { Batch, ValueMapping } from './data'

export type Tab = 'import' | 'history'

export interface Sort {
  k: string | null
  d: 'asc' | 'desc'
}

export interface MenuState {
  kind:
  | 'daCol' | 'dateCol' | 'repCol' | 'descCol' | 'rCol' | 'preset'
  | 'mvStd' | 'issDa' | 'issStd' | 'issDate' | 'fOp' | 'fCol' | 'batchKebab'
  x: number
  y: number
  w: number
  /** Which column-state key, issue id, source name or batch the menu is for. */
  field?: string
  issueId?: string
  source?: string
  batch?: Batch
}

export type GeneralDialog = 'skips' | 'matches' | 'mapping' | 'skipRows'
export type FormDialog = 'mv' | 'filter' | 'source'

/** Which column of the file feeds each field the importer needs. */
export interface ColumnMap {
  daCol: string
  dateCol: string
  repCol: string
  descCol: string
  rNameCol: string
  rIdCol: string
  rEeCol: string
  rStartCol: string
}

const SEED_COLUMNS: ColumnMap = {
  daCol: 'VIN of Driver to Transporter ID',
  dateCol: 'Violation Date',
  repCol: 'Import time',
  descCol: 'None',
  rNameCol: 'Driver Name',
  rIdCol: 'Transporter ID',
  rEeCol: 'EE Code',
  rStartCol: 'Start Date',
}

export function useImports() {
  const [tab, setTab] = useState<Tab>('import')
  const [step, setStep] = useState(1)
  const [src, setSrc] = useState('Safety (Netradyne)')
  const [mode, setMode] = useState('Each Row')

  const [columns, setColumns] = useState<ColumnMap>(SEED_COLUMNS)
  const [vmap, setVmap] = useState<ValueMapping[]>(SEED_VALUE_MAP)
  const [filters, setFilters] = useState(['Status equals Valid'])
  const [customSources, setCustomSources] = useState<string[]>([])
  const [imported, setImported] = useState<Record<string, boolean>>({})
  /** How each flagged issue was answered; "Skip these rows" is an answer too. */
  const [resolved, setResolved] = useState<Record<string, string>>({})

  const [skipVals, setSkipVals] = useState(SEED_SKIP_VALUES)
  const [remembered, setRemembered] = useState<[string, string][]>(SEED_REMEMBERED)

  const [hq, setHq] = useState('')
  const [hSrcs, setHSrcs] = useState<Record<string, boolean>>({})
  const [hSts, setHSts] = useState<Record<string, boolean>>({})
  const [bSort, setBSort] = useState<Sort>({ k: 'date', d: 'desc' })
  const [pvSort, setPvSort] = useState<Sort>({ k: null, d: 'asc' })
  const [bPg, setBPg] = useState(1)

  const [fpOpen, setFpOpen] = useState(false)
  const [fpSec, setFpSec] = useState<Record<string, boolean>>({ g0: true, g1: true })
  const [pf, setPf] = useState<{ srcs: Record<string, boolean>; sts: Record<string, boolean> } | null>(null)

  const [gDlg, setGDlg] = useState<GeneralDialog | null>(null)
  const [gCtx, setGCtx] = useState<{ src: string } | null>(null)
  const [fDlg, setFDlg] = useState<FormDialog | null>(null)
  const [mv, setMv] = useState<{ file: string; std: string | null; dir: 'neg' | 'pos' }>({ file: '', std: null, dir: 'neg' })
  const [ff, setFf] = useState({ col: 'Status', op: 'Equals', val: '' })
  const [cs, setCs] = useState('')

  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuQuery, setMenuQuery] = useState('')

  const { toast, toastMsg } = useToast(2600)

  const openMenu = useCallback((e: React.MouseEvent, kind: MenuState['kind'], extra?: Partial<MenuState>) => {
    e.stopPropagation()
    setMenu({ kind, ...anchorTo(e, 240), ...extra })
    setMenuQuery('')
  }, [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const roster = isRosterSource(src)
  const issues = useMemo(() => issuesFor(src), [src])

  /** The three review figures, adjusted by whatever has been resolved. */
  const review = useMemo(() => {
    const inFile = roster ? 14 : 1204
    const baseOut = issues.reduce((a, r) => a + r.rows, 0)
    // A filter is deliberate, so resolving it is not "recovering" rows.
    const recovered = issues
      .filter((r) => r.kind !== 'filter' && resolved[r.id] && resolved[r.id] !== 'Skip these rows')
      .reduce((a, r) => a + r.rows, 0)
    const created = (roster ? inFile - baseOut : 34) + recovered
    return { inFile, created, notImported: baseOut - recovered }
  }, [roster, issues, resolved])

  /** Only the issues that a person is expected to answer. */
  const openIssues = useMemo(
    () => issues.filter((r) => r.kind !== 'filter' && r.kind !== 'hold' && !resolved[r.id]),
    [issues, resolved],
  )

  const batches = useMemo(() => {
    const q = hq.trim().toLowerCase()
    const srcSel = Object.keys(hSrcs)
    const stSel = Object.keys(hSts)
    const list = BATCHES.filter((b) =>
      (!srcSel.length || hSrcs[b.source]) &&
      (!stSel.length || hSts[b.status]) &&
      (!q || `${b.source} ${b.file}`.toLowerCase().includes(q)))
    const dir = bSort.d === 'asc' ? 1 : -1
    return list.slice().sort((a, b) => {
      const v = (x: Batch): number => {
        switch (bSort.k) {
          case 'rows': return x.rows
          case 'events': return x.events
          case 'skipped': return x.skipped
          case 'unmatched': return x.unmatched
          default: return x.d
        }
      }
      return (v(a) - v(b)) * dir
    })
  }, [hq, hSrcs, hSts, bSort])

  const pageBatches = useMemo(() => paginate(batches, bPg, PAGE_SIZE), [batches, bPg])

  const sortBatches = useCallback((k: string) => {
    setBSort((s) => ({ k, d: s.k === k && s.d === 'asc' ? 'desc' : 'asc' }))
  }, [])

  const sortPreview = useCallback((i: number) => {
    setPvSort((s) => ({ k: String(i), d: s.k === String(i) && s.d === 'asc' ? 'desc' : 'asc' }))
  }, [])

  const pending = useMemo(() => pf ?? { srcs: hSrcs, sts: hSts }, [pf, hSrcs, hSts])
  const filterCount = Object.keys(hSrcs).length + Object.keys(hSts).length

  const openFilters = useCallback(() => {
    setFpOpen(true)
    setMenu(null)
    setPf({ srcs: { ...hSrcs }, sts: { ...hSts } })
  }, [hSrcs, hSts])

  const applyFilters = useCallback(() => {
    setFpOpen(false)
    setHSrcs(pending.srcs)
    setHSts(pending.sts)
    toastMsg('Filters applied')
  }, [pending, toastMsg])

  const setColumn = useCallback((key: keyof ColumnMap, value: string) => {
    setColumns((c) => ({ ...c, [key]: value }))
  }, [])

  const resolve = useCallback((id: string, value: string) => {
    setResolved((r) => ({ ...r, [id]: value }))
  }, [])

  const unresolve = useCallback((id: string) => {
    setResolved((r) => {
      const next = { ...r }
      delete next[id]
      return next
    })
  }, [])

  const openG = useCallback((kind: GeneralDialog, ctx: { src: string }) => {
    setGDlg(kind)
    setGCtx(ctx)
    setMenu(null)
  }, [])
  const closeG = useCallback(() => { setGDlg(null); setGCtx(null) }, [])

  const allSources = useMemo(() => [...SOURCES, ...customSources], [customSources])

  return {
    tab, setTab, step, setStep, src, setSrc, mode, setMode, roster, issues, openIssues, review,
    columns, setColumn, vmap, setVmap, filters, setFilters, customSources, setCustomSources,
    imported, setImported, resolved, resolve, unresolve, setResolved,
    skipVals, setSkipVals, remembered, setRemembered,
    hq, setHq, bSort, sortBatches, pvSort, sortPreview, batches, pageBatches, bPg, setBPg,
    fpOpen, setFpOpen, fpSec, setFpSec, pf, setPf, pending, filterCount, openFilters, applyFilters,
    gDlg, gCtx, openG, closeG, fDlg, setFDlg, mv, setMv, ff, setFf, cs, setCs,
    menu, openMenu, closeMenu, menuQuery, setMenuQuery,
    allSources,
    toast, toastMsg,
  }
}

export type ImportsState = ReturnType<typeof useImports>
