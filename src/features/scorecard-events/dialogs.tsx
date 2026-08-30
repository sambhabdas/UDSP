'use client'

import type { ReactNode } from 'react'
import { body1, caption1Strong, subtitle1 } from '../../ds/type'
import { signed } from './data'
import { Button, Combo, Field, IconButton, Input, TextArea } from './parts'
import { FIELD_LABEL } from './style'
import type { EventsState } from './useEvents'

export function Dialogs({ s }: { s: EventsState }) {
  if (!s.dlg) return null
  const ctx = s.dlgCtx
  const kind = ctx?.kind

  const reasonTitle =
    kind === 'void' ? 'Void Event'
      : kind === 'restore' ? 'Restore Event'
        : kind === 'cancel' ? 'Cancel Assignment'
          : 'Mark Completed Manually'

  const titles: Record<string, string> = {
    event: 'Log Manual Event',
    ack: 'Acknowledgement',
    reassign: kind === 'assign' ? 'Assign Module' : 'Reassign Module',
    extend: 'Extend Due Date',
    reason: reasonTitle,
  }
  const saves: Record<string, string> = {
    event: 'Save Event',
    ack: 'Close',
    reassign: kind === 'assign' ? 'Assign' : 'Reassign',
    extend: 'Save',
    reason: reasonTitle,
  }

  // Voiding and cancelling destroy something, so their button is red.
  const danger = s.dlg === 'reason' && (kind === 'void' || kind === 'cancel')
  const subject = s.dlg === 'event' ? s.ev.da ?? 'New event' : ctx?.label ?? ''

  return (
    <div onClick={s.closeDlg} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width: s.dlg === 'event' ? 672 : 560, maxHeight: '84vh',
          background: 'var(--surface-raised)', borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-200)' }}>
          <span style={subtitle1}>{titles[s.dlg]}</span>
          <div style={{ flex: 1 }} />
          <IconButton icon="FnDismiss" onClick={s.closeDlg} size={32} />
        </div>

        <div data-rsp-page="" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
          <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{subject}</span>
          {s.dlg === 'event' && <LogEvent s={s} />}
          {s.dlg === 'reassign' && <Reassign s={s} />}
          {s.dlg === 'extend' && <Extend s={s} />}
          {s.dlg === 'ack' && <Acknowledgement s={s} />}
          {s.dlg === 'reason' && <Reason s={s} />}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200)', borderTop: '1px solid var(--border-subtle)' }}>
          {s.dlg !== 'ack' && <Button onClick={s.closeDlg}>Cancel</Button>}
          <SaveButton danger={danger} onClick={() => save(s)}>{saves[s.dlg]}</SaveButton>
        </div>
      </div>
    </div>
  )
}

function SaveButton({ danger, onClick, children }: { danger: boolean; onClick: () => void; children: ReactNode }) {
  const bg = danger ? 'var(--red-600)' : 'var(--primary)'
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        height: 'var(--control-height)', display: 'flex', alignItems: 'center', padding: '0 var(--size-160)',
        borderRadius: 'var(--radius-medium)', border: `1px solid ${bg}`, background: bg,
        color: 'var(--text-inverse)', ...body1, fontWeight: 'var(--weight-semibold)', cursor: 'pointer',
      }}
    >
      {children}
    </div>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>{children}</div>
}

function LogEvent({ s }: { s: EventsState }) {
  const openMenu = (kind: string) => (e: React.FocusEvent<HTMLInputElement>) => s.openMenu(e as unknown as React.MouseEvent, kind)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
      <Row>
        <Field label="Associate">
          <Combo card value={s.menu?.kind === 'da' ? s.menuQuery : s.ev.da ?? ''} placeholder="Type to search associates" onChange={s.setMenuQuery} onOpen={openMenu('da')} />
        </Field>
        <Field label="Standard">
          <Combo card value={s.menu?.kind === 'standard' ? s.menuQuery : s.ev.standard ?? ''} placeholder="Type to search standards" onChange={s.setMenuQuery} onOpen={openMenu('standard')} />
        </Field>
      </Row>
      <Row>
        <Field label="Direction">
          <div style={{ display: 'flex', height: 'var(--control-height)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
            <Half on={s.ev.dir === 'neg'} tone="danger" onClick={() => s.setEv({ ...s.ev, dir: 'neg' })}>Negative</Half>
            <div style={{ width: 1, background: 'var(--border-default)' }} />
            <Half on={s.ev.dir === 'pos'} tone="success" onClick={() => s.setEv({ ...s.ev, dir: 'pos' })}>Positive</Half>
          </div>
        </Field>
        <Field label="Quantity">
          <Input value={s.ev.qty} onChange={(v) => s.setEv({ ...s.ev, qty: v })} suffix={s.stdObj?.per} numeric />
        </Field>
      </Row>
      <Row>
        <Field label="Event Date">
          <Input type="date" value={s.ev.date} onChange={(v) => s.setEv({ ...s.ev, date: v })} />
        </Field>
        <Field label="Vehicle">
          <Combo card value={s.menu?.kind === 'vehicle' ? s.menuQuery : s.ev.vehicle ?? ''} placeholder="Type to search vehicles" onChange={s.setMenuQuery} onOpen={openMenu('vehicle')} />
        </Field>
      </Row>
      <Field label="Description">
        <TextArea value={s.ev.desc} onChange={(v) => s.setEv({ ...s.ev, desc: v })} placeholder="What was seen" />
      </Field>
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: 'var(--size-100) var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
        <span style={FIELD_LABEL}>Points</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: s.evPoints < 0 ? 'var(--danger-fg)' : s.evPoints > 0 ? 'var(--success-fg)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {s.stdObj ? signed(s.evPoints) : '-'}
        </span>
      </div>
    </div>
  )
}

function Half({ on, tone, onClick, children }: { on: boolean; tone: 'danger' | 'success'; onClick: () => void; children: string }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: on ? `var(--${tone}-bg)` : 'var(--surface-card)',
        color: on ? `var(--${tone}-fg)` : 'var(--text-secondary)',
        ...body1, fontWeight: 'var(--weight-semibold)', cursor: 'pointer',
      }}
    >
      {children}
    </div>
  )
}

function Reassign({ s }: { s: EventsState }) {
  return (
    <Row>
      <Field label="Module">
        <Combo
          card
          value={s.menu?.kind === 'module' ? s.menuQuery : s.re.module ?? ''}
          placeholder="Type to search modules"
          onChange={s.setMenuQuery}
          onOpen={(e) => s.openMenu(e as unknown as React.MouseEvent, 'module')}
        />
      </Field>
      <Field label="Due Within">
        <Input value={s.re.due} onChange={(v) => s.setRe({ ...s.re, due: v })} suffix="days" numeric />
      </Field>
    </Row>
  )
}

function Extend({ s }: { s: EventsState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
      <Field label="New Due Date">
        <Input type="date" value={s.ex.date} onChange={(v) => s.setEx({ ...s.ex, date: v })} />
      </Field>
      <Field label="Reason">
        <TextArea value={s.ex.reason} onChange={(v) => s.setEx({ ...s.ex, reason: v })} placeholder="Why the due date is moving" />
      </Field>
    </div>
  )
}

/**
 * The acknowledgement record.
 *
 * A manually-closed assignment has no signature, and the dialog says so
 * plainly rather than leaving the field blank.
 */
function Acknowledgement({ s }: { s: EventsState }) {
  const r = s.dlgCtx?.row
  if (!r) return null
  const rows = [
    { label: 'Associate', value: r.da, muted: false },
    { label: 'Module', value: r.module, muted: false },
    { label: 'Acknowledged', value: r.manual ? '-' : r.ack, muted: !!r.manual },
    { label: 'Quiz Score', value: r.score || '-', muted: false },
    { label: 'Completed', value: r.completed, muted: false },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
      <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: 'var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
        <span style={body1}>
          {r.manual
            ? 'Completed manually - the associate never signed an acknowledgement for this module.'
            : '"I have watched the training and understand what is expected of me on road."'}
        </span>
        <span style={{ fontSize: 'var(--caption-1-size)', lineHeight: 'var(--caption-1-lh)', color: 'var(--text-secondary)' }}>
          {r.manual ? 'Recorded by K. Ortiz' : 'Signed in the driver app'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((a) => (
          <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 36, borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ width: 140, ...caption1Strong, color: 'var(--text-secondary)' }}>{a.label}</span>
            <span style={{ flex: 1, ...body1, color: a.muted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Reason({ s }: { s: EventsState }) {
  const kind = s.dlgCtx?.kind
  const ph =
    kind === 'void' ? 'Why this event is being voided'
      : kind === 'restore' ? 'Why this event is being restored'
        : kind === 'cancel' ? 'Why this assignment is being cancelled'
          : 'How the coaching was completed'
  return (
    <Field label="Reason">
      <TextArea value={s.reasonText} onChange={s.setReasonText} placeholder={ph} />
    </Field>
  )
}

function save(s: EventsState) {
  const kind = s.dlgCtx?.kind
  if (s.dlg === 'ack') { s.closeDlg(); return }
  if (s.dlg === 'event') {
    if (!s.ev.da) { s.toastMsg('Pick an associate'); return }
    if (!s.ev.standard) { s.toastMsg('Pick a standard'); return }
    s.closeDlg()
    s.toastMsg(`Event saved · ${signed(s.evPoints)} · ${s.ev.da}`)
    return
  }
  if (s.dlg === 'reassign') {
    if (!s.re.module) { s.toastMsg('Pick a module'); return }
    s.closeDlg()
    s.setSel({})
    s.toastMsg(`${kind === 'assign' ? 'Module assigned' : 'Module reassigned'} · due in ${s.re.due} days`)
    return
  }
  if (s.dlg === 'extend') {
    if (s.ex.reason.trim().length < 5) { s.toastMsg('A reason of at least 5 characters is required'); return }
    s.closeDlg()
    s.setSel({})
    s.toastMsg(`Due date moved to ${s.ex.date}`)
    return
  }
  if (s.reasonText.trim().length < 5) { s.toastMsg('A reason of at least 5 characters is required'); return }
  s.closeDlg()
  s.setReasonText('')
  s.toastMsg(
    kind === 'void' ? 'Event voided - excluded from every total'
      : kind === 'restore' ? 'Event restored - points re-included'
        : kind === 'cancel' ? 'Assignment cancelled - shift block cleared'
          : 'Marked completed manually - recorded as no DA acknowledgement',
  )
}
