'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast } from '../../ds/hooks'
import { SURVEYS } from './data'
import type { Question, Survey } from './data'

/** Which floating thing is open - only ever one at a time. */
export type Drop = 'survey' | 'range' | 'drivers' | 'export' | `driver-${string}` | null

export interface DetailState {
  query: string
  col: string | null
  dir: 'asc' | 'desc'
  driver: string
}

export const DETAIL_DEFAULT: DetailState = { query: '', col: null, dir: 'asc', driver: 'All drivers' }

export function useResponses() {
  const [survey, setSurvey] = useState<keyof typeof SURVEYS>('route')
  const [surveyQuery, setSurveyQuery] = useState('')
  const [range, setRange] = useState('Last 7 days')
  const [rangeFrom, setRangeFrom] = useState('2026-07-26')
  const [rangeTo, setRangeTo] = useState('2026-08-01')
  const [qFilter, setQFilter] = useState('All questions')

  const [drop, setDrop] = useState<Drop>(null)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  /** Which questions have their answer table open. */
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({})
  /** Per-question search / sort / driver, keyed by question id. */
  const [detailState, setDetailState] = useState<Record<string, DetailState>>({})

  const [handled, setHandled] = useState<string[]>([])
  const [remindedNames, setRemindedNames] = useState<string[]>([])
  const [naQuery, setNaQuery] = useState('')
  const [driverQuery, setDriverQuery] = useState('')
  const [pickedDrivers, setPickedDrivers] = useState<string[]>([])

  const [lightbox, setLightbox] = useState<{ qid: string; idx: number } | null>(null)

  // The filter panel edits a draft and only writes it back on Apply.
  const [fpOpen, setFpOpen] = useState(false)
  const [fpQuery, setFpQuery] = useState('')
  const [fpDraft, setFpDraft] = useState<string | null>(null)
  const [fpClosedSections, setFpClosedSections] = useState<string[]>([])

  const { toast, toastMsg } = useToast(2600)

  const closeFloating = useCallback(() => {
    setDrop(null)
    setMenuFor(null)
  }, [])

  const s: Survey = SURVEYS[survey]

  /** Every driver who answered anything - the toolbar's multi-select list. */
  const allDrivers = useMemo(() => {
    const names: string[] = []
    s.questions.forEach((q) => q.details.forEach((d) => { if (d.driver && !names.includes(d.driver)) names.push(d.driver) }))
    return names.sort()
  }, [s])

  const pickSurvey = useCallback((k: string) => {
    setSurvey(k)
    setSurveyQuery('')
    closeFloating()
    setQFilter('All questions')
    setPickedDrivers([])
    setOpenDetails({})
    setDetailState({})
  }, [closeFloating])

  const patchDetail = useCallback((qid: string, patch: Partial<DetailState>) => {
    setDetailState((d) => ({ ...d, [qid]: { ...(d[qid] ?? DETAIL_DEFAULT), ...patch } }))
  }, [])

  const detailOf = useCallback((qid: string): DetailState => detailState[qid] ?? DETAIL_DEFAULT, [detailState])

  const toggleDetails = useCallback((qid: string) => {
    setOpenDetails((o) => ({ ...o, [qid]: !o[qid] }))
  }, [])

  const toggleHandled = useCallback((rid: string) => {
    setHandled((h) => (h.includes(rid) ? h.filter((x) => x !== rid) : [...h, rid]))
    setMenuFor(null)
  }, [])

  const remind = useCallback((name: string) => {
    setRemindedNames((r) => [...r, name])
    toastMsg(`Reminder sent: ${name}`)
  }, [toastMsg])

  const toggleDriver = useCallback((name: string) => {
    setPickedDrivers((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]))
  }, [])

  /** The rows one question's table shows, after its own filters and the page's. */
  const detailRows = useCallback(
    (q: Question) => {
      const d = detailOf(q.id)
      let rows = q.details.filter(
        (row) =>
          (!pickedDrivers.length || (row.driver != null && pickedDrivers.includes(row.driver))) &&
          (d.driver === 'All drivers' || row.driver === d.driver) &&
          (d.query === '' ||
            `${row.driver ?? ''} ${row.route ?? ''} ${row.answer} ${row.when}`.toLowerCase().includes(d.query.toLowerCase())),
      )
      if (d.col) {
        const col = d.col as keyof typeof rows[number]
        rows = rows.slice().sort(
          (a, b) => String(a[col] ?? '').localeCompare(String(b[col] ?? '')) * (d.dir === 'asc' ? 1 : -1),
        )
      }
      return rows
    },
    [detailOf, pickedDrivers],
  )

  const applied = qFilter !== 'All questions'
  const draft = fpDraft ?? qFilter

  return {
    survey, s, pickSurvey,
    surveyQuery, setSurveyQuery,
    range, setRange, rangeFrom, setRangeFrom, rangeTo, setRangeTo,
    qFilter, setQFilter,
    drop, setDrop, menuFor, setMenuFor, closeFloating,
    hover, setHover,
    openDetails, toggleDetails, detailOf, patchDetail, detailRows,
    handled, toggleHandled,
    remindedNames, remind, naQuery, setNaQuery,
    allDrivers, driverQuery, setDriverQuery, pickedDrivers, setPickedDrivers, toggleDriver,
    lightbox, setLightbox,
    fpOpen, setFpOpen, fpQuery, setFpQuery, fpDraft, setFpDraft, draft, applied,
    fpClosedSections, setFpClosedSections,
    toast, toastMsg,
  }
}

export type RespState = ReturnType<typeof useResponses>
