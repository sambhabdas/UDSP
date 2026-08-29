// Seed for Admin · Billing & Subscription, from AdminBilling.dc.html.
//
// This page bills UDSP to the DSP. It has nothing to do with what Amazon pays
// the DSP (Invoice Validation, Rate Cards) or what the DSP pays its drivers
// (Payroll Setup) — three different money stories, and no figure is shared
// between them.

export const COMPANY_LEGAL_NAME = 'Cedar Ridge Logistics LLC'

export const PLAN = {
  name: 'Station',
  line: '$349 / month · 12 portal seats · unlimited Ultimate DA',
  fee: 349,
  nextInvoiceOn: 'Sep 1, 2026',
  seatsUsed: 8,
  seatCap: 12,
}

export const CARD = { brand: 'VISA', last4: '4412', exp: 'exp 03/28' }

// Allowances and the rate charged past them. Usage is metered, never blocked:
// passing an allowance bills the overage, it never stops a dispatcher texting a
// driver at 6am.
export const METER_SPECS = [
  {
    key: 'sms',
    label: 'SMS',
    cap: 5000,
    rate: 0.012,
    info: 'Counted in segments, not messages - a 200-character text is two. $0.012 per extra SMS past the allowance.',
  },
  {
    key: 'mins',
    label: 'Voice minutes',
    cap: 1000,
    rate: 0.018,
    info: 'Inbound and outbound both count; a voicemail counts as the call that left it. $0.018 per extra minute past the allowance.',
  },
]

// The billing month — not the Amazon week and not the pay period.
export const PERIODS = {
  'Aug 2026': { range: 'Aug 1 - Aug 31, 2026', tag: 'Current', sms: 4180, mins: 612 },
  'Jul 2026': { range: 'Jul 1 - Jul 31, 2026', tag: '', sms: 6180, mins: 890 },
  'Jun 2026': { range: 'Jun 1 - Jun 30, 2026', tag: '', sms: 3890, mins: 540 },
  'May 2026': { range: 'May 1 - May 31, 2026', tag: '', sms: 3610, mins: 498 },
}

export const PERIOD_KEYS = Object.keys(PERIODS)
export const CURRENT_PERIOD = 'Aug 2026'
export const ACCESS_UNTIL = 'Aug 31, 2026'

export const INVOICES = [
  { ts: 20260801, date: '08/01/26', num: 'INV-2026-08', amt: 349.0, breakdown: 'Plan $349.00', status: 'Paid', month: 'Aug 2026', year: '2026' },
  { ts: 20260701, date: '07/01/26', num: 'INV-2026-07', amt: 363.16, breakdown: 'Plan $349.00 · SMS overage $14.16', status: 'Paid', month: 'Jul 2026', year: '2026' },
  { ts: 20260601, date: '06/01/26', num: 'INV-2026-06', amt: 349.0, breakdown: 'Plan $349.00', status: 'Paid', month: 'Jun 2026', year: '2026' },
  { ts: 20260501, date: '05/01/26', num: 'INV-2026-05', amt: 349.0, breakdown: 'Plan $349.00', status: 'Paid', month: 'May 2026', year: '2026' },
  { ts: 20260401, date: '04/01/26', num: 'INV-2026-04', amt: 349.0, breakdown: 'Plan $349.00', status: 'Paid', month: 'Apr 2026', year: '2026' },
  { ts: 20260301, date: '03/01/26', num: 'INV-2026-03', amt: 349.0, breakdown: 'Plan $349.00', status: 'Refunded', month: 'Mar 2026', year: '2026' },
  { ts: 20260201, date: '02/01/26', num: 'INV-2026-02', amt: 349.0, breakdown: 'Plan $349.00', status: 'Paid', month: 'Feb 2026', year: '2026' },
  { ts: 20260101, date: '01/01/26', num: 'INV-2026-01', amt: 349.0, breakdown: 'Plan $349.00', status: 'Paid', month: 'Jan 2026', year: '2026' },
  { ts: 20251201, date: '12/01/25', num: 'INV-2025-12', amt: 358.72, breakdown: 'Plan $349.00 · voice overage $9.72', status: 'Paid', month: 'Dec 2025', year: '2025' },
  { ts: 20251101, date: '11/01/25', num: 'INV-2025-11', amt: 349.0, breakdown: 'Plan $349.00', status: 'Paid', month: 'Nov 2025', year: '2025' },
  { ts: 20251001, date: '10/01/25', num: 'INV-2025-10', amt: 349.0, breakdown: 'Plan $349.00', status: 'Paid', month: 'Oct 2025', year: '2025' },
]

export const YEAR_CHIPS = ['All', '2026', '2025']

export const INVOICE_STATUS_TONE = {
  Paid: { dot: 'var(--success-accent)', fg: 'var(--success-fg)', bg: 'var(--success-bg)', border: 'var(--success-border)' },
  Failed: { dot: 'var(--danger-accent)', fg: 'var(--danger-fg)', bg: 'var(--danger-bg)', border: 'var(--danger-border)' },
  Refunded: { dot: 'var(--neutral-400)', fg: 'var(--text-secondary)', bg: 'var(--surface-subtle)', border: 'var(--border-default)' },
}

export const INVOICE_HEADS = [
  { k: 'date', label: 'Date', w: 72 },
  { k: 'num', label: 'Invoice', flex: 1 },
  { k: 'amt', label: 'Amount', w: 76, right: true },
  { k: 'status', label: 'Status', w: 86 },
  { k: null, label: 'Actions', w: 72, center: true },
]

export const INFO = {
  nextInvoice: 'The plan fee only. Metered overage is added at close of period.',
  seats: 'Seats are portal users - active + invited. Ultimate DA accounts are unlimited and never billed.',
  telcoBill: 'SMS and voice overage past the allowance, billed at close of period on the next invoice.',
  card: 'UDSP never stores a card number - the processor holds it and returns the last four and the expiry.',
  help: 'Plan changes and cancellation go through support. Access is never cut mid-period and no data is deleted.',
  cancel: 'Only the account owner can cancel the subscription.',
}

export const CANCEL_BODY =
  'Access continues to Aug 31, 2026. Then the account goes read-only. No data is deleted. Export stays available throughout.'
