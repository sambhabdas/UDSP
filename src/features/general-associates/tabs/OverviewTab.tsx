'use client'

import { caption1 } from '../../../ds/type'
import { Cell, CardHead, Link, Pill, SectionTitle, Tile } from '../parts'
import { CARD, ROW, TILE_GRID } from '../style'
import { TONES, signed, tierOf } from '../calc'
import { FEED_ROWS } from '../data'
import type { GaState } from '../useGeneralAssociates'

/**
 * Overview - the six numbers that decide whether anything needs doing today,
 * plus the week ahead and what has happened lately.
 */
export function OverviewTab({ s }: { s: GaState }) {
  const cur = s.cur
  const tier = tierOf(cur.net)
  const open = s.openCoaching
  const overdue = open.some((c) => c.state === 'Overdue')

  // Blocked outranks awaiting-ack: one gates the shift, the other only nags.
  const alert = cur.blocked
    ? 'Blocked - Safe Backing overdue since Jul 26'
    : cur.awaitingAck
      ? 'Awaiting acknowledgement - quiz passed, not yet signed'
      : ''

  return (
    <>
      {alert && (
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-80) var(--size-120)',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-medium)',
          }}
        >
          <span style={{ fontSize: 'var(--body-1-size)', lineHeight: 'var(--body-1-lh)', fontWeight: 'var(--weight-semibold)', color: 'var(--warning-fg)' }}>
            {alert}
          </span>
        </div>
      )}

      <div style={TILE_GRID}>
        <Tile
          label="Net"
          value={signed(cur.net)}
          color={cur.net < 0 ? 'var(--danger-fg)' : 'var(--success-fg)'}
          sub={tier.label}
          title="All-time, non-voided Events"
          onClick={() => s.setTab('performance')}
        />
        <Tile
          label="Coaching"
          value={String(open.length)}
          color={overdue ? 'var(--danger-fg)' : 'var(--text-primary)'}
          sub={open.length ? open[0].state : 'Nothing open'}
          title="Open assignments"
          onClick={() => s.setTab('performance')}
        />
        <Tile
          label="Attendance 30d"
          value={`${cur.abs} abs`}
          color={cur.abs ? 'var(--danger-fg)' : 'var(--success-fg)'}
          sub={`${cur.pto} PTO`}
          title="Absences and approved time off, last 30 days"
          onClick={() => s.setTab('schedule')}
        />
        <Tile
          label="Next Shift"
          value={cur.next === '-' ? '-' : cur.next.split(' · ')[0]}
          sub={cur.next === '-' ? undefined : cur.next.split(' · ')[1]}
          title="From the Schedule"
          onClick={() => s.setTab('schedule')}
        />
        <Tile
          label="Hours PP"
          value={`${cur.hoursPP} h`}
          color="var(--blue-700)"
          sub="P14 · Jul 19 - Aug 1"
          title="Scheduled hours in the pay period"
          onClick={() => s.setTab('timecard')}
        />
        <Tile
          label="Kudos"
          value="2"
          sub="Last Jul 21"
          title="Non-scoring recognition"
          onClick={() => s.setTab('performance')}
        />
      </div>

      <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'var(--size-160)', alignItems: 'start' }}>
        <div style={CARD}>
          <CardHead>
            <SectionTitle flex>This Week</SectionTitle>
            <Link onClick={(e) => { e.preventDefault(); s.setTab('schedule') }}>Schedule</Link>
          </CardHead>
          {[
            {
              day: 'Wed Jul 29',
              today: true,
              txt: cur.onRoute ? `DOT 7:30 · on route ${cur.onRoute}` : cur.next !== '-' ? 'DOT 7:30' : 'Not scheduled',
              color: 'var(--text-primary)',
              hrs: cur.next !== '-' ? '10 h' : '-',
            },
            { day: 'Thu Jul 30', txt: 'DOT 7:30', color: 'var(--text-primary)', hrs: '10 h' },
            { day: 'Fri Jul 31', txt: 'DOT 7:00', color: 'var(--text-primary)', hrs: '10 h' },
            { day: 'Sat Aug 1', txt: 'Not scheduled - weekly pattern OFF', color: 'var(--text-secondary)', hrs: '-' },
          ].map((w) => (
            <div key={w.day} style={{ ...ROW, display: 'flex', gap: 'var(--size-120)' }}>
              <Cell
                width={88}
                color={w.today ? 'var(--blue-700)' : 'var(--text-secondary)'}
                bold={w.today}
              >
                {w.day}
              </Cell>
              <Cell body flex ellipsis color={w.color}>{w.txt}</Cell>
              <Cell nums color="var(--text-secondary)">{w.hrs}</Cell>
            </div>
          ))}
        </div>

        <div style={CARD}>
          <CardHead>
            <SectionTitle flex>Recent Activity</SectionTitle>
            <Link onClick={(e) => { e.preventDefault(); s.setTab('performance') }}>Performance</Link>
          </CardHead>
          {FEED_ROWS.map((f) => (
            <div key={f.when + f.tag} style={{ ...ROW, display: 'flex', gap: 'var(--size-120)' }}>
              <span style={{ width: 64, ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {f.when}
              </span>
              <Pill tone={TONES[f.tone]} height={18} radius="var(--radius-small)" padding="var(--size-60)">
                {f.tag}
              </Pill>
              <Cell flex ellipsis>{f.txt}</Cell>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
