'use client'

import { CardHead, Cell, DotPill, IconButton, Pill, SectionTitle, SmallButton, Tile } from '../parts'
import { CARD, EV_COLS, HEAD, LABEL, ROW, TILE_GRID } from '../style'
import { TONES, coachTone, signed, tierOf } from '../calc'
import { EV_HEADERS, EV_ROWS } from '../data'
import type { Coaching } from '../data'
import type { GaState } from '../useGeneralAssociates'

/**
 * Performance - the Events that made the net, and the coaching those Events
 * fired. An assignment can be reminded once its state is anything but done.
 */
export function PerformanceTab({ s }: { s: GaState }) {
  const cur = s.cur
  const tier = tierOf(cur.net)
  const open = s.openCoaching
  const overdue = open.some((c) => c.state === 'Overdue')

  // Nobody with a clear record gets an empty table - they get one Clear row.
  const coachRows: Coaching[] = s.coaching.length
    ? s.coaching
    : [{ module: 'Nothing assigned', due: '', state: 'Clear' }]

  return (
    <>
      <div style={TILE_GRID}>
        <Tile
          label="Net"
          value={signed(cur.net)}
          color={cur.net < 0 ? 'var(--danger-fg)' : 'var(--success-fg)'}
          sub={`${tier.label} · rank 12 / 42`}
          title="All-time, non-voided Events"
        />
        <Tile
          label="Open Coaching"
          value={String(open.length)}
          color={overdue ? 'var(--danger-fg)' : 'var(--text-primary)'}
          sub={overdue ? 'One overdue - blocking' : undefined}
          title="Assignments not yet acknowledged"
        />
        <Tile label="Promotion Readiness" value="1 / 4" sub="Not ready" title="The readiness checklist" />
      </div>

      <div style={CARD}>
        <CardHead>
          <SectionTitle flex>Events</SectionTitle>
          <SmallButton onClick={() => s.toastMsg(`Opens the Events manual panel prefilled with ${cur.name}`)}>
            + Log Event
          </SmallButton>
        </CardHead>

        <div style={{ ...HEAD, gridTemplateColumns: EV_COLS }}>
          {EV_HEADERS.map((h) => (
            <span key={h} style={LABEL}>{h}</span>
          ))}
        </div>

        {EV_ROWS.map((e) => (
          <div key={e.date + e.std} style={{ ...ROW, gridTemplateColumns: EV_COLS }}>
            <Cell nums color="var(--text-secondary)">{e.date}</Cell>
            <Cell body ellipsis>{e.std}</Cell>
            <span style={{ justifySelf: 'start' }}>
              <Pill tone={TONES[e.catTone]} height={20} radius="var(--radius-medium)">
                {e.cat}
              </Pill>
            </span>
            <Cell body bold nums color={e.gain ? 'var(--success-fg)' : 'var(--danger-fg)'}>{e.pts}</Cell>
            <Cell ellipsis color="var(--text-secondary)">{e.note}</Cell>
          </div>
        ))}
      </div>

      <div style={CARD}>
        <CardHead>
          <SectionTitle flex>Coaching</SectionTitle>
          <SmallButton primary onClick={s.openCoach}>
            Assign Coaching
          </SmallButton>
        </CardHead>

        {coachRows.map((c) => {
          const sentAt = s.reminded[cur.id + c.module]
          const remindable = c.state === 'Assigned' || c.state === 'Overdue' || c.state === 'Awaiting Ack'
          return (
            <div key={c.module} style={{ ...ROW, display: 'flex', gap: 'var(--size-120)' }}>
              <Cell body flex ellipsis>
                {c.module}
                {c.blocking ? ' · Blocking' : ''}
              </Cell>
              <Cell color="var(--text-secondary)">{c.due}</Cell>
              <DotPill tone={coachTone(c.state)} label={c.state} />
              <IconButton
                name={sentAt ? 'PgSendFilled' : 'PgSend'}
                title={sentAt ? `Reminded ${sentAt}` : remindable ? 'Send a reminder' : 'Nothing to remind'}
                color={sentAt ? 'var(--success-fg)' : remindable ? 'var(--text-secondary)' : 'var(--text-disabled)'}
                cursor={remindable ? 'pointer' : 'default'}
                onClick={remindable ? () => s.remind(c.module) : undefined}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
