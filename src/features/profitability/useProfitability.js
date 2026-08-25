import { useCallback, useEffect, useRef, useState } from 'react'
import { BY_ID, CHART_KEYS, CURRENT, LAYOUT_STORAGE_KEY } from './data.js'

const defaultLayout = () =>
  Object.fromEntries(CHART_KEYS.map((k, i) => [k, i]))

// Chart order is the reader's, and it persists — someone who cares about
// overtime should not have to scroll past four charts every visit.
function loadLayout() {
  try {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY)
    return saved ? { ...defaultLayout(), ...JSON.parse(saved) } : defaultLayout()
  } catch {
    return defaultLayout()
  }
}

// The scroll container belongs to the page; the hook only needs to ask it to
// scroll back to the top when the period changes.
export function useProfitability({ scrollToTop } = {}) {
  const [sel, setSel] = useState('P14')
  const [range, setRange] = useState(6)
  const [compare, setCompare] = useState('prev')
  const [menu, setMenu] = useState(null)
  const [sort, setSort] = useState({ col: 'idx', dir: 'desc' })
  const [tip, setTip] = useState(null)
  const [q, setQ] = useState('')
  const [periodQ, setPeriodQ] = useState('')
  const [year, setYear] = useState(null)
  const [layout, setLayout] = useState(loadLayout)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterDraft, setFilterDraft] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)

  const toastTimer = useRef(null)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const toast = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToastMsg(msg)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  const closeMenus = useCallback(() => setMenu((m) => (m ? null : m)), [])
  const toggleMenu = useCallback(
    (name) => (e) => {
      e.stopPropagation()
      setPeriodQ('')
      setMenu((m) => (m === name ? null : name))
    },
    [],
  )

  // Picking a period scrolls back to the top — the figures above are the point.
  const pickPeriod = useCallback(
    (id) => {
      setSel(id)
      setMenu(null)
      if (scrollToTop) scrollToTop()
    },
    [scrollToTop],
  )

  const toggleSort = useCallback(
    (col) => () =>
      setSort((s) => ({ col, dir: s.col === col ? (s.dir === 'asc' ? 'desc' : 'asc') : 'desc' })),
    [],
  )

  // Dropping one chart on another swaps their positions.
  const swapCharts = useCallback((from, to) => {
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
