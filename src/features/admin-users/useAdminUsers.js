import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DA_ORDER,
  DA_STATES,
  INVITE_STAMP,
  ROLES,
  SEAT_CAP,
  SEED_DAS,
  SEED_USERS,
  STATUSES,
  STATUS_ORDER,
} from './data.js'

const EMPTY_FILTERS = { roleFilter: [], statusFilter: [], daFilter: [] }
const EMPTY_FORM = { editId: null, email: '', name: '', mobile: '', role: 'Operations' }

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export function useAdminUsers() {
  const [tab, setTab] = useState('portal')
  const [users, setUsers] = useState(SEED_USERS)
  const [das, setDas] = useState(SEED_DAS)

  const [query, setQuery] = useState('')
  const [daQuery, setDaQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const [sort, setSort] = useState({ col: 'name', dir: 'asc' })
  const [daSort, setDaSort] = useState({ col: 'state', dir: 'asc' })

  const [sel, setSel] = useState([])
  const [daSel, setDaSel] = useState([])

  const [menuFor, setMenuFor] = useState(null)
  const [openDrop, setOpenDrop] = useState(null)

  // Filter drawer. `draft` is what the panel edits; nothing reaches the table
  // until Apply, so a half-built filter never churns the list underneath you.
  const [fpOpen, setFpOpen] = useState(false)
  const [fpQ, setFpQ] = useState('')
  const [draft, setDraft] = useState(null)
  const [collapsed, setCollapsed] = useState([])

  const [form, setForm] = useState(EMPTY_FORM)
  const [formOpen, setFormOpen] = useState(false)
  const [removeId, setRemoveId] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFor, setImportFor] = useState('portal')
  const [importFile, setImportFile] = useState('')
  const [daInviteOpen, setDaInviteOpen] = useState(false)
  const [daInviteSel, setDaInviteSel] = useState([])
  const [daInviteQ, setDaInviteQ] = useState('')
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferTarget, setTransferTarget] = useState(null)
  const [transferEmail, setTransferEmail] = useState('')

  const [toastText, setToastText] = useState('')
  const toastTimer = useRef(null)
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const toast = useCallback((text) => {
    clearTimeout(toastTimer.current)
    setToastText(text)
    toastTimer.current = setTimeout(() => setToastText(''), 2600)
  }, [])

  const closeOverlays = useCallback(() => {
    setMenuFor((m) => (m ? null : m))
    setOpenDrop((d) => (d ? null : d))
  }, [])

  // ---- counts -------------------------------------------------------------
  const activeN = users.filter((u) => u.status === 'Active').length
  const invitedN = users.filter((u) => u.status === 'Invited').length
  const deactN = users.filter((u) => u.status === 'Deactivated').length
  // An invite holds a seat: it is a promise already made.
  const seatsUsed = activeN + invitedN
  const seatsLeft = SEAT_CAP - seatsUsed

  const daActiveN = das.filter((d) => d.state === 'active').length
  const daInvitedN = das.filter((d) => d.state === 'invited').length
  const daNotN = das.filter((d) => d.state === 'not invited').length
  const daNoPhoneN = das.filter((d) => d.state === 'not invited' && !d.phone).length

  // ---- filter drawer ------------------------------------------------------
  // Every section is a multi-select; the drawer is driven off these defs so the
  // two tabs share one panel.
  const filterDefs = useMemo(() => {
    if (tab === 'portal') {
      return [
        {
          id: 'role',
          label: 'Role',
          key: 'roleFilter',
          options: ROLES.map((v) => ({ label: v, value: v, meta: String(users.filter((u) => u.role === v).length) })),
        },
        {
          id: 'status',
          label: 'Status',
          key: 'statusFilter',
          options: STATUSES.map((v) => ({ label: v, value: v, meta: String(users.filter((u) => u.status === v).length) })),
        },
      ]
    }
    return [
      {
        id: 'state',
        label: 'App state',
        key: 'daFilter',
        options: DA_STATES.map((v) => ({ label: cap(v), value: v, meta: String(das.filter((d) => d.state === v).length) })),
      },
    ]
  }, [tab, users, das])

  const activeKeys = filterDefs.map((d) => d.key)
  const applied = activeKeys.some((k) => filters[k].length > 0)
  const draftDirty = draft ? activeKeys.some((k) => draft[k].length > 0) : false

  const openFilters = useCallback(() => {
    setDraft(filters)
    setFpQ('')
    setFpOpen(true)
    setMenuFor(null)
    setOpenDrop(null)
  }, [filters])

  const cancelFilters = useCallback(() => {
    setFpOpen(false)
    setDraft(null)
  }, [])

  const applyFilters = useCallback(() => {
    if (draft) setFilters(draft)
    setFpOpen(false)
    setDraft(null)
  }, [draft])

  const clearDraft = useCallback(() => {
    if (!draftDirty) return
    setDraft((d) => {
      const next = { ...d }
      filterDefs.forEach((def) => {
        next[def.key] = []
      })
      return next
    })
  }, [draftDirty, filterDefs])

  const toggleDraft = useCallback((key, value) => {
    setDraft((d) => {
      const cur = d[key]
      return { ...d, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : cur.concat([value]) }
    })
  }, [])

  const toggleSection = useCallback((id) => {
    setCollapsed((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.concat([id])))
  }, [])

  const clearPortalFilters = useCallback(() => {
    setQuery('')
    setFilters((f) => ({ ...f, roleFilter: [], statusFilter: [] }))
  }, [])

  const clearDaFilters = useCallback(() => {
    setDaQuery('')
    setFilters((f) => ({ ...f, daFilter: [] }))
  }, [])

  // ---- visible rows -------------------------------------------------------
  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out = users.filter(
      (u) =>
        (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)) &&
        (!filters.roleFilter.length || filters.roleFilter.includes(u.role)) &&
        (!filters.statusFilter.length || filters.statusFilter.includes(u.status)),
    )
    const keyOf = (u) =>
      sort.col === 'email' ? u.email
        : sort.col === 'role' ? u.role
        : sort.col === 'mobile' ? u.mobile
        : sort.col === 'last' ? u.lastActive
        : sort.col === 'status' ? STATUS_ORDER[u.status]
        : u.name
    // The owner is pinned to the top whatever the sort — it is the one row that
    // is never just another row.
    return out.slice().sort((a, b) => {
      if (a.role === 'Owner') return -1
      if (b.role === 'Owner') return 1
      const ka = keyOf(a)
      const kb = keyOf(b)
      const c = typeof ka === 'string' ? ka.localeCompare(kb) : ka - kb
      return c * (sort.dir === 'asc' ? 1 : -1)
    })
  }, [users, query, filters.roleFilter, filters.statusFilter, sort])

  const visibleDas = useMemo(() => {
    const q = daQuery.trim().toLowerCase()
    const out = das.filter(
      (d) =>
        (!q || `${d.name} ${d.tid}`.toLowerCase().includes(q)) &&
        (!filters.daFilter.length || filters.daFilter.includes(d.state)),
    )
    const keyOf = (d) =>
      daSort.col === 'name' ? d.name
        : daSort.col === 'tid' ? d.tid
        : daSort.col === 'phone' ? d.phone
        : daSort.col === 'invited' ? d.invitedOn
        : daSort.col === 'seen' ? d.lastSeen
        : DA_ORDER[d.state]
    return out.slice().sort((a, b) => {
      const ka = keyOf(a)
      const kb = keyOf(b)
      const c = typeof ka === 'string' ? ka.localeCompare(kb) : ka - kb
      return c * (daSort.dir === 'asc' ? 1 : -1)
    })
  }, [das, daQuery, filters.daFilter, daSort])

  const sortBy = useCallback((k) => {
    setSort((s) => ({ col: k, dir: s.col === k ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' }))
  }, [])

  const daSortBy = useCallback((k) => {
    setDaSort((s) => ({ col: k, dir: s.col === k ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' }))
  }, [])

  // ---- portal user actions ------------------------------------------------
  const openInvite = useCallback(() => {
    setForm(EMPTY_FORM)
    setFormOpen(true)
    setMenuFor(null)
    setOpenDrop(null)
  }, [])

  const openEdit = useCallback((u) => {
    setForm({
      editId: u.id,
      email: u.email,
      name: u.name,
      mobile: u.mobile === '-' ? '' : u.mobile,
      // The owner's role is not editable, so the picker starts somewhere legal.
      role: u.role === 'Owner' ? 'Operations' : u.role,
    })
    setFormOpen(true)
    setMenuFor(null)
    setOpenDrop(null)
  }, [])

  const patchForm = useCallback((p) => setForm((f) => ({ ...f, ...p })), [])

  const editingOwner = form.editId
    ? (users.find((u) => u.id === form.editId) || {}).role === 'Owner'
    : false

  const canSubmitForm = !!(
    form.email.trim() &&
    form.name.trim() &&
    (form.editId ? true : seatsUsed < SEAT_CAP)
  )

  const submitForm = useCallback(() => {
    const email = form.email.trim()
    const name = form.name.trim()
    if (!email || !name) return
    if (form.editId) {
      if (users.some((u) => u.id !== form.editId && u.email.toLowerCase() === email.toLowerCase())) {
        toast('That email already has a row')
        return
      }
      setUsers((us) =>
        us.map((u) =>
          u.id === form.editId
            ? { ...u, name, email, mobile: form.mobile.trim() || '-', role: u.role === 'Owner' ? 'Owner' : form.role }
            : u,
        ),
      )
      setFormOpen(false)
      toast(`Saved: ${name}`)
      return
    }
    if (seatsUsed >= SEAT_CAP) {
      toast('No seats left - add seats on Billing & Subscription')
      return
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      toast('That email already has a row - reactivate it instead')
      return
    }
    setUsers((us) =>
      us.concat([{ id: Date.now(), name, mobile: form.mobile.trim() || '-', email, role: form.role, lastActive: '-', status: 'Invited' }]),
    )
    setFormOpen(false)
    toast(`Invite sent: ${email}`)
  }, [form, users, seatsUsed, toast])

  const setStatus = useCallback((ids, status, message) => {
    setUsers((us) => us.map((u) => (ids.includes(u.id) ? { ...u, status } : u)))
    setSel((s) => s.filter((x) => !ids.includes(x)))
    setMenuFor(null)
    toast(message)
  }, [toast])

  const removeUser = useCallback(() => {
    const u = users.find((x) => x.id === removeId)
    setUsers((us) => us.filter((v) => v.id !== removeId))
    setSel((s) => s.filter((x) => x !== removeId))
    setRemoveId(null)
    if (u) toast(`Removed: ${u.name}`)
  }, [users, removeId, toast])

  const setRole = useCallback((ids, role) => {
    const n = ids.length
    setUsers((us) => us.map((u) => (ids.includes(u.id) && u.role !== 'Owner' ? { ...u, role } : u)))
    setSel([])
    setOpenDrop(null)
    toast(`Role set to ${role} · ${n} ${n === 1 ? 'user' : 'users'}`)
  }, [toast])

  const toggleSel = useCallback((id) => {
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.concat([id])))
  }, [])

  // ---- transfer ownership -------------------------------------------------
  // Only an active, non-owner account can take it.
  const transferTargets = useMemo(
    () => users.filter((u) => u.status === 'Active' && u.role !== 'Owner'),
    [users],
  )
  const transferPick = transferTargets.find((t) => t.id === transferTarget) || null
  const transferReady = !!transferPick && transferEmail === transferPick.email

  const openTransfer = useCallback(() => {
    setTransferOpen(true)
    setTransferTarget(null)
    setTransferEmail('')
    setMenuFor(null)
  }, [])

  const commitTransfer = useCallback(() => {
    if (!transferReady) return
    setUsers((us) =>
      us.map((u) =>
        u.role === 'Owner' ? { ...u, role: 'Sub Admin' } : u.id === transferPick.id ? { ...u, role: 'Owner' } : u,
      ),
    )
    setTransferOpen(false)
    toast(`Ownership transferred to ${transferPick.name}`)
  }, [transferReady, transferPick, toast])

  // ---- DA actions ---------------------------------------------------------
  const setDaState = useCallback((ids, patch, message) => {
    setDas((ds) => ds.map((d) => (ids.includes(d.id) ? { ...d, ...patch } : d)))
    setDaSel((s) => s.filter((x) => !ids.includes(x)))
    setMenuFor(null)
    toast(message)
  }, [toast])

  const toggleDaSel = useCallback((id) => {
    setDaSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.concat([id])))
  }, [])

  // An invite goes by text, so a driver with no number on file cannot get one.
  const inviteAll = useCallback(() => {
    const ids = das.filter((d) => d.state === 'not invited' && d.phone).map((d) => d.id)
    setDas((ds) =>
      ds.map((d) => (ids.includes(d.id) ? { ...d, state: 'invited', invitedOn: INVITE_STAMP } : d)),
    )
    toast(`Invites sent · skipped ${daNoPhoneN} with no number on file`)
  }, [das, daNoPhoneN, toast])

  const openDaInvite = useCallback(() => {
    setDaInviteOpen(true)
    setDaInviteSel([])
    setDaInviteQ('')
    setMenuFor(null)
    setOpenDrop(null)
  }, [])

  const daInviteCandidates = useMemo(() => {
    const q = daInviteQ.trim().toLowerCase()
    return das.filter((d) => d.state === 'not invited' && (!q || `${d.name} ${d.tid}`.toLowerCase().includes(q)))
  }, [das, daInviteQ])

  const toggleDaInvite = useCallback((d) => {
    if (!d.phone) {
      toast('No number on file - the invite goes by text')
      return
    }
    setDaInviteSel((s) => (s.includes(d.id) ? s.filter((x) => x !== d.id) : s.concat([d.id])))
  }, [toast])

  const commitDaInvite = useCallback(() => {
    const n = daInviteSel.length
    if (!n) return
    setDas((ds) =>
      ds.map((d) => (daInviteSel.includes(d.id) ? { ...d, state: 'invited', invitedOn: INVITE_STAMP } : d)),
    )
    setDaInviteOpen(false)
    setDaInviteSel([])
    toast(n === 1 ? 'Invite sent by text' : `${n} invites sent by text`)
  }, [daInviteSel, toast])

  // ---- import -------------------------------------------------------------
  const openImport = useCallback((forWhat) => {
    setImportFor(forWhat)
    setImportFile('')
    setImportOpen(true)
    setMenuFor(null)
    setOpenDrop(null)
  }, [])

  const commitImport = useCallback(() => {
    if (!importFile) return
    setImportOpen(false)
    toast(`Imported ${importFile}${importFor === 'da' ? ' · roster updated' : ' · new rows arrive as Invited'}`)
  }, [importFile, importFor, toast])

  return {
    tab, setTab,
    users, das,
    query, setQuery, daQuery, setDaQuery,
    filters, applied,
    sort, sortBy, daSort, daSortBy,
    sel, toggleSel, daSel, toggleDaSel,
    menuFor, setMenuFor, openDrop, setOpenDrop, closeOverlays,
    visibleUsers, visibleDas,
    activeN, invitedN, deactN, seatsUsed, seatsLeft,
    daActiveN, daInvitedN, daNotN, daNoPhoneN,
    filterDefs, fpOpen, fpQ, setFpQ, draft, draftDirty, collapsed,
    openFilters, cancelFilters, applyFilters, clearDraft, toggleDraft, toggleSection,
    clearPortalFilters, clearDaFilters,
    form, patchForm, formOpen, setFormOpen, openInvite, openEdit, editingOwner, canSubmitForm, submitForm,
    setStatus, setRole, removeId, setRemoveId, removeUser,
    transferOpen, setTransferOpen, transferTargets, transferTarget, setTransferTarget,
    transferEmail, setTransferEmail, transferPick, transferReady, openTransfer, commitTransfer,
    setDaState, inviteAll, daInviteOpen, setDaInviteOpen, openDaInvite,
    daInviteQ, setDaInviteQ, daInviteSel, daInviteCandidates, toggleDaInvite, commitDaInvite,
    importOpen, setImportOpen, importFor, importFile, setImportFile, openImport, commitImport,
    toast, toastText,
  }
}
