'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CHAT_SEED, EVERYONE, ROSTER, matchName, tenDigits } from './data'
import type { ChatMsg } from './data'

export type DialerTab = 'history' | 'contacts' | 'keypad' | 'messages' | 'status'

/** Who is being dialled, and how far the call has got. */
export interface ActiveCall {
  name: string
  num: string
  phase: 'dialing' | 'connected'
  route: string | null
}

/** The name above the number field, when the call came from somewhere. */
export interface DialContext {
  name: string
  local: string | null
}

export interface CallLog {
  name: string
  dur: string
  outcome: string
  hasNote: boolean
}

/** Where another page asks the dialer to call somebody. */
export interface DialRequest {
  number?: string
  name?: string
  local?: string
  route?: string
}

const STORE_KEY = 'udsp.dialer'

/** Local wall-clock as `HH:MM`. Only ever called from an event handler. */
const clock = (): string => new Date().toTimeString().slice(0, 5)

export function useDialer() {
  // Open state and the drag offset survive a reload, so the dialer stays where
  // it was put. They are read after mount: the server has no localStorage, and
  // rendering the card on the first paint would not match the server's markup.
  const [open, setOpen] = useState(false)
  const [drag, setDrag] = useState({ x: 0, y: 0 })

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
      /* eslint-disable react/set-state-in-effect -- localStorage IS the external
         system this effect synchronises with. The first paint has to match the
         server's markup, so what was stored can only land after mount. */
      if (saved.open) setOpen(true)
      if (saved.dx || saved.dy) setDrag({ x: saved.dx || 0, y: saved.dy || 0 })
      /* eslint-enable react/set-state-in-effect */
    } catch {
      // A corrupt entry just means the dialer opens closed at its default spot.
    }
  }, [])

  const [tab, setTab] = useState<DialerTab>('keypad')
  const [line, setLine] = useState(0)
  const [linesOpen, setLinesOpen] = useState(false)

  const [digits, setDigits] = useState('')
  const [context, setContext] = useState<DialContext | null>(null)

  const [call, setCall] = useState<ActiveCall | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [mute, setMute] = useState(false)
  const [hold, setHold] = useState(false)
  const [dtmf, setDtmf] = useState(false)
  const [dtmfSent, setDtmfSent] = useState('')
  const [transferPick, setTransferPick] = useState(false)
  const [transferTo, setTransferTo] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const [lastLog, setLastLog] = useState<CallLog | null>(null)

  const [cQuery, setCQuery] = useState('')
  const [status, setStatus] = useState<'available' | 'busy'>('available')
  const [chatWith, setChatWith] = useState<string | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [sentMsgs, setSentMsgs] = useState<Record<string, ChatMsg[]>>({})

  const ringTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const transferTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatScroller = useRef<HTMLDivElement | null>(null)

  const persist = useCallback((next: { open?: boolean; x?: number; y?: number }) => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          open: next.open ?? saved.open ?? false,
          dx: next.x ?? saved.dx ?? 0,
          dy: next.y ?? saved.dy ?? 0,
        }),
      )
    } catch {
      // Storage being unavailable costs the memory of where the card sat.
    }
  }, [])

  const toggle = useCallback(() => {
    setOpen((v) => {
      persist({ open: !v })
      return !v
    })
    setLinesOpen(false)
  }, [persist])

  // ---- the call ------------------------------------------------------------

  /**
   * Ring for a beat, then connect and start the clock. The timer stops while
   * the call is on hold, which is why it reads `hold` through a ref-free
   * updater rather than closing over it.
   */
  const connect = useCallback((name: string, num: string, route: string | null) => {
    if (ringTimer.current) clearTimeout(ringTimer.current)
    if (tickTimer.current) clearInterval(tickTimer.current)
    setCall({ name, num, phase: 'dialing', route })
    setSeconds(0)
    setMute(false); setHold(false); setDtmf(false); setDtmfSent('')
    setTransferPick(false); setTransferTo(null); setNotice('')
    setNote(''); setSavedNote(''); setLastLog(null)

    ringTimer.current = setTimeout(() => {
      ringTimer.current = null
      setCall((c) => (c && c.phase === 'dialing' ? { ...c, phase: 'connected' } : c))
      tickTimer.current = setInterval(() => setSeconds((n) => n + 1), 1000)
    }, 1600)
  }, [])

  // Hold pauses the clock rather than stopping it, so the duration keeps the
  // time already spent connected.
  useEffect(() => {
    if (!call || call.phase !== 'connected') return
    if (hold) {
      if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null }
      return
    }
    if (!tickTimer.current) tickTimer.current = setInterval(() => setSeconds((n) => n + 1), 1000)
  }, [call, hold])

  useEffect(
    () => () => {
      if (ringTimer.current) clearTimeout(ringTimer.current)
      if (tickTimer.current) clearInterval(tickTimer.current)
      if (transferTimer.current) clearTimeout(transferTimer.current)
    },
    [],
  )

  /** Put a person in the number field without calling them yet. */
  const dialPerson = useCallback((name: string, num: string, local?: string | null) => {
    setTab('keypad')
    setChatWith(null)
    setDigits(num.replace(/\D/g, '').slice(-10))
    setContext({ name, local: local ?? null })
    setLastLog(null)
  }, [])

  const startCall = useCallback(() => {
    if (digits.length !== 10) return
    const person = ROSTER.find((p) => p.num.replace(/\D/g, '') === digits)
    connect(context ? context.name : matchName(digits), digits, person?.route ?? null)
  }, [digits, context, connect])

  const endCall = useCallback(() => {
    if (!call) return
    if (ringTimer.current) { clearTimeout(ringTimer.current); ringTimer.current = null }
    if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null }
    if (transferTimer.current) { clearTimeout(transferTimer.current); transferTimer.current = null }
    setLastLog({
      name: call.name,
      dur: `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`,
      outcome: 'answered',
      hasNote: !!(savedNote || note.trim()),
    })
    setCall(null)
    setDtmf(false); setTransferPick(false); setTransferTo(null); setNotice('')
    setDigits(''); setContext(null); setTab('keypad'); setNote(''); setSavedNote('')
  }, [call, seconds, savedNote, note])

  /**
   * Warm transfer. Nobody on the other end actually picks up, so after six
   * seconds the caller comes back with a line explaining why.
   */
  const transferTo_ = useCallback((name: string, backLine: string) => {
    setTransferPick(false)
    setTransferTo(name)
    setNotice('')
    if (transferTimer.current) clearTimeout(transferTimer.current)
    transferTimer.current = setTimeout(() => {
      transferTimer.current = null
      setTransferTo((cur) => {
        if (cur !== name) return cur
        setNotice(backLine)
        return null
      })
    }, 6000)
  }, [])

  const cancelTransfer = useCallback(() => {
    if (transferTimer.current) { clearTimeout(transferTimer.current); transferTimer.current = null }
    setTransferTo(null)
    setNotice('')
  }, [])

  // ---- the keypad ----------------------------------------------------------

  const press = useCallback(
    (d: string) => {
      if (call) { setDtmfSent((s) => s + d); return }
      if (!/[0-9]/.test(d)) return
      setDigits((s) => {
        if (s.length >= 10) return s
        // Typing over a number somebody else picked drops their name.
        if (s) setContext(null)
        return s + d
      })
    },
    [call],
  )

  const backspace = useCallback(() => {
    setDigits((s) => s.slice(0, -1))
    setContext(null)
  }, [])

  const typeNumber = useCallback((raw: string) => {
    const next = tenDigits(raw)
    setDigits((cur) => {
      if (next !== cur) setContext(null)
      return next
    })
  }, [])

  // ---- messages ------------------------------------------------------------

  const chatMsgs = useMemo(
    () => (chatWith ? [...(CHAT_SEED[chatWith] ?? []), ...(sentMsgs[chatWith] ?? [])] : []),
    [chatWith, sentMsgs],
  )

  const sendChat = useCallback(() => {
    const text = chatDraft.trim()
    if (!text || !chatWith) return
    setSentMsgs((m) => ({ ...m, [chatWith]: [...(m[chatWith] ?? []), { isIn: false, text, time: clock() }] }))
    setChatDraft('')
  }, [chatDraft, chatWith])

  // A new message should be the one you can see.
  useEffect(() => {
    const el = chatScroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chatMsgs])

  const chatCall = useCallback(() => {
    if (!chatWith) return
    const p = EVERYONE().find((x) => x.name === chatWith)
    if (p) dialPerson(p.name, p.num, `local ${clock()}`)
  }, [chatWith, dialPerson])

  // ---- other pages asking for a call --------------------------------------

  useEffect(() => {
    const onDial = (e: Event) => {
      const d = (e as CustomEvent<DialRequest>).detail ?? {}
      setOpen(true)
      persist({ open: true })
      setTab('keypad')
      setChatWith(null)
      setDigits((d.number ?? '').replace(/\D/g, '').slice(-10))
      setContext(d.name ? { name: d.name, local: d.local ?? null } : null)
    }
    window.addEventListener('udsp-dial', onDial)
    return () => window.removeEventListener('udsp-dial', onDial)
  }, [persist])

  return {
    open, toggle, drag, setDrag, persist,
    tab, setTab,
    line, setLine, linesOpen, setLinesOpen,
    digits, setDigits, context, press, backspace, typeNumber,
    call, seconds, startCall, endCall, connect, dialPerson,
    mute, setMute, hold, setHold, dtmf, setDtmf, dtmfSent,
    transferPick, setTransferPick, transferTo, transferTo_, cancelTransfer,
    notice, note, setNote, savedNote, setSavedNote, lastLog, setLastLog,
    cQuery, setCQuery, status, setStatus,
    chatWith, setChatWith, chatDraft, setChatDraft, chatMsgs, sendChat, chatCall, chatScroller,
  }
}

export type DialerState = ReturnType<typeof useDialer>
