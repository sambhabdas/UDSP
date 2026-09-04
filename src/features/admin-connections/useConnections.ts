import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../ds/hooks'
import {
  IMAP,
  NUMBER_POOL,
  RESERVE_STAMP,
  SEED_LINES,
  SEED_RESERVED,
  TTS,
  USER_POOL,
} from './data'
import type { Line, LineSortKey, ReservedNumber, TabId } from './data'

/** The mailbox connect form - OAuth needs only the address; IMAP needs the
 *  host, port and credentials. */
export interface MailForm {
  provider: string
  email: string
  host: string
  port: string
  user: string
  pass: string
  name: string
  sync: string
}

/** The add-line form, plus the number picker's own search state. */
export interface AddLineForm {
  name: string
  number: string | null
  numQuery: string
  area: string
  areaQuery: string
  assign: string
  user: string | null
}

/** The reserve-number form. */
export interface ReserveForm {
  number: string | null
  query: string
  area: string
  areaQuery: string
}

/** What the tabs read. Derived from the hook so the two cannot drift. */
export type ConnectionsState = ReturnType<typeof useConnections>

const KEY_DOTS = '••••••••••••'
const PUNCH_SAMPLES: Record<string, string> = { clientId: 'CR-PAYCOM-4471', apiKey: KEY_DOTS }

const EMPTY_MAIL_FORM: MailForm = {
  provider: '',
  email: '',
  host: '',
  port: '',
  user: '',
  pass: '',
  name: '',
  sync: 'Last 90 days',
}

const EMPTY_ADD_LINE: AddLineForm = {
  name: '',
  number: null,
  numQuery: '',
  area: 'All',
  areaQuery: '',
  assign: 'Dispatch',
  user: null,
}

export function useConnections() {
  const [tab, setTab] = useState<TabId>('punch')

  // ---- punch --------------------------------------------------------------
  const [provider, setProvider] = useState('Paycom')
  const [clientId, setClientId] = useState(PUNCH_SAMPLES.clientId)
  const [apiKey, setApiKey] = useState(KEY_DOTS)
  const [env, setEnv] = useState('Production')
  const [interval, setIntervalValue] = useState('Every 15 min')
  const [testResult, setTestResult] = useState('')
  const lastSync = 'Today 05:45'

  // ---- mailbox ------------------------------------------------------------
  const [mailConnected, setMailConnected] = useState(true)
  const [mailAddr, setMailAddr] = useState('dispatch@cedarridge.com')
  const [mailProvider, setMailProvider] = useState('Google Workspace')
  const [mailForm, setMailForm] = useState(EMPTY_MAIL_FORM)
  const [mailOpen, setMailOpen] = useState(false)
  const [mailTest, setMailTest] = useState('')

  // ---- lines --------------------------------------------------------------
  const [lines, setLines] = useState(SEED_LINES)
  const [reserved, setReserved] = useState<ReservedNumber[]>(SEED_RESERVED)
  const [lnQuery, setLnQuery] = useState('')
  const [lnSort, setLnSort] = useState<{ col: LineSortKey; dir: 'asc' | 'desc' }>({
    col: 'name',
    dir: 'asc',
  })
  const [drawerFor, setDrawerFor] = useState<number | null>(null)
  // Line rows key by id; reserved rows key by `rsv-<number>`, so the two tables
  // cannot open each other's menus.
  const [menuFor, setMenuFor] = useState<number | string | null>(null)
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const [deleteFor, setDeleteFor] = useState<number | null>(null)
  const [delText, setDelText] = useState('')

  const [rsvQuery, setRsvQuery] = useState('')
  const [releaseFor, setReleaseFor] = useState<string | null>(null)
  const [reserveOpen, setReserveOpen] = useState(false)
  const [rv, setRv] = useState<ReserveForm>({ number: null, query: '', area: 'All', areaQuery: '' })

  const [addOpen, setAddOpen] = useState(false)
  const [al, setAl] = useState(EMPTY_ADD_LINE)

  // `toast` is the function and `toastText` the line - this page's own naming.
  const { toast: toastText, toastMsg: toast } = useToast(2600)
  type Timer = ReturnType<typeof setTimeout> | undefined
  const testTimer = useRef<Timer>(undefined)
  const mailTestTimer = useRef<Timer>(undefined)
  useEffect(
    () => () => {
      clearTimeout(testTimer.current)
      clearTimeout(mailTestTimer.current)
    },
    [],
  )

  const closeOverlays = useCallback(() => {
    setMenuFor((m) => (m ? null : m))
    setOpenDrop((d) => (d ? null : d))
  }, [])

  const punchConnected = provider !== 'Not connected'

  const pickProvider = useCallback(
    (v: string) => {
      if (v === provider) return
      setProvider(v)
      toast(
        v === 'Not connected'
          ? 'Disconnected - the file import is now the only intake'
          : `Provider set to ${v} - old credentials discarded`,
      )
    },
    [provider, toast],
  )

  // Example credentials step aside on focus and come back if left blank.
  const sampleProps = useCallback(
    (key: string, value: string, setter: (v: string) => void) => ({
      onFocus: () => {
        if (value === PUNCH_SAMPLES[key]) setter('')
      },
      onBlur: () => {
        if (!String(value).trim()) setter(PUNCH_SAMPLES[key])
      },
    }),
    [],
  )

  const testConnection = useCallback(() => {
    setTestResult('Connection ok · read-only, nothing written')
    clearTimeout(testTimer.current)
    testTimer.current = setTimeout(() => setTestResult(''), 3200)
  }, [])

  // ---- mailbox actions ----------------------------------------------------
  const beginMailConnect = useCallback((name: string) => {
    setMailForm({ ...EMPTY_MAIL_FORM, provider: name })
    setMailTest('')
    setMailOpen(true)
  }, [])

  const patchMail = useCallback((p: Partial<MailForm>) => setMailForm((m) => ({ ...m, ...p })), [])

  const mailIsOauth = mailForm.provider !== IMAP
  const mailReady = mailIsOauth
    ? mailForm.email.includes('@')
    : !!(mailForm.host.trim() && mailForm.port.trim() && mailForm.user.trim() && mailForm.pass.trim())

  const testMail = useCallback(() => {
    if (!mailReady) return
    setMailTest('Connection ok · read and send verified')
    clearTimeout(mailTestTimer.current)
    mailTestTimer.current = setTimeout(() => setMailTest(''), 3200)
  }, [mailReady])

  const commitMail = useCallback(() => {
    if (!mailReady) return
    const addr = mailIsOauth
      ? mailForm.email.trim()
      : mailForm.user.includes('@')
        ? mailForm.user.trim()
        : `${mailForm.user.trim()}@${mailForm.host.trim().replace(/^imap\./, '')}`
    setMailConnected(true)
    setMailAddr(addr)
    setMailProvider(mailForm.provider)
    setMailOpen(false)
    setMailTest('')
    toast(`Connected: ${addr}`)
  }, [mailReady, mailIsOauth, mailForm, toast])

  const disconnectMail = useCallback(() => {
    setMailConnected(false)
    toast('Mailbox disconnected - every message already in the Inbox is kept')
  }, [toast])

  // ---- line actions -------------------------------------------------------
  const visibleLines = useMemo(() => {
    const q = lnQuery.trim().toLowerCase()
    const rows = lines.filter((l) => !q || `${l.name} ${l.number} ${l.assigned || ''}`.toLowerCase().includes(q))
    const keyOf = (l: Line): string | number =>
      lnSort.col === 'number' ? l.number
        : lnSort.col === 'assigned' ? l.assigned || ''
        : lnSort.col === 'na' ? l.noAnswer
        : lnSort.col === 'default' ? (l.isDefault ? 0 : 1)
        : l.name
    return rows.slice().sort((a, b) => {
      const ka = keyOf(a)
      const kb = keyOf(b)
      const c = typeof ka === 'string' ? ka.localeCompare(kb as string) : ka - (kb as number)
      return c * (lnSort.dir === 'asc' ? 1 : -1)
    })
  }, [lines, lnQuery, lnSort])

  const sortLines = useCallback((k: LineSortKey) => {
    setLnSort((s) => ({ col: k, dir: s.col === k ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' }))
  }, [])

  const patchLine = useCallback((id: number, p: Partial<Line>) => {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...p } : l)))
  }, [])

  const setDefaultLine = useCallback(
    (l: Line) => {
      setLines((ls) => ls.map((v) => ({ ...v, isDefault: v.id === l.id })))
      setMenuFor(null)
      toast(`Default line: ${l.name}`)
    },
    [toast],
  )

  // Deleting a line takes its forwards with it - any other line pointing at it
  // falls back to voicemail rather than forwarding into nothing.
  const dropLine = useCallback(
    (id: number) => {
      setLines((ls) => {
        const gone = ls.find((l) => l.id === id)
        if (!gone) return ls
        return ls
          .filter((l) => l.id !== id)
          .map((l) =>
            l.noAnswer === `Forward to ${gone.name}` ? { ...l, noAnswer: 'Voicemail' } : l,
          )
      })
      return lines.find((l) => l.id === id)
    },
    [lines],
  )

  const deleteLine = useCallback(() => {
    const l = lines.find((x) => x.id === deleteFor)
    if (!l || deleteFor === null || delText.trim() !== l.name) return
    dropLine(deleteFor)
    setDeleteFor(null)
    setDelText('')
    toast(`Deleted ${l.name} - call history kept, number released`)
  }, [lines, deleteFor, delText, dropLine, toast])

  // The escape hatch: keep the number, drop the line.
  const moveToReserved = useCallback(() => {
    const l = lines.find((x) => x.id === deleteFor)
    if (!l || deleteFor === null) return
    dropLine(deleteFor)
    setReserved((r) => r.concat([{ number: l.number, since: RESERVE_STAMP }]))
    setDeleteFor(null)
    setDelText('')
    toast(`Moved to reserved · ${l.number}`)
  }, [lines, deleteFor, dropLine, toast])

  const memberPool = useCallback(
    (l: Line) => USER_POOL.filter((p) => !l.members.some((m) => m.name === p[0])),
    [],
  )

  // ---- numbers ------------------------------------------------------------
  const heldNumbers = useMemo(() => lines.map((l) => l.number), [lines])
  const reservedNumbers = useMemo(() => reserved.map((r) => r.number), [reserved])

  // Reserving offers only numbers nobody holds. Adding a line offers the
  // reserved ones first, because that is what reserving them was for.
  const freePool = useMemo(
    () => NUMBER_POOL.filter((n) => !reservedNumbers.includes(n) && !heldNumbers.includes(n)),
    [reservedNumbers, heldNumbers],
  )
  const addPool = useMemo(
    () => reservedNumbers.concat(NUMBER_POOL.filter((n) => !reservedNumbers.includes(n))).filter((n) => !heldNumbers.includes(n)),
    [reservedNumbers, heldNumbers],
  )

  const filterNumbers = (pool: string[], area: string, query: string) => {
    const q = query.trim().replace(/\s/g, '')
    return pool.filter((n) => (area === 'All' || n.split(' ')[1] === area) && (!q || n.replace(/\s/g, '').includes(q)))
  }

  const areaOptions = (pool: string[], areaQuery: string) => {
    const aq = areaQuery.trim()
    return ['All']
      .concat(Array.from(new Set(pool.map((n) => n.split(' ')[1]))))
      .filter((a) => !aq || (a !== 'All' && a.indexOf(aq) === 0))
  }

  const visibleReserved = useMemo(() => {
    const q = rsvQuery.trim().replace(/\s/g, '')
    return reserved.filter((r) => !q || r.number.replace(/\s/g, '').includes(q))
  }, [reserved, rsvQuery])

  const openReserve = useCallback(() => {
    setRv({ number: null, query: '', area: 'All', areaQuery: '' })
    setReserveOpen(true)
    setMenuFor(null)
    setOpenDrop(null)
  }, [])

  const commitReserve = useCallback(() => {
    const number = rv.number
    if (!number) return
    setReserved((r) => r.concat([{ number, since: RESERVE_STAMP }]))
    setReserveOpen(false)
    toast(`Reserved · ${rv.number}`)
  }, [rv.number, toast])

  const commitRelease = useCallback(() => {
    const n = releaseFor
    setReserved((r) => r.filter((x) => x.number !== n))
    setReleaseFor(null)
    toast(`Released ${n} back to the provider`)
  }, [releaseFor, toast])

  // ---- add line -----------------------------------------------------------
  const openAddLine = useCallback((number?: string | null) => {
    setAl({ ...EMPTY_ADD_LINE, number: number || null })
    setAddOpen(true)
    setMenuFor(null)
    setOpenDrop(null)
  }, [])

  const patchAl = useCallback((p: Partial<AddLineForm>) => setAl((a) => ({ ...a, ...p })), [])

  const addReady = !!(al.name.trim() && al.number && (al.assign !== 'User' || al.user))

  const commitAddLine = useCallback(() => {
    if (!addReady || !al.number) return
    const assigned = al.assign === 'User' ? al.user : al.assign
    const name = al.name.trim()
    setLines((ls) =>
      ls.concat([
        {
          id: Date.now(),
          name,
          number: al.number as string,
          noAnswer: 'Voicemail',
          vm: 'Default greeting',
          isDefault: false,
          greeting: TTS,
          callerId: name,
          assigned: assigned as string,
          members: [],
          greetScript: `You have reached ${name}. Leave a message.`,
        },
      ]),
    )
    // A reserved number that becomes a line stops being reserved.
    setReserved((r) => r.filter((x) => x.number !== al.number))
    setAddOpen(false)
    toast(`Line connected · ${al.number}`)
  }, [addReady, al, toast])

  return {
    tab, setTab,
    provider, punchConnected, pickProvider,
    clientId, setClientId, apiKey, setApiKey, env, setEnv,
    interval, setIntervalValue, testResult, testConnection, lastSync, sampleProps,
    mailConnected, mailAddr, mailProvider, disconnectMail,
    mailForm, patchMail, mailOpen, setMailOpen, beginMailConnect,
    mailIsOauth, mailReady, mailTest, testMail, commitMail,
    lines, visibleLines, lnQuery, setLnQuery, lnSort, sortLines,
    drawerFor, setDrawerFor, menuFor, setMenuFor, openDrop, setOpenDrop,
    patchLine, setDefaultLine, memberPool,
    deleteFor, setDeleteFor, delText, setDelText, deleteLine, moveToReserved,
    reserved, visibleReserved, rsvQuery, setRsvQuery,
    releaseFor, setReleaseFor, commitRelease,
    reserveOpen, setReserveOpen, rv, setRv, openReserve, commitReserve,
    addOpen, setAddOpen, al, patchAl, openAddLine, addReady, commitAddLine,
    freePool, addPool, reservedNumbers, filterNumbers, areaOptions,
    closeOverlays, toast, toastText,
  }
}
