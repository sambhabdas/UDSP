import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../ds/hooks'
import { BY_ID, CHART_KEYS, CURRENT, LAYOUT_STORAGE_KEY } from './data'
import type { CompareMode } from './data'

/** Chart key → its position in the grid. */
export type Layout = Record<string, number>

/** What the sections read. Derived from the hook so the two cannot drift. */
export type ProfitabilityState = ReturnType<typeof useProfitability>

const defaultLayout = (): Layout => Object.fromEntries(CHART_KEYS.map((k, i) => [k, i]))

// Chart order is the reader's, and it persists — someone who cares about
// overtime should not have to scroll past four charts every visit.
//
// Read after mount, never during render: there is no localStorage on the
// server, so a saved order used as the initial state would disagree with the
// HTML the server sent and React would throw the tree away.
function loadLayout(): Layout | null {
  try {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY)
    return saved ? { ...defaultLayout(), ...JSON.parse(saved) } : null
  } catch {
    return null
  }
}

// The scroll container belongs to the page; the hook only needs to ask it to
// scroll back to the top when the period changes.
export function useProfitability({ scrollToTop }: { scrollToTop?: () => void } = {}) {
  const [sel, setSel] = useState('P14')
  const [range, setRange] = useState(6)
  const [compare, setCompare] = useState<CompareMode>('prev')
  const [menu, setMenu] = useState<string | null>(null)
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'idx', dir: 'desc' })
  // Which chart is showing a tooltip, and over which column.
  const [tip, setTip] = useState<{ chart: string; i: number } | null>(null)
  const [q, setQ] = useState('')
  const [periodQ, setPeriodQ] = useState('')
  const [year, setYear] = useState<number | null>(null)
  const [layout, setLayout] = useState<Layout>(defaultLayout)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterDraft, setFilterDraft] = useState<{ year: number | null } | null>(null)



  // Synchronising with an external system is exactly what an effect is for, and
  // localStorage is one: it does not exist until the browser has the page.
  useEffect(() => {
    const saved = loadLayout()
    // eslint-disable-next-line react/set-state-in-effect
    if (saved) setLayout(saved)
  }, [])

  // `toast` is the function and `toastMsg` the line — this page's own naming.
  const { toast: toastMsg, toastMsg: toast } = useToast(2600)

  const closeMenus = useCallback(() => setMenu((m) => (m ? null : m)), [])
  const toggleMenu = useCallback(
    (name: string) => (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setPeriodQ('')
      setMenu((m) => (m === name ? null : name))
    },
    [],
  )

  // Picking a period scrolls back to the top — the figures above are the point.
  const pickPeriod = useCallback(
    (id: string) => {
      setSel(id)
      setMenu(null)
      if (scrollToTop) scrollToTop()
    },
    [scrollToTop],
  )

  const toggleSort = useCallback(
    (col: string) => () =>
      setSort((s) => ({ col, dir: s.col === col ? (s.dir === 'asc' ? 'desc' : 'asc') : 'desc' })),
    [],
  )

  // Dropping one chart on another swaps their positions.
  const swapCharts = useCallback((from: string | null, to: string) => {
    if (!from || from === to) return
    setLayout((l) => {
      if (l[from] === undefined || l[to] === undefined) return l
      const next = { ...l, [from]: l[to], [to]: l[from] }
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* a browser that refuses storage still reorders for this session */
      }
      return next
    })
  }, [])

  const openFilter = useCallback(() => {
    setFilterDraft({ year })
    setFilterOpen(true)
    setMenu(null)
  }, [year])

  const applyFilter = useCallback(() => {
    if (filterDraft) setYear(filterDraft.year)
    setFilterOpen(false)
    setFilterDraft(null)
  }, [filterDraft])

  const selected = BY_ID[sel] || CURRENT

  return {
    sel, selected, pickPeriod,
    range, setRange,
    compare, setCompare,
    menu, toggleMenu, closeMenus, setMenu,
    sort, toggleSort,
    tip, setTip,
    q, setQ,
    periodQ, setPeriodQ,
    year, setYear,
    layout, swapCharts,
    filterOpen, setFilterOpen, filterDraft, setFilterDraft, openFilter, applyFilter,
    toast, toastMsg,
  }
}
