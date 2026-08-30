'use client'

import { days, latestOdo, money, renewalStatus, uTone } from '../calc'
import { Button, Cell, DotPill, Pill, Row, SearchBox, SectionTitle } from '../parts'
import { CARD, LABEL } from '../style'
import type { VehiclesState } from '../useVehicles'
import { int } from '../../../ds/format'

const REM_COLS = '1.6fr 1.4fr 120px 220px'
const REN_COLS = '1.6fr 1.2fr 140px 120px 110px 110px'

/** What is owed on this vehicle: work to schedule, and paper to keep valid. */
export function MaintTab({ s }: { s: VehiclesState }) {
  return (
    <>
      <Reminders s={s} />
      <Renewals s={s} />
    </>
  )
}

function Reminders({ s }: { s: VehiclesState }) {
  const v = s.pv
  const latest = latestOdo(s.odo, v.id)
  const q = s.remSearch.trim().toLowerCase()
  const rows = s.reminders
    .filter((r) => r.vid === v.id && !r.done)
    .filter((r) => !q || r.name.toLowerCase().includes(q))

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <SectionTitle>Maintenance Reminders</SectionTitle>
        <div style={{ flex: 1 }} />
        <SearchBox value={s.remSearch} onChange={s.setRemSearch} placeholder="Search reminders" />
        <Button primary onClick={() => s.openDlg('reminder', { vid: v.id, dueType: 'Date' })}>+ Add reminder</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: REM_COLS, padding: 'var(--size-60) var(--size-160)', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <span style={LABEL}>Reminder</span>
        <span style={LABEL}>Due</span>
        <span style={LABEL}>Urgency</span>
        <span style={{ ...LABEL, textAlign: 'center' }}>Actions</span>
      </div>

      {rows.map((r) => {
        let due: string
        let u: 'red' | 'amber' | 'green'
        let dueColor = 'var(--text-primary)'
        if (r.dueType === 'Mileage') {
          if (!latest) {
            // A mileage reminder is unmeasurable until somebody reads the dial.
            due = 'Needs a reading'
            u = 'amber'
            dueColor = 'var(--warning-fg)'
          } else {
            const away = r.dueMi! - latest.reading
            due = away <= 0 ? 'Overdue' : `${int(away)} mi away`
            u = away <= 0 ? 'red' : away <= 500 ? 'amber' : 'green'
          }
        } else {
          const dd = days(r.dd!)
          due = dd < 0 ? 'Overdue' : r.dueDate!
          u = dd < 0 || dd <= 7 ? 'red' : dd <= 30 ? 'amber' : 'green'
        }
        const t = uTone(u)
        return (
          <Row key={r.id} cols={REM_COLS}>
            <Cell bold>{r.name}</Cell>
            <Cell color={dueColor}>{due}</Cell>
            <span>
              <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>
                {u === 'red' ? 'Red' : u === 'amber' ? 'Amber' : 'Green'}
              </DotPill>
            </span>
            <span style={{ display: 'flex', justifyContent: 'center', gap: 'var(--size-40)' }}>
              <Button
                onClick={() => {
                  s.setReminders(s.reminders.map((x) => (x.id === r.id ? { ...x, done: true } : x)))
                  // A repeating reminder does not end when it is done — the next
                  // one is already owed.
                  s.toastMsg(r.repeat !== 'none' ? `Done · next ${r.name} created` : 'Done')
                }}
              >
                Mark done
              </Button>
              <Button
                danger
                onClick={() => { s.setReminders(s.reminders.filter((x) => x.id !== r.id)); s.toastMsg('Removed') }}
              >
                Remove
              </Button>
            </span>
          </Row>
        )
      })}
    </div>
  )
}

function Renewals({ s }: { s: VehiclesState }) {
  const q = s.renSearch.trim().toLowerCase()
  const rows = s.renewals
    .filter((n) => n.vid === s.pv.id)
    .filter((n) => !q || `${n.type} ${n.name}`.toLowerCase().includes(q))

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <SectionTitle>Renewals</SectionTitle>
        <div style={{ flex: 1 }} />
        <SearchBox value={s.renSearch} onChange={s.setRenSearch} placeholder="Search renewals" />
        <Button primary onClick={() => s.openDlg('renewal', { vid: s.pv.id })}>+ Add renewal</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: REN_COLS, padding: 'var(--size-60) var(--size-160)', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <span style={LABEL}>Renewal</span>
        <span style={LABEL}>Expires</span>
        <span style={LABEL}>Status</span>
        <span style={LABEL}>Last renewed</span>
        <span style={{ ...LABEL, textAlign: 'right' }}>Cost</span>
        <span style={{ ...LABEL, textAlign: 'center' }}>Actions</span>
      </div>

      {rows.map((n) => {
        const st = renewalStatus(n)
        const t = uTone(st.u)
        return (
          <Row key={n.id} cols={REN_COLS}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
              <Pill>{n.type}</Pill>
              <Cell>{n.name || '-'}</Cell>
            </div>
            <Cell>{n.exp}</Cell>
            <span>
              <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>{st.u === 'LAPSED' ? 'LAPSED' : st.label}</DotPill>
            </span>
            <Cell>{n.renewed || '-'}</Cell>
            <Cell align="right" nums>{n.cost ? money(n.cost) : '-'}</Cell>
            <span style={{ display: 'flex', justifyContent: 'center' }}>
              <Button onClick={() => s.openDlg('renew', { nid: n.id })}>Renew</Button>
            </span>
          </Row>
        )
      })}
    </div>
  )
}
