import { useCallback, useMemo, useState } from 'react'
import { useToast } from '../../ds/hooks'
import {
  COMPANY_LEGAL_NAME,
  CURRENT_PERIOD,
  INVOICES,
  METER_SPECS,
  PERIODS,
} from './data'
import type { Head, Invoice } from './data'
import { int, money } from '../../ds/format'

/** What the page reads. Derived from the hook so the two cannot drift. */
export type BillingState = ReturnType<typeof useAdminBilling>



export function useAdminBilling() {
  const [period, setPeriod] = useState(CURRENT_PERIOD)
  const [periodOpen, setPeriodOpen] = useState(false)

  const [invQuery, setInvQuery] = useState('')
  const [invYear, setInvYear] = useState('All')
  const [invSort, setInvSort] = useState<{ col: Head['k']; dir: 'asc' | 'desc' }>({
    col: 'date',
    dir: 'desc',
  })
  const [invMenuFor, setInvMenuFor] = useState<string | null>(null)

  const [cancelled, setCancelled] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelText, setCancelText] = useState('')

  // `toast` is the function and `toastText` the line — this page's own
  // naming, kept so no component of it has to change.
  const { toast: toastText, toastMsg: toast } = useToast(2600)

  const closeOverlays = useCallback(() => {
    setPeriodOpen((v) => (v ? false : v))
    setInvMenuFor((v) => (v ? null : v))
  }, [])

  const p = PERIODS[period]

  // Each meter reports how much of its allowance is gone and what the overage
  // costs so far — the DSP sees the number accruing rather than meeting it on
  // the invoice.
  const meters = useMemo(
    () =>
      METER_SPECS.map((spec) => {
        const used = p[spec.key]
        const frac = used / spec.cap
        const overUnits = Math.max(0, used - spec.cap)
        const overCost = overUnits * spec.rate
        return {
          ...spec,
          used,
          frac,
          overCost,
          value: int(used),
          capLabel: int(spec.cap),
          pct: `${Math.min(100, Math.round(frac * 100))}%`,
          fill: frac >= 1 ? 'var(--danger-accent)' : frac >= 0.8 ? 'var(--warning-accent)' : 'var(--blue-300)',
          // Amber from 80% — the point of a meter is the warning before the bill.
          color: frac >= 0.8 ? 'var(--warning-fg)' : 'var(--text-primary)',
          sub: overCost > 0 ? `${money(overCost)} over` : 'Within the allowance',
          subColor: frac > 1 ? 'var(--warning-fg)' : 'var(--text-helper)',
        }
      }),
    [p],
  )

  const telco = useMemo(() => {
    const total = meters.reduce((sum, m) => sum + m.overCost, 0)
    const parts = meters.filter((m) => m.overCost > 0).map((m) => `${m.label === 'SMS' ? 'SMS' : 'Voice'} ${money(m.overCost)}`)
    return {
      bill: money(total),
      total,
      color: total > 0 ? 'var(--warning-fg)' : 'var(--text-primary)',
      sub: total > 0 ? `${parts.join(' · ')} · on the next invoice` : 'Within the allowance',
      subColor: total > 0 ? 'var(--warning-fg)' : 'var(--text-helper)',
    }
  }, [meters])

  const overageChip = telco.total > 0 ? `${money(telco.total)} in overage this period` : ''

  const visibleInvoices = useMemo(() => {
    const q = invQuery.trim().toLowerCase()
    const rows = INVOICES.filter(
      (v) =>
        (invYear === 'All' || v.year === invYear) &&
        (!q || `${v.num} ${v.date} ${v.status} ${v.breakdown}`.toLowerCase().includes(q)),
    )
    const keyOf = (v: Invoice): string | number =>
      invSort.col === 'num' ? v.num : invSort.col === 'amt' ? v.amt : invSort.col === 'status' ? v.status : v.ts
    return rows.slice().sort((a, b) => {
      const ka = keyOf(a)
      const kb = keyOf(b)
      const c = typeof ka === 'string' ? ka.localeCompare(kb as string) : ka - (kb as number)
      return c * (invSort.dir === 'asc' ? 1 : -1)
    })
  }, [invQuery, invYear, invSort])

  const sortInvoices = useCallback((k: Head['k']) => {
    setInvSort((s) => ({ col: k, dir: s.col === k ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc' }))
  }, [])

  const clearInvoiceFilters = useCallback(() => {
    setInvQuery('')
    setInvYear('All')
  }, [])

  // Cancelling is confirmed by typing the legal name — there is no undo inside
  // the dialog, so the confirmation has to be deliberate.
  const canCancel = cancelText.trim() === COMPANY_LEGAL_NAME

  const openCancel = useCallback(() => {
    setCancelOpen(true)
    setCancelText('')
  }, [])

  const commitCancel = useCallback(() => {
    if (!canCancel) return
    setCancelled(true)
    setCancelOpen(false)
    toast('Cancelled - access continues to Aug 31, 2026')
  }, [canCancel, toast])

  const resume = useCallback(() => {
    setCancelled(false)
    toast('Subscription resumed')
  }, [toast])

  return {
    period, setPeriod, periodOpen, setPeriodOpen, periodRange: p.range,
    meters, telco, overageChip,
    invQuery, setInvQuery, invYear, setInvYear, invSort, sortInvoices,
    invMenuFor, setInvMenuFor, visibleInvoices, clearInvoiceFilters,
    invoiceTotal: INVOICES.length,
    cancelled, cancelOpen, setCancelOpen, cancelText, setCancelText,
    canCancel, openCancel, commitCancel, resume,
    closeOverlays, toast, toastText,
  }
}
