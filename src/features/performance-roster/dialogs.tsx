'use client'

import type { ReactNode } from 'react'
import { body1 } from '../../ds/type'
import { eventPoints, standardBy } from './calc'
import { signed } from './data'
import { Button, Combo, DialogTitle, Field, IconButton, Input, TextArea, Toggle } from './parts'
import { FIELD_LABEL } from './style'
import type { RosterState } from './useRoster'

const TITLES: Record<string, string> = {
  event: 'Log Event',
  assign: 'Assign Coaching',
  kudo: 'Give Kudo',
  promote: 'Mark Promoted',
}

const SAVE: Record<string, string> = {
  event: 'Save Event',
  assign: 'Assign',
  kudo: 'Give Kudo',
  promote: 'Mark Promoted',
}

export function Dialogs({ s }: { s: RosterState }) {
  if (!s.dlg) return null
  const reasonKind = s.dlgCtx?.kind
  const reasonTitle = reasonKind === 'kudoDelete' ? 'Delete Kudo' : 'Cancel Assignment'
  const title = TITLES[s.dlg] ?? reasonTitle
  const save = SAVE[s.dlg] ?? reasonTitle
  // The reason dialog is about the thing being undone; every other dialog is
  // about the associate.
  const subject = s.dlg === 'reason' ? s.dlgCtx?.label ?? '' : s.dlgSubject ?? s.current.name

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
          <DialogTitle>{title}</DialogTitle>
          <div style={{ flex: 1 }} />
          <IconButton icon="FnDismiss" onClick={s.closeDlg} size={32} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
          <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>{subject}</span>
          {s.dlg === 'event' && <LogEvent s={s} />}
          {s.dlg === 'assign' && <AssignCoaching s={s} />}
          {s.dlg === 'promote' && <Promote s={s} />}
          {s.dlg === 'reason' && <Reason s={s} />}
          {s.dlg === 'kudo' && <Kudo s={s} />}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200)', borderTop: '1px solid var(--border-subtle)' }}>
          <Button onClick={s.closeDlg}>Cancel</Button>
          <Button kind="primary" onClick={() => saveDialog(s)}>{save}</Button>
        </div>
      </div>
    </div>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>{children}</div>
}

function Stack({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>{children}</div>
}

function LogEvent({ s }: { s: RosterState }) {
  const std = standardBy(s.ev.standard)
  const pts = eventPoints(s.ev.standard, s.ev.dir, s.ev.qty)
  // While the standards menu is open the field shows what you are typing;
  // otherwise it shows what is picked.
  const standardText = s.menu?.kind === 'standard' ? s.menuQuery : s.ev.standard ?? ''
  const vehicleText = s.menu?.kind === 'vehicle' ? s.menuQuery : s.ev.vehicle ?? ''

  return (
    <Stack>
      <Row>
        <Field label="Standard">
          <Combo value={standardText} onChange={s.setMenuQuery} placeholder="Search standards" onOpen={(e) => s.openMenu(e, 'standard')} />
        </Field>
        <Field label="Direction">
          <div style={{ display: 'flex', height: 'var(--control-height)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
            <Half on={s.ev.dir === 'neg'} tone="danger" onClick={() => s.setEv({ ...s.ev, dir: 'neg' })}>Negative</Half>
            <div style={{ width: 1, background: 'var(--border-default)' }} />
            <Half on={s.ev.dir === 'pos'} tone="success" onClick={() => s.setEv({ ...s.ev, dir: 'pos' })}>Positive</Half>
          </div>
        </Field>
      </Row>
      <Row>
        <Field label="Quantity">
          <Input value={s.ev.qty} onChange={(v) => s.setEv({ ...s.ev, qty: v })} suffix={std?.per} numeric />
        </Field>
        <Field label="Event Date">
          <Input type="date" value={s.ev.date} onChange={(v) => s.setEv({ ...s.ev, date: v })} />
        </Field>
      </Row>
      <Field label="Vehicle">
        <Combo value={vehicleText} onChange={s.setMenuQuery} placeholder="Search vehicles" onOpen={(e) => s.openMenu(e, 'vehicle')} />
      </Field>
      <Field label="Description">
        <TextArea value={s.ev.desc} onChange={(v) => s.setEv({ ...s.ev, desc: v })} placeholder="What was seen" height={64} />
      </Field>
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: 'var(--size-100) var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
        <span style={FIELD_LABEL}>Points</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: pts < 0 ? 'var(--danger-fg)' : pts > 0 ? 'var(--success-fg)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {std ? signed(pts) : '-'}
        </span>
      </div>
    </Stack>
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

function AssignCoaching({ s }: { s: RosterState }) {
  const moduleText = s.menu?.kind === 'module' ? s.menuQuery : s.as.module ?? ''
  return (
    <Stack>
      <Row>
        <Field label="Module">
          <Combo value={moduleText} onChange={s.setMenuQuery} placeholder="Search modules" onOpen={(e) => s.openMenu(e, 'module')} />
        </Field>
        <Field label="Due Within">
          <Input value={s.as.due} onChange={(v) => s.setAs({ ...s.as, due: v })} suffix="days" numeric />
        </Field>
      </Row>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
        <Toggle on={s.as.blocks} onClick={() => s.setAs({ ...s.as, blocks: !s.as.blocks })} />
        <span style={body1}>Blocks shift when overdue</span>
      </div>
    </Stack>
  )
}

function Promote({ s }: { s: RosterState }) {
  return (
    <Stack>
      <Field label="Promoted On">
        <Input type="date" value={s.promo.date} onChange={(v) => s.setPromo({ ...s.promo, date: v })} />
      </Field>
      <Field label="Note">
        <TextArea value={s.promo.note} onChange={(v) => s.setPromo({ ...s.promo, note: v })} placeholder="Shown on the promoted tag" height={56} />
      </Field>
    </Stack>
  )
}

function Reason({ s }: { s: RosterState }) {
  return (
    <Field label="Reason">
      <TextArea
        value={s.reasonText}
        onChange={s.setReasonText}
        placeholder={s.dlgCtx?.kind === 'kudoDelete' ? 'Why this kudo is being removed' : 'Why this assignment is being cancelled'}
        height={64}
      />
    </Field>
  )
}

function Kudo({ s }: { s: RosterState }) {
  return (
    <Stack>
      <Field label="Kudo">
        <TextArea value={s.kudo.text} onChange={(v) => s.setKudo({ ...s.kudo, text: v })} placeholder="Shown to the driver with your first name" height={64} />
      </Field>
      <Field label="Date">
        <Input type="date" value={s.kudo.date} onChange={(v) => s.setKudo({ ...s.kudo, date: v })} />
      </Field>
    </Stack>
  )
}

/** Each dialog refuses to save until it has what it needs, and says what. */
function saveDialog(s: RosterState) {
  const subject = s.dlgSubject ?? s.current.name
  if (s.dlg === 'event') {
    if (!s.ev.standard) { s.toastMsg('Pick a standard'); return }
    const pts = eventPoints(s.ev.standard, s.ev.dir, s.ev.qty)
    s.closeDlg()
    s.toastMsg(`Event saved · ${signed(pts)} · ${subject}`)
    return
  }
  if (s.dlg === 'assign') {
    if (!s.as.module) { s.toastMsg('Pick a module'); return }
    s.closeDlg()
    s.setSel({})
    s.toastMsg(`Coaching assigned · ${s.as.module} · due in ${s.as.due} days`)
    return
  }
  if (s.dlg === 'promote') {
    s.closeDlg()
    s.toastMsg('Marked promoted - dropped from the Overview shortlist')
    return
  }
  if (s.dlg === 'reason') {
    if (s.reasonText.trim().length < 5) { s.toastMsg('A reason of at least 5 characters is required'); return }
    const kind = s.dlgCtx?.kind
    s.closeDlg()
    s.setReasonText('')
    s.toastMsg(kind === 'kudoDelete' ? 'Kudo deleted - the Inbox timeline note is removed' : 'Assignment cancelled - shift block cleared')
    return
  }
  if (s.kudo.text.trim().length < 3) { s.toastMsg('Write the kudo first'); return }
  s.closeDlg()
  s.toastMsg('Kudo given - logged to the Inbox timeline')
}
