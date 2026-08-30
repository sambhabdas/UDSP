import { useCallback, useState } from 'react'
import { useToast } from '../../ds/hooks'
import { DEFAULT_DAY, SEED_NOTES_DAY, SEED_NOTES_WEEK } from './data'
import type { Grain, Note } from './data'

/** What the sections read. Derived from the hook so the two cannot drift. */
export type ProjectionState = ReturnType<typeof useProfitProjection>

export function useProfitProjection() {
  const [scope, setScope] = useState<'week' | 'day'>('week')
  const [dayIdx, setDayIdx] = useState(DEFAULT_DAY)
  const [weekOffset, setWeekOffset] = useState(0)
  const [grain, setGrain] = useState<Grain>('Week')
  const [menu, setMenu] = useState<string | null>(null)
  const [sort, setSort] = useState<{ col: string | null; dir: 'asc' | 'desc' }>({
    col: null,
    dir: 'asc',
  })
  const [tip, setTip] = useState<{ chart: string; i: number } | null>(null)
  const [locked, setLocked] = useState<Record<number, boolean>>({})
  const [pq, setPq] = useState('')
  const [extraCols, setExtraCols] = useState<Record<string, boolean>>({})
  const [allPeople, setAllPeople] = useState(false)
  const [splitAll, setSplitAll] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [custom, setCustom] = useState({ from: '2026-07-26', to: '2026-08-01' })
  const [noteDraft, setNoteDraft] = useState('')
  const [notesWeek, setNotesWeek] = useState(SEED_NOTES_WEEK)
  const [notesDay, setNotesDay] = useState(SEED_NOTES_DAY)


  // `toast` is the function and `toastMsg` the line — this page's own naming.
  const { toast: toastMsg, toastMsg: toast } = useToast(2600)

  const isDay = scope === 'day'
  const isWeek = !isDay
  // Stepping off the seeded week leaves nothing to show — the page says so
  // rather than inventing figures.
  const empty = isWeek && weekOffset !== 0

  const closeMenus = useCallback(() => setMenu((m) => (m ? null : m)), [])
  const toggleMenu = useCallback(
    (name: string) => (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setMenu((m) => (m === name ? null : name))
    },
    [],
  )

  // Opening a day resets everything scoped to the previous view.
  const openDay = useCallback((i: number) => {
    setScope('day')
    setDayIdx(i)
    setMenu(null)
    setTip(null)
    setSort({ col: null, dir: 'asc' })
    setPq('')
    setAllPeople(false)
  }, [])

  const backToWeek = useCallback(() => {
    setScope('week')
    setMenu(null)
    setTip(null)
    setSort({ col: null, dir: 'asc' })
  }, [])

  const pickGrain = useCallback(
    (g: Grain) => (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setMenu(null)
      if (g === 'Day') {
        setGrain('Week')
        if (scope !== 'day') openDay(DEFAULT_DAY)
        return
      }
      setGrain(g)
      setWeekOffset(0)
      setScope('week')
      setTip(null)
      setSort({ col: null, dir: 'asc' })
    },
    [scope, openDay],
  )

  const toggleSort = useCallback(
    (col: string) => () =>
      setSort((s) => ({ col, dir: s.col === col ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' })),
    [],
  )

  const toggleExtraCol = useCallback(
    (name: string) => (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setExtraCols((c) => ({ ...c, [name]: !c[name] }))
    },
    [],
  )

  const toggleLock = useCallback(() => {
    setLocked((l) => ({ ...l, [dayIdx]: !l[dayIdx] }))
  }, [dayIdx])

  const postNote = useCallback(() => {
    const text = noteDraft.trim()
    if (!text) return
    const entry: Note = {
      author: 'You',
      when: 'Just now',
      text,
      initials: 'YO',
      avBg: 'var(--neutral-200)',
      avFg: 'var(--text-secondary)',
    }
    if (isWeek) setNotesWeek((n) => [entry, ...n])
    else setNotesDay((n) => ({ ...n, [dayIdx]: [entry, ...(n[dayIdx] || [])] }))
    setNoteDraft('')
  }, [noteDraft, isWeek, dayIdx])

  const notes = empty ? [] : isWeek ? notesWeek : notesDay[dayIdx] || []

  return {
    scope, isDay, isWeek, empty,
    dayIdx, openDay, backToWeek, setDayIdx,
    weekOffset, setWeekOffset,
    grain, pickGrain,
    menu, toggleMenu, closeMenus,
    sort, toggleSort,
    tip, setTip,
    locked, toggleLock,
    pq, setPq,
    extraCols, toggleExtraCol,
    allPeople, setAllPeople,
    splitAll, setSplitAll,
    importOpen, setImportOpen,
    custom, setCustom,
    noteDraft, setNoteDraft, postNote, notes,
    toast, toastMsg,
  }
}
