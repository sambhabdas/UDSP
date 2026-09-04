import { useCallback, useMemo, useState } from 'react'
import { useToast } from '../../ds/hooks'
import { AUDIENCES, ROSTER, SEED_SURVEYS } from './data'
import type { AudienceId, RosterEntry } from './data'

/** What the page reads. Derived from the hook so the two cannot drift. */
export type SurveysState = ReturnType<typeof useSurveys>

export function useSurveys() {
  const [query, setQuery] = useState('')
  const [menuFor, setMenuFor] = useState<string | null>(null)

  // The maker takes the whole page over: 'new' for a blank one, an id to edit.
  const [makerFor, setMakerFor] = useState<string | null>(null)

  const [sendFor, setSendFor] = useState<string | null>(null)
  const [audience, setAudience] = useState<AudienceId>('pick')
  const [when, setWhen] = useState('Now')
  // null means "not touched yet" - the default is everyone who can receive it.
  const [picked, setPicked] = useState<Set<number> | null>(null)

  // `toast` is the function and `toastText` the line - this page's own
  // naming, kept so no component of it has to change.
  const { toast: toastText, toastMsg: toast } = useToast(2600)

  const closeOverlays = useCallback(() => setMenuFor((m) => (m ? null : m)), [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SEED_SURVEYS.filter((s) => !q || s.name.toLowerCase().includes(q))
  }, [query])

  const sendSurvey = SEED_SURVEYS.find((s) => s.id === sendFor) || null

  const sendable = ROSTER.filter((p) => p.app)
  const noAppCount = ROSTER.length - sendable.length

  // Everyone who can actually receive it, until you narrow it by hand.
  const pickedSet = useMemo(
    () => picked || new Set(sendable.map((p) => p.id)),
    [picked, sendable],
  )

  const openSend = useCallback((id: string) => {
    setSendFor(id)
    setAudience('pick')
    setWhen('Now')
    setPicked(null)
    setMenuFor(null)
  }, [])

  const togglePicked = useCallback((p: RosterEntry) => {
    if (!p.app) return
    setPicked((cur) => {
      const next = new Set(cur || ROSTER.filter((x) => x.app).map((x) => x.id))
      if (next.has(p.id)) next.delete(p.id)
      else next.add(p.id)
      return next
    })
  }, [])

  // Each audience knows its own count and what it is a count *of*.
  const summary = useMemo(() => {
    const def = AUDIENCES.find((a) => a.id === audience)
    if (audience === 'pick') {
      const n = pickedSet.size
      return {
        count: n,
        title: `${n} ${n === 1 ? 'driver selected' : 'drivers selected'}`,
        sub: `of ${ROSTER.length} shown, ${noAppCount} not selectable`,
        excluded: noAppCount,
      }
    }
    return {
      count: def?.count ?? 0,
      title: `${def?.count ?? 0} drivers selected`,
      sub: def?.ofText ?? '',
      excluded: def?.excluded ?? 0,
    }
  }, [audience, pickedSet, noAppCount])

  const commitSend = useCallback(() => {
    const n = summary.count
    setSendFor(null)
    toast(`Sent to ${n}${n === 1 ? ' driver' : ' drivers'}`)
  }, [summary.count, toast])

  const openMaker = useCallback((id: string) => {
    setMakerFor(id)
    setMenuFor(null)
  }, [])

  const closeMaker = useCallback(
    (message?: string) => {
      setMakerFor(null)
      if (typeof message === 'string') toast(message)
    },
    [toast],
  )

  return {
    query, setQuery, visible,
    menuFor, setMenuFor, closeOverlays,
    makerFor, openMaker, closeMaker,
    makerSurvey:
      makerFor && makerFor !== 'new'
        ? (SEED_SURVEYS.find((s) => s.id === makerFor) ?? null)
        : null,
    sendFor, sendSurvey, openSend, setSendFor,
    audience, setAudience, when, setWhen,
    pickedSet, togglePicked, summary, commitSend,
    toast, toastText,
  }
}
