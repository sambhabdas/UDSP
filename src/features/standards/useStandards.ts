'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast, anchorTo } from '../../ds/hooks'
import { SEED_CATEGORIES, SEED_TIERS, SWATCHES, sortTiers } from './data'
import type { Category, StandardRow, Tier } from './data'

export type Tab = 'catalog' | 'tiers'

export interface Sort {
  k: string | null
  d: 'asc' | 'desc'
}

/** Where a standard sits: which category, and which row inside it. */
export interface Ref {
  c: number
  r: number
}

export interface MenuState {
  kind: 'catKebab' | 'rowKebab' | 'tierKebab' | 'cat' | 'mkModule' | 'pairModule2'
  x: number
  y: number
  w: number
  catIndex?: number
  ref?: Ref
  tierName?: string
}

/** The standard editor's working copy. */
export interface MakerForm {
  mode: 'new' | 'editCustom' | 'editBuiltin'
  catNew: boolean
  catName: string
  catColor: string
  cat: string
  name: string
  desc: string
  dir: 'neg' | 'pos' | 'both'
  neg: string
  pos: string
  per: string
  active: boolean
  module: string | null
  auto: boolean
  due: string
  srcCat: number | null
  srcRow: number | null
}

export const blankMaker = (): MakerForm => ({
  mode: 'new', catNew: false, catName: '', catColor: 'var(--blue-400)', cat: 'Safety',
  name: '', desc: '', dir: 'neg', neg: '', pos: '', per: 'Event', active: true,
  module: null, auto: false, due: '7', srcCat: null, srcRow: null,
})

export interface TierForm {
  orig: string | null
  name: string
  from: string
  color: string
  risk: boolean
  note: string
  /** The bottom tier has no lower bound to edit. */
  lowest: boolean
}

export interface ConfirmLine {
  txt: string
  color: string
}

export type GeneralDialog = 'confirm' | 'history' | 'cat' | 'pair'

export interface GeneralContext {
  kind?: 'risk' | 'delTier' | 'delStd'
  tier?: string
  name?: string
  lines?: ConfirmLine[]
  rows?: { when: string; who: string; field: string; change: string }[]
  idx?: number
  c?: number
  r?: number
  first?: boolean
}

/** Replace one row without mutating the rest of the tree. */
const withRow = (cats: Category[], ref: Ref, next: StandardRow): Category[] =>
  cats.map((c, ci) => (ci === ref.c ? { ...c, rows: c.rows.map((r, ri) => (ri === ref.r ? next : r)) } : c))

export function useStandards() {
  const [tab, setTab] = useState<Tab>('catalog')
  const [search, setSearch] = useState('')
  const [cats, setCats] = useState<Category[]>(SEED_CATEGORIES)
  const [tiers, setTiers] = useState<Tier[]>(SEED_TIERS)

  const [catSort, setCatSort] = useState<Sort>({ k: null, d: 'asc' })
  const [catFilter, setCatFilter] = useState<Record<string, boolean>>({})
  const [pf, setPf] = useState<Record<string, boolean> | null>(null)
  const [fpOpen, setFpOpen] = useState(false)

  const [drag, setDrag] = useState<Ref | null>(null)

  const [stdDlg, setStdDlg] = useState(false)
  const [catDlg, setCatDlg] = useState(false)
  const [catEditIdx, setCatEditIdx] = useState<number | null>(null)
  const [coachDrawer, setCoachDrawer] = useState(false)
  const [mk, setMk] = useState<MakerForm>(blankMaker)

  const [tierDlg, setTierDlg] = useState<'new' | 'edit' | null>(null)
  const [te, setTe] = useState<TierForm | null>(null)
  const [tierFromEdit, setTierFromEdit] = useState<string | null>(null)
  const [tierFromVal, setTierFromVal] = useState('')

  const [gDlg, setGDlg] = useState<GeneralDialog | null>(null)
  const [gCtx, setGCtx] = useState<GeneralContext | null>(null)
  const [pairForm, setPairForm] = useState<{ module: string | null; due: string }>({ module: null, due: '7' })
  const [catForm, setCatForm] = useState({ idx: 0, name: '', color: '' })

  const [menu, setMenu] = useState<MenuState | null>(null)

  const { toast, toastMsg } = useToast(2600)

  const openMenu = useCallback((e: React.MouseEvent, kind: MenuState['kind'], extra?: Partial<MenuState>) => {
    e.stopPropagation()
    setMenu({ kind, ...anchorTo(e, 240), ...extra })
  }, [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const stats = useMemo(() => {
    let standards = 0
    let custom = 0
    let paired = 0
    let autoOn = 0
    cats.forEach((c) => c.rows.forEach((r) => {
      // An inactive standard scores nothing, so it counts for nothing here.
      if (r.inactive) return
      standards++
      if (r.custom || c.custom) custom++
      if (r.module) {
        paired++
        if (r.auto) autoOn++
      }
    }))
    return { categories: cats.length, standards, custom, paired, autoOn }
  }, [cats])

  const q = search.trim().toLowerCase()

  /** The categories as shown: searched, sorted, and narrowed by the drawer. */
  const shownCats = useMemo(() => {
    const num = (t: string) => parseFloat(t.replace(/[^0-9.-]/g, '')) || 0
    return cats
      .map((c, ci) => {
        const matched = c.rows
          .map((r, ri) => ({ r, ri }))
          .filter(({ r }) => !q || r.name.toLowerCase().includes(q))
        const rows = catSort.k
          ? matched.slice().sort((a, b) => {
            const v = (x: StandardRow) =>
              catSort.k === 'name' ? x.name
                : catSort.k === 'neg' ? x.neg
                  : catSort.k === 'pos' ? x.pos
                    : num(x.module && x.auto && x.due ? `${x.due}` : '0')
            const xa = v(a.r)
            const xb = v(b.r)
            return (xa > xb ? 1 : xa < xb ? -1 : 0) * (catSort.d === 'asc' ? 1 : -1)
          })
          : matched
        return { cat: c, ci, rows, hidden: matched.length === 0 && !!q }
      })
      .filter((c) => !c.hidden)
      .filter((c) => Object.keys(catFilter).length === 0 || catFilter[c.cat.name])
  }, [cats, q, catSort, catFilter])

  const sortCatalog = useCallback((k: string) => {
    setCatSort((s) => ({ k, d: s.k === k && s.d === 'asc' ? 'desc' : 'asc' }))
  }, [])

  const ladder = useMemo(() => sortTiers(tiers), [tiers])

  const setRow = useCallback((ref: Ref, next: StandardRow) => {
    setCats((cs) => withRow(cs, ref, next))
  }, [])

  /** Auto coach cannot be on without something to assign. */
  const toggleAuto = useCallback((ref: Ref, r: StandardRow) => {
    if (!r.module) { toastMsg('Pair a module first'); return }
    setRow(ref, { ...r, auto: !r.auto })
  }, [setRow, toastMsg])

  /** Dropping a standard onto another category moves it there. */
  const dropOn = useCallback((ci: number, name: string) => {
    if (!drag) return
    if (drag.c === ci) { setDrag(null); return }
    setCats((cs) => {
      const next = cs.map((x) => ({ ...x, rows: x.rows.slice() }))
      const [moved] = next[drag.c].rows.splice(drag.r, 1)
      next[ci].rows.push(moved)
      toastMsg(`${moved.name} moved to ${name} - events keep their original category`)
      return next
    })
    setDrag(null)
  }, [drag, toastMsg])

  const openMaker = useCallback((c: Category, r: StandardRow, ref: Ref) => {
    setMenu(null)
    setStdDlg(true)
    setCoachDrawer(false)
    setMk({
      mode: r.custom ? 'editCustom' : 'editBuiltin',
      catNew: false, catName: '', catColor: c.dot, cat: c.name,
      name: r.name, desc: r.desc ?? '',
      dir: r.neg && r.pos ? 'both' : r.neg ? 'neg' : 'pos',
      neg: String(r.neg || ''), pos: String(r.pos || ''),
      per: r.per, active: !r.inactive, module: r.module, auto: r.auto,
      due: String(r.due ?? 7), srcCat: ref.c, srcRow: ref.r,
    })
  }, [])

  const openG = useCallback((kind: GeneralDialog, ctx: GeneralContext) => {
    setGDlg(kind)
    setGCtx(ctx)
    setMenu(null)
  }, [])
  const closeG = useCallback(() => { setGDlg(null); setGCtx(null); setMenu(null) }, [])

  const filterCount = Object.keys(catFilter).length
  const pending = pf ?? catFilter

  const openFilters = useCallback(() => { setFpOpen(true); setMenu(null); setPf({ ...catFilter }) }, [catFilter])
  const applyFilters = useCallback(() => {
    setFpOpen(false)
    setCatFilter(pending)
    toastMsg('Filters applied')
  }, [pending, toastMsg])

  /** The colour a new tier gets: the first swatch nothing is using. */
  const freeSwatch = useCallback(() => SWATCHES.find((sw) => !tiers.some((t) => t.color === sw)) ?? 'var(--green-300)', [tiers])

  return {
    tab, setTab, search, setSearch, cats, setCats, tiers, setTiers,
    catSort, sortCatalog, catFilter, pf, setPf, pending, fpOpen, setFpOpen, filterCount, openFilters, applyFilters,
    drag, setDrag, dropOn,
    stdDlg, setStdDlg, catDlg, setCatDlg, catEditIdx, setCatEditIdx, coachDrawer, setCoachDrawer,
    mk, setMk, openMaker,
    tierDlg, setTierDlg, te, setTe, tierFromEdit, setTierFromEdit, tierFromVal, setTierFromVal, freeSwatch,
    gDlg, gCtx, openG, closeG, pairForm, setPairForm, catForm, setCatForm,
    menu, openMenu, closeMenu,
    stats, shownCats, ladder, setRow, toggleAuto,
    toast, toastMsg,
  }
}

export type StandardsState = ReturnType<typeof useStandards>
