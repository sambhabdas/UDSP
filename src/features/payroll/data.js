// Seed for Payroll Setup, from PayrollSetup.dc.html's constructor.

import { addDays, fmtD, generatePeriods } from './calendar.js'

// The design file pins "today" so the demo always sits mid-year, with some
// periods closed and posted and one still open.
export const TODAY = new Date(2026, 7, 11) // Aug 11, 2026

export const SEED_2026 = new Date(2026, 1, 1) // Sunday Feb 1, 2026
export const PAY_2026 = addDays(SEED_2026, 19) // Feb 20 · offset 6 from period-1 end

export const CURRENT_USER = 'Kai Sato'
export const TODAY_LABEL = 'Aug 11'
export const TODAY_LABEL_LONG = 'Aug 11, 2026'

export const STATUS_NAME = {
  posted: 'Posted',
  uploaded: 'Uploaded',
  'needs-re-upload': 'Needs re-upload',
  empty: 'Empty',
}

// [background, border, foreground, accent dot]
export const STATUS_TONE = {
  posted: ['var(--success-bg)', 'var(--success-border)', 'var(--success-fg)', 'var(--success-accent)'],
  uploaded: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)', 'var(--warning-accent)'],
  'needs-re-upload': ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger-fg)', 'var(--danger-accent)'],
  empty: ['var(--surface-subtle)', 'var(--border-default)', 'var(--text-secondary)', 'var(--neutral-400)'],
}

export const CAL_FILTERS = ['All', 'Posted', 'Uploaded', 'Needs re-upload', 'Not started']
export const YEARS = [2025, 2026, 2027]

// Six group-level aggregates are all that comes back out of Paycom: gross pay
// and employer taxes for driver, dispatch and training.
export const MANUAL_GROUPS = [
  ['Driver', 'dg', 'dt'],
  ['Dispatch', 'pg', 'pt'],
  ['Training', 'tg', 'tt'],
]

export const EMPTY_MANUAL = { dg: '', dt: '', pg: '', pt: '', tg: '', tt: '' }

// Deterministic pseudo-figures so a period always extracts the same numbers.
// A null Training pair means the file had no Trainer rows at all — absent, not
// zero, which the review table says out loud.
export function figuresFor(n) {
  const b = (n * 7919) % 887
  const noTraining = n % 5 === 0
  return {
    dg: 82140.5 + b * 9.13,
    dt: 8874.2 + b * 1.7,
    pg: 6390 + b * 0.9,
    pt: 641.8 + b * 0.12,
    tg: noTraining ? null : 2840 + b * 0.4,
    tt: noTraining ? null : 296.4 + b * 0.05,
  }
}

// Every closed period is posted except two, which carry the states worth
// seeing: one reverted and awaiting a fresh file, one uploaded but not posted.
export function seedPeriodStates(rows) {
  const states = {}
  rows.forEach((r) => {
    if (r.end >= TODAY) {
      states[r.n] = { status: 'empty' }
      return
    }
    if (r.n === 11) {
      states[r.n] = {
        status: 'needs-re-upload',
        info: 'Post reverted by A. Owner on Jul 30 · “duplicate Standby rows in the file”',
      }
    } else if (r.n === 13) {
      states[r.n] = {
        status: 'uploaded',
        source: { file: 'PaycomReport_P13.xlsx', by: 'A. Owner', on: 'Aug 4' },
        fig: figuresFor(13),
        unmapped: true,
      }
    } else {
      const who = r.n % 2 ? 'A. Owner' : 'M. Chen'
      states[r.n] = {
        status: 'posted',
        by: who,
        on: fmtD(addDays(r.pay, 1)),
        source: { file: `PaycomReport_P${r.n}.xlsx`, by: who, on: fmtD(r.pay) },
        fig: figuresFor(r.n),
      }
    }
  })
  return states
}

export function initialYears() {
  const rows = generatePeriods(SEED_2026, PAY_2026)
  return {
    2025: { status: 'empty' },
    2026: {
      status: 'locked',
      seed: SEED_2026,
      pay: PAY_2026,
      rows,
      lockedBy: 'M. Chen',
      lockedOn: 'Jan 5, 2026',
    },
    2027: { status: 'empty' },
  }
}

export const UNMAPPED_TOTAL = '$6,182.00'
export const UNMAPPED_ROWS = [
  { group: 'Mechanic', amount: '$4,210.00' },
  { group: 'Office', amount: '$1,880.00' },
  { group: '(blank)', amount: '$92.00' },
]
