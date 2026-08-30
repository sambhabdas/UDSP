'use client'

import { body1, caption1 } from '../../../ds/type'
import { Cell, Divider, Pill, SectionTitle, SmallButton } from '../parts'
import { CARD, HEAD, LABEL, ROW, TC_COLS } from '../style'
import { TC_HEADERS, TC_ROWS, TC_TOTALS } from '../data'
import type { GaState } from '../useGeneralAssociates'

/**
 * Timecard — the pay period as scheduled.
 *
 * The In / Out and Worked columns stay empty on purpose: punches arrive from
 * the clock, and the period is still open, so there is nothing to show yet.
 */
export function TimecardTab({ s }: { s: GaState }) {
  return (
    <div style={CARD}>
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: 'var(--size-100) var(--size-160)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}
      >
        <SectionTitle>P14 · Jul 19 - Aug 1</SectionTitle>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>Pay date Aug 7</span>
        <Divider />
        <Pill>W29 + W30</Pill>
        <div style={{ flex: 1 }} />
        <SmallButton onClick={() => s.toastMsg('XLSX + PDF - this DA, this tab')}>Export This Tab</SmallButton>
      </div>

      <div style={{ ...HEAD, gridTemplateColumns: TC_COLS }}>
        {TC_HEADERS.map((h) => (
          <span key={h} style={LABEL}>{h}</span>
        ))}
      </div>

      {TC_ROWS.map((r) => (
        <div
          key={r.date}
          style={{ ...ROW, gridTemplateColumns: TC_COLS, background: r.highlight ? 'var(--blue-50)' : 'var(--surface-card)' }}
        >
          <Cell bold={r.bold}>{r.date}</Cell>
          <Cell body ellipsis color={r.quiet ? 'var(--text-secondary)' : 'var(--text-primary)'}>{r.sched}</Cell>
          <Cell body nums color="var(--text-disabled)">-</Cell>
          <Cell body nums color="var(--text-disabled)">-</Cell>
          <Cell body nums color={r.ptoPaid ? 'var(--success-fg)' : 'var(--text-secondary)'}>{r.pto}</Cell>
          <Cell color="var(--text-secondary)">{r.src}</Cell>
        </div>
      ))}

      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-240)',
          padding: 'var(--size-100) var(--size-160)',
          background: 'var(--surface-subtle)',
        }}
      >
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>Totals</span>
        <span style={{ ...body1, fontVariantNumeric: 'tabular-nums' }}>Scheduled {TC_TOTALS.sched}</span>
        <span style={{ ...body1, color: 'var(--text-disabled)' }}>Worked -</span>
        <span style={{ ...body1, fontVariantNumeric: 'tabular-nums' }}>PTO {TC_TOTALS.pto}</span>
        <span style={{ ...body1, fontVariantNumeric: 'tabular-nums' }}>Shifts {TC_TOTALS.shifts}</span>
      </div>
    </div>
  )
}
