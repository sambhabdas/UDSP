import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SEED_CONTACTS, SEED_REASONS } from './data.js'

const EMPTY_FORM = {
  editId: null,
  who: '',
  title: '',
  phone: '',
  shown: true,
  reasons: [],
  query: '',
  cat: 'All',
  collapsed: [],
  newReason: '',
  newCat: '',
  chosenOpen: false,
}

export function useAdminContacts() {
  const [reasons, setReasons] = useState(SEED_REASONS)
  const [contacts, setContacts] = useState(SEED_CONTACTS)

  // Directory
  const [q, setQ] = useState('')
  const [reasonFilter, setReasonFilter] = useState([])
  const [rdQ, setRdQ] = useState('')
  const [sort, setSort] = useState({ col: 'order', dir: 'asc' })
  const [openDrop, setOpenDrop] = useState(null)
  const [menuFor, setMenuFor] = useState(null)

  // Reasons panel
  const [vq, setVq] = useState('')
  const [vCat, setVCat] = useState('All')
  const [vCollapsed, setVCollapsed] = useState([])
  const [vSelIds, setVSelIds] = useState([])
  const [vcNew, setVcNew] = useState('')

  // Categories invented in this session, before any reason uses them
  const [extraCats, setExtraCats] = useState([])

  // Form + dialogs
  const [form, setForm] = useState(EMPTY_FORM)
  const [formOpen, setFormOpen] = useState(false)
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [newCatOpen, setNewCatOpen] = useState(false)
  const [ncNew, setNcNew] = useState('')
  const [rename, setRename] = useState({ id: null, val: '' })
  const [delFor, setDelFor] = useState(null)
  const [toastText, setToastText] = useState('')

  const toastTimer = useRef(null)
  const dragId = useRef(null)
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const toast = useCallback((text) => {
    clearTimeout(toastTimer.current)
    setToastText(text)
    toastTimer.current = setTimeout(() => setToastText(''), 2600)
  }, [])

  const live = useMemo(() => reasons.filter((r) => !r.retired), [reasons])
  const nameOf = useCallback(
    (id) => (reasons.find((r) => r.id === id) || {}).name || '',
    [reasons],
  )

  // A reason's reach: how many contacts hold it, and how many of those the
  // driver can actually see.
  const countFor = useCallback(
    (rid) => contacts.filter((c) => c.reasons.includes(rid)).length,
    [contacts],
  )
  const visibleCountFor = useCallback(
    (rid) => contacts.filter((c) => c.shown && c.reasons.includes(rid)).length,
    [contacts],
  )

  // Every category in play — from live reasons plus any invented this session.
  const categories = useMemo(() => {
    const out = []
    reasons.forEach((r) => {
      if (!r.retired && !out.includes(r.cat)) out.push(r.cat)
    })
    extraCats.forEach((c) => {
      if (!out.includes(c)) out.push(c)
    })
    return out
  }, [reasons, extraCats])

  // Categories including retired reasons' — the Reasons panel still lists them.
  const allCategories = useMemo(() => {
    const out = []
    reasons.forEach((r) => {
      if (!out.includes(r.cat)) out.push(r.cat)
    })
    extraCats.forEach((c) => {
      if (!out.includes(c)) out.push(c)
    })
    return out
  }, [reasons, extraCats])

  const closeOverlays = useCallback(() => {
    setMenuFor((m) => (m ? null : m))
    setOpenDrop((d) => (d ? null : d))
    setRdQ((v) => (v ? '' : v))
  }, [])

  const toggleDrop = useCallback(
    (name) => (e) => {
      e.stopPropagation()
      setMenuFor(null)
      setOpenDrop((d) => (d === name ? null : name))
    },
    [],
  )

  const openForm = useCallback((c) => {
    setForm(
      c
        ? { ...EMPTY_FORM, editId: c.id, who: c.who, title: c.title, phone: c.phone, shown: c.shown, reasons: c.reasons.slice() }
        : EMPTY_FORM,
    )
    setFormOpen(true)
    setMenuFor(null)
    setOpenDrop(null)
    setPhoneOpen(false)
    setNewCatOpen(false)
    setRename({ id: null, val: '' })
  }, [])

  const patchForm = useCallback((p) => setForm((f) => ({ ...f, ...p })), [])

  const toggleFormReason = useCallback(
    (rid) =>
      setForm((f) => ({
        ...f,
        reasons: f.reasons.includes(rid) ? f.reasons.filter((v) => v !== rid) : f.reasons.concat([rid]),
      })),
    [],
  )

  // Renaming a reason renames it everywhere it is held — the name is the thing
  // drivers read, so it cannot diverge per contact.
  const commitRename = useCallback(
    (r) => {
      const v = rename.val.trim()
      const clash = reasons.some((x) => x.id !== r.id && x.name.toLowerCase() === v.toLowerCase())
      if (v && !clash) {
        setReasons((rs) => rs.map((z) => (z.id === r.id ? { ...z, name: v } : z)))
        if (v !== r.name) toast('Renamed on every contact that holds it')
      }
      setRename({ id: null, val: '' })
    },
    [rename.val, reasons, toast],
  )

  // Adding a category by name: matching an existing one selects it rather than
  // creating a near-duplicate.
  const resolveCategory = useCallback(
    (raw, onPick) => {
      const v = raw.trim()
      if (!v) return
      const match = allCategories.find((c) => c.toLowerCase() === v.toLowerCase())
      if (match) {
        onPick(match)
        return
      }
      setExtraCats((cs) => cs.concat([v]))
      onPick(v)
      toast(`Category added: ${v}`)
    },
    [allCategories, toast],
  )

  const addReason = useCallback(() => {
    const name = form.newReason.trim()
    if (!name) return
    if (reasons.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      toast('That reason already exists')
      return
    }
    const effective = form.newCat.trim() || (form.cat === 'All' ? 'Other' : form.cat)
    const match = allCategories.find((c) => c.toLowerCase() === effective.toLowerCase())
    const id = Date.now()
    setReasons((rs) => rs.concat([{ id, name, urgent: false, retired: false, cat: match || effective }]))
    // A reason added from the form arrives already picked.
    setForm((f) => ({ ...f, reasons: f.reasons.concat([id]), newReason: '', newCat: '' }))
  }, [form.newReason, form.newCat, form.cat, reasons, allCategories, toast])

  const saveForm = useCallback(() => {
    const who = form.who.trim()
    const phone = form.phone.trim()
    if (!who || !phone || form.reasons.length === 0) return
    const patch = { who, title: form.title.trim(), phone, shown: form.shown, reasons: form.reasons.slice() }
    if (form.editId) {
      setContacts((cs) => cs.map((c) => (c.id === form.editId ? { ...c, ...patch } : c)))
      toast(`Saved: ${who}`)
    } else {
      setContacts((cs) => cs.concat([{ id: Date.now(), ...patch }]))
      toast(`Added last in the order: ${who} — drag it where it belongs`)
    }
    setFormOpen(false)
  }, [form, toast])

  // Bulk urgent / retire on the selected reasons.
  const bulkSet = useCallback(
    (patchFn, message) => {
      setReasons((rs) => rs.map((r) => (vSelIds.includes(r.id) ? { ...r, ...patchFn(r) } : r)))
      setVSelIds([])
      toast(message)
    },
    [vSelIds, toast],
  )

  // The dragged id is a ref, not state — it changes mid-gesture and must not
  // re-render the list underneath the pointer.
  const beginDrag = useCallback((id) => {
    dragId.current = id
  }, [])

  const reorder = useCallback((targetId) => {
    setContacts((cs) => {
      const from = cs.findIndex((x) => x.id === dragId.current)
      const to = cs.findIndex((x) => x.id === targetId)
      if (from < 0 || to < 0 || from === to) return cs
      const next = cs.slice()
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  return {
    reasons, setReasons, live, contacts, setContacts,
    nameOf, countFor, visibleCountFor, categories, allCategories,
    extraCats, setExtraCats, resolveCategory,
    q, setQ, reasonFilter, setReasonFilter, rdQ, setRdQ,
    sort, setSort,
    openDrop, setOpenDrop, toggleDrop, menuFor, setMenuFor, closeOverlays,
    vq, setVq, vCat, setVCat, vCollapsed, setVCollapsed, vSelIds, setVSelIds, vcNew, setVcNew, bulkSet,
    form, patchForm, formOpen, setFormOpen, openForm, toggleFormReason, addReason, saveForm,
    phoneOpen, setPhoneOpen, newCatOpen, setNewCatOpen, ncNew, setNcNew,
    rename, setRename, commitRename,
    delFor, setDelFor,
    beginDrag, reorder,
    toast, toastText,
  }
}
