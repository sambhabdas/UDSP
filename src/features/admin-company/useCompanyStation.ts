import { useCallback, useMemo, useState } from 'react'
import { useToast } from '../../ds/hooks'
import { FALLBACK_BRAND, SAMPLE_FIELDS, SEED, TIME_ZONES } from './data'
import type { CompanyForm } from './data'

// The rail is painted with the brand colour, so everything drawn on top of it
// derives from that colour's luminance.
export interface RailTone {
  hex: string
  lum: number
  light: boolean
  fg: string
  divider: string
  rest: string
  selectedBg: string
}

/** What the page reads. Derived from the hook so the two cannot drift. */
export type CompanyState = ReturnType<typeof useCompanyStation>

export function useCompanyStation() {
  const [form, setForm] = useState(SEED)
  const [stationEditing, setStationEditing] = useState(false)

  const [tzOpen, setTzOpen] = useState(false)
  const [tzQuery, setTzQuery] = useState('')
  const [tzPending, setTzPending] = useState<string | null>(null)

  // `toast` is the function and `toastText` the line - this page's own
  // naming, kept so no component of it has to change.
  const { toast: toastText, toastMsg: toast } = useToast(2600)

  const set = useCallback(
    <K extends keyof CompanyForm>(k: K, v: CompanyForm[K]) => setForm((f) => ({ ...f, [k]: v })),
    [],
  )

  const closeOverlays = useCallback(() => {
    setTzOpen((v) => {
      if (!v) return v
      setTzQuery('')
      return false
    })
  }, [])

  // The rail is painted with the brand colour, so everything drawn on top of it
  // - glyphs, the divider, the selection plate - derives from that colour's
  // luminance. A pale brand cannot ship an unreadable rail.
  const rail = useMemo<RailTone>(() => {
    const hex = /^#[0-9a-fA-F]{6}$/.test(form.brand) ? form.brand : FALLBACK_BRAND
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    const light = lum > 0.55
    return {
      hex,
      lum,
      light,
      fg: light ? 'rgba(17,24,39,.92)' : '#FFFFFF',
      divider: light ? 'rgba(17,24,39,.35)' : 'rgba(255,255,255,.35)',
      rest: light ? 'rgba(17,24,39,.72)' : 'rgba(255,255,255,.72)',
      selectedBg: light ? 'rgba(17,24,39,.10)' : 'rgba(255,255,255,.16)',
    }
  }, [form.brand])

  const initial = (form.displayName || 'C').charAt(0).toUpperCase()

  // Example text steps aside on focus and comes back if you leave it blank.
  // Station fields only do this while the station is unlocked.
  const sampleProps = useCallback(
    (key: keyof CompanyForm) => {
      const sample = SAMPLE_FIELDS[key]
      if (sample === undefined) return {}
      return {
        onFocus: () => {
          if (key.startsWith('station') && !stationEditing) return
          if (form[key] === sample) set(key, '' as CompanyForm[typeof key])
        },
        onBlur: () => {
          if (!String(form[key]).trim()) set(key, sample as CompanyForm[typeof key])
        },
      }
    },
    [form, stationEditing, set],
  )

  const stationAction = useCallback(() => {
    if (stationEditing) {
      setStationEditing(false)
      toast('Station saved')
      return
    }
    setStationEditing(true)
  }, [stationEditing, toast])

  const setLogo = useCallback(
    (on: boolean) => {
      set('logo', on)
      toast(
        on
          ? 'Logo uploaded · exports restyle from the next generation'
          : 'Logo removed - the display name initial renders instead',
      )
    },
    [set, toast],
  )

  const tzMatches = useMemo(() => {
    const q = tzQuery.trim().toLowerCase()
    return TIME_ZONES.filter((z) => !q || z.toLowerCase().includes(q))
  }, [tzQuery])

  // Picking the zone you are already on is not a change, so it never raises the
  // confirm.
  const pickZone = useCallback(
    (z: string) => {
      setTzOpen(false)
      setTzQuery('')
      if (z !== form.tz) setTzPending(z)
    },
    [form.tz],
  )

  const commitZone = useCallback(() => {
    const z = tzPending
    if (z === null) return
    set('tz', z)
    setTzPending(null)
    toast(`Time zone changed to ${z}`)
  }, [tzPending, set, toast])

  return {
    form, set, initial, rail, sampleProps,
    stationEditing, stationAction,
    setLogo,
    tzOpen, setTzOpen, tzQuery, setTzQuery, tzMatches, pickZone,
    tzPending, setTzPending, commitZone,
    closeOverlays, toast, toastText,
  }
}
