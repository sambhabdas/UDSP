'use client'

import { body1, caption1 } from '../../ds/type'
import { catTone, phoneOf, signed, statusTone } from './data'
import type { DoneRow, LedgerRow, OpenRow } from './data'
import { Button, Checkbox, DaLink, Empty, GridRow, IconButton, Pill } from './parts'
import { COLS, NUM } from './style'
import type { EventsState } from './useEvents'

/** All — every event that scored, including the ones since voided. */
export function AllTable({ s }: { s: EventsState }) {
  const rows = s.pageAll.slice
  if (rows.length === 0) return <Empty>No events match.</Empty>
  return (
    <>
      {rows.map((r, i) => (
        <AllRow key={`${r.da}-${r.day}-${i}`} s={s} r={r} />
      ))}
    </>
  )
}

function AllRow({ s, r }: { s: EventsState; r: LedgerRow }) {
  const c = catTone(r.cat)
  const t = r.coach ? statusTone(r.coach) : null
  const strike = r.voided ? 'line-through' : 'none'
  return (
    <GridRow cols={COLS.all} opacity={r.voided ? '.62' : '1'}>
      <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.date}</span>
      <DaLink name={r.da} strike={r.voided} onClick={() => s.toastMsg(`Opening Associates · ${r.da}`)} />
      <span>
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: c.bg, color: c.fg, fontSize: 'var(--caption-1-size)', lineHeight: 'var(--caption-1-lh)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', textDecoration: strike }}>
          {r.standard}
        </span>
      </span>
      <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: r.pts < 0 ? 'var(--danger-fg)' : 'var(--success-fg)', ...NUM, textDecoration: strike }}>
        {signed(r.pts)}
      </span>
      <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.source}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
        {r.voided && <Pill label="Voided" bg="var(--surface-subtle)" fg="var(--text-secondary)" border="var(--border-default)" />}
        {r.module && <span style={{ ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.module}</span>}
        {r.plain && <span style={{ ...body1, color: r.plainAmber ? 'var(--warning-fg)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.plain}</span>}
      </div>
      <span>
        {r.coach && t
          ? <Pill label={r.coach} bg={t.bg} fg={t.fg} border={t.bd} onClick={(e) => { e.stopPropagation(); s.pickTab(r.coach === 'Completed' ? 'done' : 'open') }} />
          : <span style={{ ...body1, color: 'var(--text-secondary)' }}>-</span>}
      </span>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--size-40)' }}>
        <IconButton icon="IbCall" title="Call" color="var(--green-600)" onClick={() => s.toastMsg(`Calling ${r.da} · ${phoneOf(r.da)}`)} />
        <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'kebab', { row: r, tab: 'all' })} />
      </div>
    </GridRow>
  )
}

/** Open — what is still owed, in the order it needs chasing. */
export function OpenTable({ s }: { s: EventsState }) {
  const rows = s.pageOpen.slice
  if (rows.length === 0) return <Empty>No open coaching.</Empty>
  return (
    <>
      {rows.map((r) => (
        <OpenRowView key={r.da + r.module} s={s} r={r} />
      ))}
    </>
  )
}

function OpenRowView({ s, r }: { s: EventsState; r: OpenRow }) {
  const c = catTone(r.cat)
  const t = statusTone(r.status)
  const key = r.da + r.module
  return (
    <GridRow cols={COLS.open}>
      <Checkbox on={!!s.sel[key]} onClick={(e) => { e.stopPropagation(); s.toggleSel(key) }} />
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: r.red ? 'var(--danger-fg)' : r.amber ? 'var(--warning-fg)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>{r.due}</span>
      <DaLink name={r.da} onClick={() => s.toastMsg(`Opening Associates · ${r.da}`)} />
      <span>
        {r.standard
          ? <Pill label={r.standard} bg={c.bg} fg={c.fg} />
          : <span style={{ ...body1, color: 'var(--text-secondary)' }}>-</span>}
      </span>
      <span style={{ ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.module}</span>
      <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.assigned}</span>
      <span><Pill label={r.status} bg={t.bg} fg={t.fg} border={t.bd} /></span>
      <span style={{ ...body1, color: r.reminded ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {r.reminded ?? 'Never'}
      </span>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--size-40)' }}>
        <Button kind="primary" small onClick={() => s.toastMsg(`Reminder sent to ${r.da} - logged to the Inbox timeline`)}>Remind</Button>
        <IconButton icon="IbCall" title="Call" color="var(--green-600)" onClick={() => s.toastMsg(`Calling ${r.da} · ${r.phone}`)} />
        <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'kebab', { row: r, tab: 'open' })} />
      </div>
    </GridRow>
  )
}

/** Completed — the closed loops, and whether the conversation happened. */
export function DoneTable({ s }: { s: EventsState }) {
  const rows = s.pageDone.slice
  if (rows.length === 0) return <Empty>No completions match.</Empty>
  return (
    <>
      {rows.map((r) => (
        <DoneRowView key={r.da + r.module} s={s} r={r} />
      ))}
    </>
  )
}

function DoneRowView({ s, r }: { s: EventsState; r: DoneRow }) {
  const c = catTone(r.cat)
  const key = r.da + r.module
  // A "-" score means there was no quiz at all, so no stars are drawn.
  const filled = r.scoreN < 0 ? 0 : Math.round(r.scoreN / 20)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: COLS.done, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 48, padding: 'var(--size-60) var(--size-160)' }}>
        <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.completed}</span>
        <DaLink name={r.da} onClick={() => s.toastMsg(`Opening Associates · ${r.da}`)} />
        <span>
          {r.standard
            ? <Pill label={r.standard} bg={c.bg} fg={c.fg} />
            : <span style={{ ...body1, color: 'var(--text-secondary)' }}>-</span>}
        </span>
        <span style={{ ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.module}</span>
        <span style={{ textAlign: 'right', ...body1, color: 'var(--text-secondary)', ...NUM, whiteSpace: 'nowrap' }}>{r.time}</span>
        <span style={{ textAlign: 'right', whiteSpace: 'nowrap', ...body1, letterSpacing: '.6px' }}>
          <span style={{ color: 'var(--yellow-500)' }}>{'★'.repeat(filled)}</span>
          <span style={{ color: 'var(--text-disabled)' }}>{r.scoreN < 0 ? '' : '☆'.repeat(5 - filled)}</span>
          {r.scoreN < 0 && <span style={{ color: 'var(--text-secondary)' }}>-</span>}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
          <span style={{ ...body1, color: r.manual ? 'var(--text-secondary)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ack}</span>
          {r.repeat && (
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', color: 'var(--warning-fg)', fontSize: 'var(--caption-1-size)', lineHeight: 'var(--caption-1-lh)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Repeat
            </span>
          )}
        </span>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div title="Post event conversation">
            <Checkbox on={!!s.convo[key]} onClick={(e) => { e.stopPropagation(); s.toggleConvo(key, r.da) }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--size-40)' }}>
          <IconButton icon="IbCall" title="Call" color="var(--green-600)" onClick={() => s.toastMsg(`Calling ${r.da} · ${phoneOf(r.da)}`)} />
          <IconButton icon="PgDocumentText" title="View Acknowledgement" color="var(--blue-700)" onClick={() => s.openDlg('ack', { kind: 'ack', label: `${r.da} · ${r.module}`, row: r })} />
          <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'kebab', { row: r, tab: 'done' })} />
        </div>
      </div>
    </div>
  )
}

/** Page N of M, with a numbered strip between the arrows. */
export function Pager({ s }: { s: EventsState }) {
  const g = s.page
  const from = g.total === 0 ? 0 : (g.p - 1) * 10 + 1
  const pages = []
  for (let i = 1; i <= g.max; i++) pages.push(i)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-100) var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
      <span style={{ ...caption1, color: 'var(--text-secondary)', ...NUM }}>
        Showing {from}-{Math.min(g.p * 10, g.total)} of {g.total}
      </span>
      <div style={{ flex: 1 }} />
      <Arrow icon="FnChevronLeft" enabled={g.p > 1} onClick={() => { if (g.p > 1) s.setPage(g.p - 1) }} />
      {pages.map((i) => (
        <div
          key={i}
          data-fx=""
          tabIndex={0}
          role="button"
          onClick={() => s.setPage(i)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, height: 28,
            padding: '0 var(--size-60)', borderRadius: 'var(--radius-small)',
            background: g.p === i ? 'var(--blue-50)' : 'var(--surface-card)',
            border: `1px solid ${g.p === i ? 'var(--blue-200)' : 'var(--border-default)'}`,
            color: g.p === i ? 'var(--blue-700)' : 'var(--text-secondary)',
            ...caption1, fontWeight: g.p === i ? 'var(--weight-semibold)' : 'var(--weight-regular)',
            cursor: 'pointer', ...NUM,
          }}
        >
          {i}
        </div>
      ))}
      <Arrow icon="FnChevronRight" enabled={g.p < g.max} onClick={() => { if (g.p < g.max) s.setPage(g.p + 1) }} />
    </div>
  )
}

function Arrow({ icon, enabled, onClick }: { icon: string; enabled: boolean; onClick: () => void }) {
  return (
    <IconButton
      icon={icon}
      bordered
      color={enabled ? 'var(--text-secondary)' : 'var(--text-disabled)'}
      onClick={onClick}
    />
  )
}
