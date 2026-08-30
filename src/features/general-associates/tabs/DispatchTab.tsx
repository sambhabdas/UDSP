'use client'

import { CardHead, Cell, SectionTitle, SmallButton, Tile } from '../parts'
import { CARD, HEAD, LABEL, ROW, RT_COLS, TILE_GRID } from '../style'
import { RT_HEADERS } from '../data'
import type { GaState } from '../useGeneralAssociates'

/**
 * Dispatch — what the day sheet says about them.
 *
 * Only today's row carries anything: the two before it are there to show the
 * shape the history will take once Return to Station starts writing into it.
 */
export function DispatchTab({ s }: { s: GaState }) {
  const cur = s.cur
  const on = cur.onRoute

  const rows = [
    {
      date: 'Wed Jul 29',
      bold: true,
      route: on ?? 'Not on the sheet',
      van: on ? 'PACT03' : '-',
      wave: on ? '7:00' : '-',
      punch: on ? '6:51' : '-',
      rts: '-',
      highlight: true,
      color: 'var(--text-primary)',
    },
    { date: 'Tue Jul 28', route: '-', van: '-', wave: '-', punch: '-', rts: '-', color: 'var(--text-disabled)' },
    { date: 'Mon Jul 27', route: '-', van: '-', wave: '-', punch: '-', rts: '-', color: 'var(--text-disabled)' },
  ]

  return (
    <>
      <div style={TILE_GRID}>
        <Tile
          label="Today"
          value={on ?? '-'}
          color={on ? 'var(--success-fg)' : 'var(--text-primary)'}
          sub={on ? 'PACT03 · wave 7:00 · punched 6:51' : 'Not on the day sheet'}
          title="Live from Load Out"
        />
        <Tile label="Days Scheduled 30d" value="22" title="From the Schedule spine" />
        <Tile
          label="Absences 30d"
          value={String(cur.abs)}
          color={cur.abs ? 'var(--danger-fg)' : 'var(--success-fg)'}
          title="Unexcused-absence Events"
        />
        <Tile
          label="Routes · Rescues · RTS"
          value="-"
          color="var(--text-disabled)"
          sub="Arrives with Return to Station"
          title="Arrives with Return to Station"
        />
      </div>

      <div style={CARD}>
        <CardHead>
          <SectionTitle flex>Route History</SectionTitle>
          <SmallButton link onClick={() => s.toastMsg('Opens the On Road board')}>
            Open In Dispatch
          </SmallButton>
        </CardHead>

        <div style={{ ...HEAD, gridTemplateColumns: RT_COLS }}>
          {RT_HEADERS.map((h) => (
            <span key={h} style={LABEL}>{h}</span>
          ))}
        </div>

        {rows.map((r) => (
          <div
            key={r.date}
            style={{ ...ROW, gridTemplateColumns: RT_COLS, background: r.highlight ? 'var(--blue-50)' : 'var(--surface-card)' }}
          >
            <Cell bold={r.bold}>{r.date}</Cell>
            <Cell body ellipsis color={r.color}>{r.route}</Cell>
            <Cell body nums color={r.color}>{r.van}</Cell>
            <Cell body nums color="var(--text-secondary)">{r.wave}</Cell>
            <Cell body nums color="var(--text-secondary)">{r.punch}</Cell>
            <Cell body nums color="var(--text-secondary)">{r.rts}</Cell>
          </div>
        ))}
      </div>
    </>
  )
}
