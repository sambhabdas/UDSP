'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../ds/hooks'
import {
  DAS,
  INCIDENTS,
  ODO,
  PHOTOS,
  PHOTO_SLOTS,
  PRIO,
  REC_CHANGES,
  REMINDERS,
  RENEWALS,
  REN_TYPES,
  SERVICE,
  STATUS_HIST,
  SVC_CATS,
  TODAY,
  TYPES,
  VEHICLES,
  WEEKDAYS,
} from './data'
import type {
  FileRef,
  Incident,
  OdoReading,
  PhotoSet,
  RecordChange,
  Reminder,
  Renewal,
  ServiceRecord,
  Status,
  StatusChange,
  Vehicle,
} from './data'
import { fmt, latestOdo, sortBy } from './calc'
import { int } from '../../ds/format'

export type View = 'dir' | 'ledger' | 'profile'
export type ProfileTab = 'overview' | 'service' | 'maint' | 'photos' | 'odo' | 'priority'

export type DialogKind =
  | 'vehicle' | 'status' | 'service' | 'incident' | 'reminder'
  | 'renewal' | 'renew' | 'reading' | 'photos' | 'picker' | 'types' | 'import'

/** Every dialog writes into one loose bag; each save reads the keys it needs. */
export type Form = Record<string, unknown>

export interface Sort<K extends string> {
  k: K
  d: 'asc' | 'desc'
}

/** Where the floating combo list is anchored. */
export interface ComboRect {
  left: number
  top: number
  width: number
}

const num = (v: unknown): number => Number(String(v ?? '').replace(/[$,]/g, ''))
const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v))

/** Parse the loose dates the dialogs accept - "Aug 15" means Aug 15, 2026. */
function parseDate(raw: string): Date | null {
  let d = new Date(`${raw}, 2026`)
  if (isNaN(d.getTime())) d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

export function useVehicles() {
  const [view, setView] = useState<View>('dir')
  const [profileId, setProfileId] = useState<string | null>(null)
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview')

  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES)
  const [svc, setSvc] = useState<ServiceRecord[]>(SERVICE)
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS)
  const [reminders, setReminders] = useState<Reminder[]>(REMINDERS)
  const [renewals, setRenewals] = useState<Renewal[]>(RENEWALS)
  const [photos, setPhotos] = useState<PhotoSet[]>(PHOTOS)
  const [odo, setOdo] = useState<OdoReading[]>(ODO)
  const [prio, setPrio] = useState<Record<string, string[]>>(PRIO)
  const [statusHist, setStatusHist] = useState<StatusChange[]>(STATUS_HIST)
  const [recChanges] = useState<RecordChange[]>(REC_CHANGES)

  const [svcCats, setSvcCats] = useState(SVC_CATS)
  const [renTypes, setRenTypes] = useState(REN_TYPES)
  const [customVendors, setCustomVendors] = useState<string[]>([])
  const [customReminders, setCustomReminders] = useState<string[]>([])

  const [dirSearch, setDirSearch] = useState('')
  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [sort, setSort] = useState<Sort<string>>({ k: 'name', d: 'asc' })
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [pMenuOpen, setPMenuOpen] = useState(false)

  const [payer, setPayer] = useState('All')
  const [svcSearch, setSvcSearch] = useState('')
  const [svSort, setSvSort] = useState<Sort<string>>({ k: 'date', d: 'desc' })
  const [shSort, setShSort] = useState<Sort<string>>({ k: 'date', d: 'desc' })
  const [rcSort, setRcSort] = useState<Sort<string>>({ k: 'date', d: 'desc' })
  const [inSort, setInSort] = useState<Sort<string>>({ k: 'when', d: 'desc' })
  const [odSort, setOdSort] = useState<Sort<string>>({ k: 'date', d: 'desc' })

  const [incSearch, setIncSearch] = useState('')
  const [remSearch, setRemSearch] = useState('')
  const [renSearch, setRenSearch] = useState('')
  const [photoSearch, setPhotoSearch] = useState('')
  const [odoSearch, setOdoSearch] = useState('')

  const [infoEdit, setInfoEdit] = useState(false)
  const [svcTypeQuery, setSvcTypeQuery] = useState('')
  const [svcTypeOpen, setSvcTypeOpen] = useState(false)
  const [prioQuery, setPrioQuery] = useState('')
  const [prioOpen, setPrioOpen] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const [dlg, setDlg] = useState<DialogKind | null>(null)
  const [form, setForm] = useState<Form>({})
  const [dlgError, setDlgError] = useState('')
  const [comboOpen, setComboOpen] = useState<string | null>(null)
  const [comboRect, setComboRect] = useState<ComboRect | null>(null)
  const [comboTyping, setComboTyping] = useState(false)

  const { toast, toastMsg } = useToast(2400)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (blurTimer.current) clearTimeout(blurTimer.current) }, [])

  /** A click on the page background puts every open popover away. */
  const pageClick = () => {
    if (openMenu || pMenuOpen || svcTypeOpen || prioOpen) {
      setOpenMenu(null)
      setPMenuOpen(false)
      setSvcTypeOpen(false)
      setPrioOpen(false)
    }
  }

  const setF = (k: string, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }))
    setDlgError('')
  }

  const openDlg = (kind: DialogKind, seed: Form = {}) => {
    setDlg(kind)
    setForm(seed)
    setDlgError('')
    setOpenMenu(null)
    setPMenuOpen(false)
  }

  const closeDlg = () => {
    setDlg(null)
    setDlgError('')
    setComboOpen(null)
  }

  // ---- the current vehicle -------------------------------------------------

  /** Falls back to the fourth seeded vehicle, the way the design file does. */
  const pv = vehicles.find((v) => v.id === profileId) ?? vehicles[3]

  const openProfile = (vid: string, tab: ProfileTab = 'overview') => {
    setView('profile')
    setProfileId(vid)
    setProfileTab(tab)
    setOpenMenu(null)
    setPayer('All')
    setSvcSearch('')
  }

  const pickView = (v: View) => {
    setView(v)
    setSel({})
    setOpenMenu(null)
    setPayer('All')
    setSvcSearch('')
  }

  // ---- the directory -------------------------------------------------------

  const dirList = useMemo(() => {
    const q = dirSearch.trim().toLowerCase()
    const list = vehicles.filter((v) => !q || `${v.name} ${v.vin} ${v.plate}`.toLowerCase().includes(q))
    const val = (v: Vehicle): string | number =>
      ({
        name: v.name,
        type: v.type,
        status: v.status,
        odo: (latestOdo(odo, v.id) ?? { reading: -1 }).reading,
        prio: (prio[v.id] ?? []).length,
      })[sort.k] ?? ''
    return sortBy(list, sort.d, val)
  }, [vehicles, dirSearch, sort, odo, prio])

  const selIds = Object.keys(sel).filter((k) => sel[k])

  // ---- service records -----------------------------------------------------

  const isLedger = view === 'ledger'

  const svcRows = useMemo(() => {
    const scope = isLedger ? svc : svc.filter((s) => s.vid === (pv ? pv.id : ''))
    const q = svcSearch.trim().toLowerCase()
    const filtered = scope.filter((s) => {
      if (payer !== 'All' && !s.alloc.some((a) => a[0] === payer)) return false
      if (q && !`${s.desc} ${s.vendor}`.toLowerCase().includes(q)) return false
      return true
    })
    const val = (x: ServiceRecord): string | number => {
      switch (svSort.k) {
        case 'date': return x.d.getTime()
        case 'odo': return num(x.odo) || 0
        case 'cost': return x.cost
        case 'vehicle': return vehicles.find((v) => v.id === x.vid)?.name ?? ''
        case 'paidBy': return x.alloc.map((a) => a[0]).join()
        default: return (x[svSort.k as keyof ServiceRecord] as string) || ''
      }
    }
    return sortBy(filtered, svSort.d, val)
  }, [svc, isLedger, pv, payer, svcSearch, svSort, vehicles])

  const svcTotals = useMemo(() => {
    let oop = 0
    let re = 0
    svcRows.forEach((s) => s.alloc.forEach((a) => { if (a[0] === 'Out of pocket') oop += a[1]; else re += a[1] }))
    return { oop, re, total: oop + re }
  }, [svcRows])

  // ---- saving --------------------------------------------------------------

  const err = (m: string): false => {
    setDlgError(m)
    return false
  }

  /**
   * The rules a vehicle record has to pass. A VIN is 17 characters and never
   * contains I, O or Q - they are excluded so they cannot be read as 1 and 0.
   */
  const validateVehicle = (f: Form): string | null => {
    if (!f.name || !f.type || !f.vin || !f.own) return 'Vehicle name, type, VIN and ownership are required.'
    const vin = str(f.vin).toUpperCase().trim()
    if (vin.length !== 17 || /[IOQ]/.test(vin) || /[^A-Z0-9]/.test(vin)) {
      return 'VIN must be exactly 17 characters, without I, O or Q.'
    }
    const dupN = vehicles.find((x) => x.name.toLowerCase() === str(f.name).trim().toLowerCase() && x.id !== f.id)
    if (dupN) return `Name already in use by ${dupN.name}.`
    const dupV = vehicles.find((x) => x.vin === vin && x.id !== f.id)
    if (dupV) return `VIN already on ${dupV.name}.`
    return null
  }

  const applyVehicle = (f: Form): Vehicle[] =>
    vehicles.map((x) =>
      x.id === f.id
        ? {
            ...x,
            name: str(f.name).trim(),
            type: str(f.type),
            vin: str(f.vin).toUpperCase().trim(),
            ext: str(f.ext).toUpperCase(),
            plate: str(f.plate),
            plateState: str(f.plateState),
            year: (f.year as number) || x.year,
            make: str(f.make),
            model: str(f.model),
            own: f.own as 'Owned' | 'Rented',
          }
        : x,
    )

  /** Save the Basic Info panel, which edits in place rather than in a dialog. */
  const saveVehicleInline = () => {
    const bad = validateVehicle(form)
    if (bad) { err(bad); return }
    setVehicles(applyVehicle(form))
    setInfoEdit(false)
    setForm({})
    setDlgError('')
    toastMsg('Saved')
  }

  const saveDlg = () => {
    const f = form

    if (dlg === 'vehicle') {
      const bad = validateVehicle(f)
      if (bad) { err(bad); return }
      if (f.id) {
        setVehicles(applyVehicle(f))
        setDlg(null)
        toastMsg('Saved')
        return
      }
      const id = `v${Math.floor(Math.random() * 9000 + 1000)}`
      const nv: Vehicle = {
        id, svcTypes: [], name: str(f.name).trim(), type: str(f.type),
        vin: str(f.vin).toUpperCase().trim(), ext: str(f.ext).toUpperCase(),
        plate: str(f.plate), plateState: str(f.plateState), year: (f.year as number) || '',
        make: str(f.make), model: str(f.model), own: f.own as 'Owned' | 'Rented',
        inService: fmt(TODAY), status: 'In service',
      }
      setVehicles((v) => v.concat([nv]))
      setStatusHist((h) => [{ vid: id, date: fmt(TODAY), from: '-', to: 'In service', reason: 'Vehicle created', by: 'You' }, ...h])
      if (f.odoInit) {
        setOdo((o) => [{ id: `o${id}`, vid: id, date: fmt(TODAY), d: TODAY, reading: num(f.odoInit), source: 'Manual', by: 'You', note: '' }, ...o])
      }
      setDlg(null)
      toastMsg('Saved')
      return
    }

    if (dlg === 'status') {
      if (!f.to) { err('Pick a new status.'); return }
      if (!f.reason || str(f.reason).trim().length < 5) { err('A reason is required.'); return }
      const ids = (f.ids as string[]) ?? [f.vid as string]
      const to = f.to as Status
      const rows: StatusChange[] = ids.map((id) => ({
        vid: id, date: fmt(TODAY), from: vehicles.find((x) => x.id === id)!.status,
        to, reason: str(f.reason).trim(), by: 'You',
      }))
      setVehicles((v) =>
        v.map((x) =>
          !ids.includes(x.id) ? x : {
            ...x, status: to,
            expectedBack: to === 'In shop' ? str(f.back) : '',
            backPast: false,
            vendor: to === 'In shop' ? str(f.vendor) : '',
            offDate: to === 'Off fleet' ? fmt(TODAY) : x.offDate,
            offReason: to === 'Off fleet' ? str(f.reason).trim() : x.offReason,
          },
        ),
      )
      setStatusHist((h) => rows.concat(h))
      setDlg(null)
      setSel({})
      toastMsg(`${to} · ${ids.length}${ids.length === 1 ? ' vehicle' : ' vehicles'}`)
      return
    }

    if (dlg === 'service') {
      let vid = f.vid as string | undefined
      if (!vid && f.vehName) vid = vehicles.find((x) => x.name === f.vehName)?.id
      if (!vid) { err('Pick a vehicle.'); return }
      const cat = str(f.cat).trim()
      if (!cat) { err('Pick or type a category.'); return }
      if (!f.desc || str(f.desc).trim().length < 5) { err('A description is required.'); return }
      const cost = num(f.cost)
      if (!(cost >= 0) || f.cost === undefined || f.cost === '') { err('A cost is required.'); return }
      if (f.odoAt) {
        // A reading can never go backwards, so a service that claims a lower
        // number than the last one is a typo, not a record.
        const n = num(f.odoAt)
        const latest = latestOdo(odo, vid)
        if (latest && n < latest.reading) {
          err(`Odometer conflict: ${int(latest.reading)} mi on ${latest.date} is higher.`)
          return
        }
      }
      const rec: ServiceRecord = {
        id: `s${Date.now()}`, vid, date: fmt(TODAY), d: TODAY, cat,
        vendor: str(f.vendor), desc: str(f.desc).trim(),
        odo: f.odoAt ? int(num(f.odoAt)) : '', cost,
        alloc: [[str(f.payer) || 'Out of pocket', cost]], files: (f.files as FileRef[]) ?? [],
      }
      setSvc((s) => [rec, ...s])
      if (f.odoAt) {
        setOdo((o) => [{ id: `o${Date.now()}`, vid: vid!, date: fmt(TODAY), d: TODAY, reading: num(f.odoAt), source: 'Service record', by: 'You', note: str(f.desc).trim() }, ...o])
      }
      if (!svcCats.some((c) => c.toLowerCase() === cat.toLowerCase())) setSvcCats((c) => c.concat([cat]))
      setDlg(null)
      toastMsg('Saved')
      return
    }

    if (dlg === 'incident') {
      if (!f.what || str(f.what).trim().length < 5) { err('Describe what happened.'); return }
      setIncidents((i) => [{
        id: `i${Date.now()}`, vid: f.vid as string, when: `${fmt(TODAY).replace(', 2026', '')}, 10:20`,
        what: str(f.what).trim(), liability: str(f.liability) || 'Unknown', claim: str(f.claim),
        linked: 0, status: 'open', files: (f.files as FileRef[]) ?? [],
      }, ...i])
      setDlg(null)
      toastMsg('Incident logged')
      return
    }

    if (dlg === 'reminder') {
      if (!f.name) { err('A name is required.'); return }
      const dueType = (f.dueType as 'Date' | 'Mileage') ?? 'Date'
      if (dueType === 'Mileage' ? !f.dueMi : !f.dueDate) {
        err(`A due ${dueType === 'Mileage' ? 'mileage' : 'date'} is required.`)
        return
      }
      const ids = (f.ids as string[]) ?? [f.vid as string]
      let repeat = 'none'
      const freq = str(f.freq) || 'Weekly'
      if (f.repeatOn) {
        if ((str(f.basis) || 'Date') === 'Mileage') repeat = f.repN ? `Every ${f.repN} miles` : 'Every 5,000 miles'
        else if (freq === 'Daily') repeat = 'Daily'
        else if (freq === 'Weekly') {
          const picked = WEEKDAYS.filter((d) => (f.days as Record<string, boolean> | undefined)?.[d])
          repeat = picked.length ? `Weekly · ${picked.join(', ')}` : 'Weekly'
        } else repeat = f.repN ? `Every ${f.repN} months` : 'Monthly'
      }
      const mk = (vid: string): Reminder => {
        const r: Reminder = { id: `r${Date.now()}${vid}`, vid, name: str(f.name).trim(), dueType, repeat }
        if (dueType === 'Mileage') r.dueMi = num(f.dueMi)
        else {
          const dd = parseDate(str(f.dueDate)) ?? new Date(2026, 8, 15)
          r.dueDate = fmt(dd)
          r.dd = dd
        }
        return r
      }
      setReminders((rs) => rs.concat(ids.map(mk)))
      setDlg(null)
      toastMsg(`Saved · ${ids.length}${ids.length === 1 ? ' vehicle' : ' vehicles'}`)
      return
    }

    if (dlg === 'renewal') {
      if (!f.type || !str(f.type).trim()) { err('Pick or type a type.'); return }
      if (!renTypes.some((t) => t.toLowerCase() === str(f.type).trim().toLowerCase())) {
        setRenTypes((t) => t.concat([str(f.type).trim()]))
      }
      if (!f.exp) { err('An expiration date is required.'); return }
      const ed = parseDate(str(f.exp))
      if (!ed) { err('Expiration date not recognized.'); return }
      const ids = (f.ids as string[]) ?? [f.vid as string]
      const added: Renewal[] = ids.map((vid) => {
        const n: Renewal = {
          id: `n${Date.now()}${vid}`, vid, type: str(f.type), name: str(f.name),
          exp: fmt(ed), ed, renewed: fmt(TODAY), cost: f.cost ? num(f.cost) : null,
        }
        if (f.notice) {
          const nd = parseDate(str(f.notice))
          if (nd) { n.notice = fmt(nd); n.nd = nd }
        }
        return n
      })
      setRenewals((r) => r.concat(added))
      // A renewal that cost money is also a service record, so the spend shows
      // up in one place rather than two.
      const bills = added.filter((n) => n.cost).map((n) => ({
        id: `s${Date.now()}${n.vid}`, vid: n.vid, date: fmt(TODAY), d: TODAY,
        cat: 'Fees / compliance', vendor: str(f.authority),
        desc: `${str(f.type)} renewal${n.name ? ` - ${n.name}` : ''}`,
        odo: '', cost: n.cost!, alloc: [['Out of pocket', n.cost!] as [string, number]],
      }))
      if (bills.length) setSvc((s) => bills.concat(s))
      setDlg(null)
      toastMsg(`Saved · ${ids.length}${ids.length === 1 ? ' vehicle' : ' vehicles'}`)
      return
    }

    if (dlg === 'renew') {
      if (!f.exp) { err('A new expiration date is required.'); return }
      const ed = parseDate(str(f.exp))
      if (!ed) { err('Date not recognized.'); return }
      const src = renewals.find((n) => n.id === f.nid)
      if (src && ed <= src.ed) { err(`The new expiration must be after ${src.exp}.`); return }
      setRenewals((rs) =>
        rs.map((n) => n.id !== f.nid ? n : { ...n, exp: fmt(ed), ed, notice: undefined, nd: undefined, renewed: fmt(TODAY), cost: f.cost ? num(f.cost) : n.cost }),
      )
      if (f.cost && src) {
        const c = num(f.cost)
        setSvc((s) => [{
          id: `s${Date.now()}`, vid: src.vid, date: fmt(TODAY), d: TODAY,
          cat: 'Fees / compliance', vendor: '',
          desc: `${src.type} renewal${src.name ? ` - ${src.name}` : ''}`,
          odo: '', cost: c, alloc: [['Out of pocket', c]],
        }, ...s])
      }
      setDlg(null)
      toastMsg('Renewed')
      return
    }

    if (dlg === 'reading') {
      const n = num(f.reading)
      if (!(n > 0)) { err('A reading is required.'); return }
      const latest = latestOdo(odo, f.vid as string)
      if (latest && n < latest.reading) {
        err(`Below the ${int(latest.reading)} mi reading on ${latest.date}. A reading can never be lower than an earlier one.`)
        return
      }
      setOdo((o) => [{
        id: `o${Date.now()}`, vid: f.vid as string, date: str(f.date) || fmt(TODAY),
        time: str(f.time), d: TODAY, reading: n, source: 'Manual', by: 'You', note: str(f.reason),
      }, ...o])
      setDlg(null)
      toastMsg('Saved')
      return
    }

    if (dlg === 'photos') {
      const n = ((f.files as FileRef[]) ?? []).length
      const slots = PHOTO_SLOTS.slice(0, Math.max(1, Math.min(5, n || 2)))
      setPhotos((p) => [{
        id: `p${Date.now()}`, vid: f.vid as string, date: fmt(TODAY),
        type: str(f.setType) || 'Pre-trip', reason: str(f.reason), note: str(f.note),
        filled: slots, extras: Math.max(0, n - 5), files: (f.files as FileRef[]) ?? [],
      }, ...p])
      setDlg(null)
      toastMsg('Photo set saved')
      return
    }

    if (dlg === 'picker') {
      const ids = (f.tags as string[]) ?? []
      if (!ids.length) { err('Pick at least one DA.'); return }
      setPrio((p) => ({ ...p, [f.vid as string]: (p[f.vid as string] ?? []).concat(ids) }))
      setDlg(null)
      toastMsg(`Added ${ids.length}${ids.length === 1 ? ' DA' : ' DAs'}`)
      return
    }

    if (dlg === 'import') {
      setDlg(null)
      toastMsg('Imported · 6 created · 2 updated · 1 skipped')
      return
    }

    setDlg(null)
  }

  // ---- combo helpers -------------------------------------------------------

  /** Vendors already on a record, plus any typed since. */
  const vendorList = useMemo(
    () => [...new Set(svc.map((x) => x.vendor).filter(Boolean).concat(customVendors))].sort(),
    [svc, customVendors],
  )
  const reminderNames = useMemo(
    () => [...new Set(reminders.map((x) => x.name).concat(customReminders))].sort(),
    [reminders, customReminders],
  )

  const addCustom = (key: string, typed: string) => {
    setCustomVendors((c) => c.concat([typed]))
    setF(key, typed)
  }

  const closeComboSoon = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    blurTimer.current = setTimeout(() => setComboOpen(null), 150)
  }

  return {
    view, setView: pickView, profileId, profileTab, setProfileTab, pv, openProfile,
    vehicles, setVehicles, svc, incidents, reminders, setReminders, renewals, photos, odo, prio, setPrio,
    statusHist, recChanges, types: TYPES, das: DAS,
    svcCats, renTypes, vendorList, reminderNames, addCustom, setCustomReminders, setRenTypes,
    dirSearch, setDirSearch, dirList, sel, setSel, selIds, sort, setSort,
    openMenu, setOpenMenu, pMenuOpen, setPMenuOpen, pageClick,
    payer, setPayer, svcSearch, setSvcSearch, svcRows, svcTotals, svSort, setSvSort,
    shSort, setShSort, rcSort, setRcSort, inSort, setInSort, odSort, setOdSort,
    incSearch, setIncSearch, remSearch, setRemSearch, renSearch, setRenSearch,
    photoSearch, setPhotoSearch, odoSearch, setOdoSearch,
    infoEdit, setInfoEdit, saveVehicleInline,
    svcTypeQuery, setSvcTypeQuery, svcTypeOpen, setSvcTypeOpen,
    prioQuery, setPrioQuery, prioOpen, setPrioOpen, dragIdx, setDragIdx,
    dlg, form, setForm, setF, openDlg, closeDlg, saveDlg, dlgError, setDlgError,
    comboOpen, setComboOpen, comboRect, setComboRect, comboTyping, setComboTyping, closeComboSoon,
    toast, toastMsg,
  }
}

export type VehiclesState = ReturnType<typeof useVehicles>
