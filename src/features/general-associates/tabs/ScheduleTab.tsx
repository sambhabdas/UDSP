'use client'

import { body1 } from '../../../ds/type'
import { Cell, Divider, Pill, SectionTitle, SmallButton } from '../parts'
import { CARD, HEAD, LABEL, ROW, SHIFT_COLS } from '../style'
import { SHIFT_HEADERS, SHIFT_ROWS } from '../data'
import type { GaState } from '../useGeneralAssociates'

/**
 * Schedule — the next fourteen days as the spine has them, with the flag column
 * carrying whatever the auto-scheduler would refuse or warn about.
 */
export function ScheduleTab({ s }: { s: GaState }) {
  const cur = s.cur
  return (
    <>
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
          <SectionTitle>Next 14 Days</SectionTitle>
          <Divider />
          <SmallButton
            onClick={() =>
              s.toastMsg(`Opens Schedule P2 prefilled with ${cur.name} - the shift lands on the Schedule page record`)
            }
          >
            + Add Shift
          </SmallButton>
          <SmallButton
            onClick={() =>
              s.toastMsg('Opens Availability P3 - approved time off writes Time Off and holds the always-Hard gate')
            }
          >
            Record Time Off
          </SmallButton>
          <Divider />
          <Pill>Rolling 44 / 50 h</Pill>
          <div style={{ flex: 1 }} />
          <SmallButton onClick={() => s.toastMsg('XLSX + PDF - this DA, this tab')}>Export This Tab</SmallButton>
        </div>

        <div style={{ ...HEAD, gridTemplateColumns: SHIFT_COLS }}>
          {SHIFT_HEADERS.map((h) => (
            <span key={h} style={LABEL}>{h}</span>
          ))}
        </div>

        {SHIFT_ROWS.map((r) => {
          // A day with no shift greys its department, start and hours as a set.
          const depColor = r.off ? 'var(--text-secondary)' : 'var(--text-primary)'
          const flag = r.live ? (cur.onRoute ? `On route ${cur.onRoute}` : '') : r.flag
          return (
            <div
              key={r.date}
              style={{
                ...ROW,
                gridTemplateColumns: SHIFT_COLS,
                background: r.highlight ? 'var(--blue-50)' : 'var(--surface-card)',
              }}
            >
              <Cell bold={r.bold}>{r.date}</Cell>
              <Cell body ellipsis color={depColor}>{r.dep}</Cell>
              <Cell body nums color={depColor}>{r.start}</Cell>
              <Cell body nums color={depColor}>{r.hrs}</Cell>
              <Cell color="var(--text-secondary)">{r.source}</Cell>
              <Cell ellipsis color={r.flagColor}>{flag}</Cell>
            </div>
          )
        })}
      </div>

      {cur.excluded && (
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-80) var(--size-120)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
          }}
        >
          <span style={body1}>
            Excluded from auto-schedule - {cur.excluded.reason} · until {cur.excluded.until}
          </span>
          <div style={{ flex: 1 }} />
          <SmallButton link onClick={s.toggleExclude}>
            Reinstate
          </SmallButton>
        </div>
      )}
    </>
  )
}
