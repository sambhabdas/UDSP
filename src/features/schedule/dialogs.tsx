'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2, caption2Strong, subtitle2 } from '../../ds/type'
import { Button, ChipButton, CheckRow, Field, Input, Note, RuleIcon, Seg, TierChip, Tick } from './parts'
import { LABEL } from './style'
import { HOURS_CAP, TIERS } from './data'
import type { Da, Dept, Shift } from './data'
import { DAY_NAMES, fmtT, parseT, weekLabelShort } from './date'
import { ExportDialog } from './ExportDialog'
import type { SchedState } from './useSchedule'

/** The shared dialog shell every one of them sits in. */
export function DialogShell({
  s,
  title,
  width,
  children,
  cta,
  ctaEnabled = true,
  ctaTone = 'primary',
  onCta,
  cancelLabel = 'Cancel',
  footer = true,
}: {
  s: SchedState
  title: string
  width: number
  children: ReactNode
  cta?: string
  ctaEnabled?: boolean
  ctaTone?: 'primary' | 'danger'
  onCta?: () => void
  cancelLabel?: string
  footer?: boolean
}) {
  const fill = ctaTone === 'danger' ? 'var(--danger-accent)' : 'var(--primary)'
  return (
    <div
      onClick={s.closeDlg}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', zIndex: 50,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflow: 'auto', padding: 'var(--size-320) var(--size-160)',
      }}
    >
      <div
        data-dialog-card=""
        data-dialog-loose=""
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width, marginBlock: 'auto', flexShrink: 0,
          overflow: 'visible', background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-dialog)',
          display: 'flex', flexDirection: 'column', gap: 'var(--size-160)', padding: 'var(--size-240)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
          <span style={{ flex: 1, minWidth: 0, ...subtitle2 }}>{title}</span>
          <CloseX onClick={s.closeDlg} />
        </div>

        {children}

        {footer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', paddingTop: 'var(--size-120)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1 }} />
            <Button onClick={s.closeDlg}>{cancelLabel}</Button>
            {cta && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => { if (ctaEnabled) onCta?.() }}
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  boxSizing: 'border-box', height: 'var(--control-height)',
                  display: 'flex', alignItems: 'center', padding: '0 var(--size-120)',
                  borderRadius: 'var(--radius-medium)',
                  background: ctaEnabled ? fill : 'var(--surface-subtle)',
                  border: `1px solid ${ctaEnabled ? fill : 'var(--border-default)'}`,
                  color: ctaEnabled ? 'var(--text-inverse)' : 'var(--text-disabled)',
                  ...caption1Strong,
                  whiteSpace: 'nowrap',
                  cursor: ctaEnabled ? 'pointer' : 'default',
                  transition: 'background var(--motion-hover)',
                }}
              >
                {cta}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CloseX({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 'var(--radius-small)',
        color: 'var(--text-secondary)', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="FnDismiss" size={16} />
    </span>
  )
}

export function Dialogs({ s }: { s: SchedState }) {
  switch (s.dlg) {
    case null: return null
    case 'reason': return <ReasonDialog s={s} />
    case 'need': return <NeedDialog s={s} />
    case 'add': return <AddDialog s={s} />
    case 'shift': return <ShiftDialog s={s} />
    case 'swap': return <SwapDialog s={s} />
    case 'swapConfirm': return <SwapConfirmDialog s={s} />
    case 'viol': return <ViolationsDialog s={s} />
    case 'depts': return <DeptsDialog s={s} />
    case 'copy': return <CopyDialog s={s} />
    case 'clear': return <ClearDialog s={s} />
    case 'stats': return <StatsDialog s={s} />
    case 'export': return <ExportDialog s={s} />
  }
}

/** Every soft warning goes through here - a typed reason or nothing happens. */
function ReasonDialog({ s }: { s: SchedState }) {
  const f = s.form as { title: string; softLines: string[]; commit: (r: string) => void; reason: string }
  const ok = f.reason.trim().length >= 5
  return (
    <DialogShell s={s} title={f.title} width={440} cta="Confirm" ctaEnabled={ok} onCta={() => f.commit(f.reason.trim())}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <Note tone="warn">{f.softLines.join(' · ')}</Note>
        <Field label="Reason">
          <Input value={f.reason} onChange={(v) => s.setF('reason', v)} placeholder="Logged with your name and the warning" />
        </Field>
      </div>
    </DialogShell>
  )
}

function NeedDialog({ s }: { s: SchedState }) {
  const f = s.form as { dept: string; day: number; val: string; reason: string }
  const dp = s.deptOf(f.dept)
  const filled = s.filled(f.dept, f.day)
  const v = parseInt(f.val, 10)
  // A need can never drop below what is already scheduled against it.
  const belowFilled = !isNaN(v) && v < filled
  const ok = !isNaN(v) && v >= filled && f.reason.trim().length >= 5

  return (
    <DialogShell
      s={s}
      title={`Edit needed count - ${dp.name} · ${DAY_NAMES[f.day]}`}
      width={440}
      cta="Save"
      ctaEnabled={ok}
      onCta={() => {
        s.setNeed(f.dept, f.day, v)
        s.closeDlg()
        s.log('Needed count', `${dp.name} · ${DAY_NAMES[f.day]} to ${v} · ${f.reason.trim()}`)
        s.toastMsg('Needed count saved - the pool and fill stats update everywhere')
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
          <Field label="Needed"><Input value={f.val} onChange={(v2) => s.setF('val', v2)} /></Field>
          <Field label="Filled">
            <span style={{ ...caption1, height: 28, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>{filled}</span>
          </Field>
        </div>
        <Field label="Reason">
          <Input value={f.reason} onChange={(v2) => s.setF('reason', v2)} placeholder="Amazon added routes for Wednesday" />
        </Field>
        <a href="/scheduling/auto-schedule" style={{ ...caption1, color: 'var(--text-link)', textDecoration: 'none' }}>
          Why open? The run’s skip log answers - Auto Schedule Result
        </a>
        {belowFilled && <span style={{ ...caption1, color: 'var(--danger-fg)' }}>Below the filled count - remove shifts first</span>}
      </div>
    </DialogShell>
  )
}

/**
 * Add or edit one shift.
 *
 * The DA picker ranks candidates and pushes anyone with a hard refusal to the
 * bottom, greyed with the reason. Punches are optional; typing any of them
 * demands all four, in order, and derives the paid length from them.
 */
function AddDialog({ s }: { s: SchedState }) {
  const f = s.form as {
    da: string | null; day: number | null; dept: string; daQ: string; daFocus?: boolean
    reason: string; editing: Shift | null; note: string
    pin?: string; plo?: string; pli?: string; pout?: string
  }
  const da = f.da ? s.daOf(f.da) : null
  const dp = s.deptOf(f.dept)
  const chk = da && f.day != null ? s.check(f.da as string, f.day, f.dept, f.editing) : null
  const needsReason = !!chk && chk.soft.length > 0

  const punches = [f.pin ?? '', f.plo ?? '', f.pli ?? '', f.pout ?? '']
  const touched = punches.some((p) => p !== '')
  const pv = punches.map(parseT)
  const punchesOk = pv.every((v) => v != null) &&
    (pv[0] as number) < (pv[1] as number) && (pv[1] as number) < (pv[2] as number) && (pv[2] as number) < (pv[3] as number)
  const paid = punchesOk ? Math.round(((pv[3] as number) - (pv[0] as number) - ((pv[2] as number) - (pv[1] as number))) / 6) / 10 : null
  const paidOk = paid != null && paid >= 1 && paid <= 24

  const ok = !!da && f.day != null && !!chk && chk.hard.length === 0 &&
    (!needsReason || f.reason.trim().length >= 5) && (!touched || paidOk)

  const candidates = s.das
    .map((d) => ({
      d,
      ex: s.exclusionOf(d.id),
      hardReason: s.check(d.id, f.day ?? 0, f.dept, f.editing).hard[0] ?? null,
    }))
    .filter((x) => !f.daQ || x.d.name.toLowerCase().includes(f.daQ.toLowerCase()))
    .sort((a, b) =>
      (a.hardReason ? 1 : 0) - (b.hardReason ? 1 : 0) ||
      (a.ex ? 1 : 0) - (b.ex ? 1 : 0) ||
      s.ranks[a.d.id] - s.ranks[b.d.id])

  const showList = !!(f.daFocus || f.daQ)

  return (
    <DialogShell
      s={s}
      title={f.editing ? 'Edit shift' : 'Add a shift'}
      width={560}
      cta={f.editing ? 'Save' : 'Add shift'}
      ctaEnabled={ok}
      onCta={() => {
        s.snap()
        if (f.editing) s.removeShift(f.editing)
        const extra: Partial<Shift> = {}
        if (touched && paidOk) {
          extra.start = pv[0] as number
          extra.lo = pv[1] as number
          extra.li = pv[2] as number
          extra.len = paid as number
        }
        if (f.note.trim()) extra.note = f.note.trim().slice(0, 140)
        s.assign(f.da as string, f.day as number, f.dept, extra)
        s.closeDlg()
        s.log(f.editing ? 'Edit shift' : 'Add shift', `${DAY_NAMES[f.day as number]} ${f.dept} · ${da?.name}${f.reason ? ` · ${f.reason.trim()}` : ''}`)
        s.toastMsg(`${f.editing ? 'Saved - ' : 'Added - '}${da?.name} · ${DAY_NAMES[f.day as number]} ${dp.code}`, true)
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
        <Field label="DA">
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Input
              value={f.daQ || (da && !f.daFocus ? da.name : '')}
              onChange={(v) => s.setF('daQ', v)}
              placeholder="Search the roster"
              onFocus={() => s.setF('daFocus', true)}
              onBlur={() => setTimeout(() => s.setF('daFocus', false), 150)}
            />
            {showList && (
              <div
                style={{
                  position: 'absolute', top: 32, left: 0, right: 0, zIndex: 50,
                  background: 'var(--surface-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)',
                  maxHeight: 180, overflow: 'hidden auto', display: 'flex', flexDirection: 'column',
                }}
              >
                {candidates.map(({ d, hardReason }) => (
                  <CandidateRow
                    key={d.id}
                    s={s}
                    d={d}
                    disabled={!!hardReason}
                    selected={f.da === d.id}
                    onPick={() => { s.setF('da', d.id); s.setF('daQ', ''); s.setF('daFocus', false) }}
                  />
                ))}
              </div>
            )}
          </div>
        </Field>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
          <Field label="Shifts">
            <div style={{ display: 'flex', gap: 'var(--size-40)', flexWrap: 'wrap' }}>
              {s.depts.filter((d) => d.active).map((d) => (
                <Seg key={d.id} on={f.dept === d.id} onClick={() => s.setF('dept', d.id)}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.c.dot }} />
                  {d.code} · {fmtT(d.start)} ({d.len}h)
                </Seg>
              ))}
            </div>
          </Field>
          <Field label="Day">
            <div style={{ display: 'flex', gap: 'var(--size-40)', flexWrap: 'wrap' }}>
              {[0, 1, 2, 3, 4, 5, 6].map((dd) => (
                <Seg key={dd} on={f.day === dd} onClick={() => s.setF('day', dd)}>{DAY_NAMES[dd]}</Seg>
              ))}
            </div>
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
          <Field label="Shift start"><Input value={f.pin ?? ''} onChange={(v) => s.setF('pin', v)} placeholder={fmtT(dp.start)} /></Field>
          <Field label="Lunch out"><Input value={f.plo ?? ''} onChange={(v) => s.setF('plo', v)} placeholder={fmtT(dp.start + 240)} /></Field>
          <Field label="Lunch in"><Input value={f.pli ?? ''} onChange={(v) => s.setF('pli', v)} placeholder={fmtT(dp.start + 270)} /></Field>
          <Field label="Shift end"><Input value={f.pout ?? ''} onChange={(v) => s.setF('pout', v)} placeholder={fmtT(dp.start + dp.len * 60 + 30)} /></Field>
        </div>

        {touched && (
          <span style={{ ...caption1, color: paidOk ? 'var(--text-secondary)' : 'var(--danger-fg)' }}>
            {paidOk
              ? `Paid ${paid} h · lunch ${(pv[2] as number) - (pv[1] as number)} min unpaid`
              : 'Punches must be HH:MM and in order - start, lunch out, lunch in, end'}
          </span>
        )}

        <Field label="Note"><Input value={f.note} onChange={(v) => s.setF('note', v)} placeholder="Optional" /></Field>

        {chk && chk.lines.some((l) => l.status !== 'ok') && (
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-80) var(--size-120)', display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
            {chk.lines.filter((l) => l.status !== 'ok').map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--size-80)', alignItems: 'center', ...caption1, color: l.status === 'hard' ? 'var(--danger-fg)' : 'var(--warning-fg)' }}>
                <RuleIcon status={l.status} />
                {l.label}
              </div>
            ))}
          </div>
        )}

        {needsReason && (
          <Field label="Reason">
            <Input value={f.reason} onChange={(v) => s.setF('reason', v)} placeholder="Required for a soft warning - logged with your name" />
          </Field>
        )}
      </div>
    </DialogShell>
  )
}

function CandidateRow({ s, d, disabled, selected, onPick }: { s: SchedState; d: Da; disabled: boolean; selected: boolean; onPick: () => void }) {
  const deptTags = [...new Set(s.shifts.filter((x) => x.da === d.id).map((x) => x.dept))].map((id) => s.deptOf(id))
  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      onClick={disabled ? undefined : onPick}
      style={{
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        minHeight: 30, padding: '2px var(--size-120)', borderBottom: '1px solid var(--border-subtle)',
        background: selected ? 'var(--blue-50)' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        ...caption1,
      }}
    >
      <span style={{ fontWeight: 'var(--weight-semibold)', color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>{d.name}</span>
      <TierChip tier={d.tier} palette={TIERS[d.tier]} />
      <span style={{ flex: 1 }} />
      {deptTags.map((dp) => (
        <span key={dp.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, ...caption2Strong, color: dp.c.fg, whiteSpace: 'nowrap' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dp.c.dot }} />
          {dp.code}
        </span>
      ))}
      <span style={{ color: 'var(--text-secondary)', ...caption2, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
        {s.weekHours(d.id)} h
      </span>
    </div>
  )
}

function ShiftDialog({ s }: { s: SchedState }) {
  const f = s.form as { shift: Shift; confirmRemove: boolean }
  const shift = f.shift
  const da = s.daOf(shift.da)
  const dp = s.deptOf(shift.dept)
  const hardViol = s.viol.hard.find((v) => v.shift === shift)
  const suggestion = s.das
    .filter((d) => d.id !== shift.da && !s.exclusionOf(d.id) && s.check(d.id, shift.day, shift.dept, null).ok)
    .sort((a, b) => s.ranks[a.id] - s.ranks[b.id])[0]

  const row = (k: string, v: string) => (
    <div key={k} style={{ display: 'flex', gap: 'var(--size-120)', ...caption1 }}>
      <span style={{ width: 90, color: 'var(--text-secondary)', flexShrink: 0 }}>{k}</span>
      <span style={{ fontWeight: 'var(--weight-semibold)' }}>{v}</span>
    </div>
  )

  return (
    <DialogShell s={s} title={`${da.name} · ${DAY_NAMES[shift.day]} ${s.dateOf(s.week, shift.day).d}`} width={440} cancelLabel="Close">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        {row('Department', `${dp.name} (${dp.code})`)}
        {row('Shift', `${fmtT(s.startOf(shift))} - ${fmtT(s.startOf(shift) + s.lenOf(shift) * 60)} · ${s.lenOf(shift)} h`)}
        {row('Source', shift.manual ? 'Manual - added by hand' : `Auto - W31 run · ranked #${s.ranks[shift.da]} at assignment`)}

        {hardViol && (
          <div
            style={{
              boxSizing: 'border-box', padding: 'var(--size-80) var(--size-100)',
              background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-small)', display: 'flex', flexDirection: 'column', gap: 'var(--size-60)',
              ...caption1, color: 'var(--danger-fg)',
            }}
          >
            <span style={{ fontWeight: 'var(--weight-semibold)' }}>{hardViol.rule} - {hardViol.detail}</span>
            {suggestion && <span>Suggested: {suggestion.name} (#{s.ranks[suggestion.id]})</span>}
          </div>
        )}

        {f.confirmRemove && (
          <Note tone="warn">
            Delete {da.name.split(',')[0]}’s {DAY_NAMES[shift.day]} {dp.code} shift? Hours and coverage recompute; the change is audited.
          </Note>
        )}

        <div style={{ display: 'flex', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
          <ChipButton
            tone="blue"
            onClick={() => s.openDlg('add', {
              da: shift.da, day: shift.day, dept: shift.dept, daQ: '', reason: '', editing: shift, note: shift.note ?? '',
              pin: fmtT(s.startOf(shift)),
              plo: fmtT(shift.lo ?? dp.lo ?? s.startOf(shift) + 240),
              pli: fmtT(shift.li ?? dp.li ?? (shift.lo ?? dp.lo ?? s.startOf(shift) + 240) + 30),
              pout: fmtT(s.startOf(shift) + s.lenOf(shift) * 60 + 30),
            })}
          >
            Edit…
          </ChipButton>
          <ChipButton tone="blue" onClick={() => s.openDlg('swap', { shift, pick: null, reason: '', showInel: false, recTO: false, toHours: '8', toReason: '' })}>
            Swap…
          </ChipButton>
          {f.confirmRemove ? (
            <ChipButton
              tone="danger"
              onClick={() => {
                s.snap()
                s.removeShift(shift)
                s.closeDlg()
                s.log('Remove shift', `${DAY_NAMES[shift.day]} ${shift.dept} · ${da.name}`)
                s.toastMsg('Deleted - coverage recomputed', true)
              }}
            >
              Confirm delete
            </ChipButton>
          ) : (
            <ChipButton tone="danger" onClick={() => s.setF('confirmRemove', true)}>Delete</ChipButton>
          )}
        </div>
      </div>
    </DialogShell>
  )
}

/**
 * Hand one shift to somebody else.
 *
 * The ineligible half of the roster is hidden behind a toggle rather than
 * dropped, so "why can't I pick them" has an answer on the same screen.
 */
function SwapDialog({ s }: { s: SchedState }) {
  const f = s.form as { shift: Shift; pick: string | null; reason: string; showInel: boolean; recTO: boolean; toHours: string; toReason: string }
  const shift = f.shift
  const dp = s.deptOf(shift.dept)

  const cands = s.das
    .filter((d) => d.id !== shift.da)
    .map((d) => {
      const c = s.check(d.id, shift.day, shift.dept, null)
      return { d, c, ex: s.exclusionOf(d.id), hardReason: c.hard[0] ?? null }
    })
    .sort((a, b) => (a.ex ? 1 : 0) - (b.ex ? 1 : 0) || s.ranks[a.d.id] - s.ranks[b.d.id])

  const eligible = cands.filter((x) => !x.hardReason)
  const ineligible = cands.filter((x) => x.hardReason)
  const picked = f.pick ? cands.find((x) => x.d.id === f.pick) : null
  const needsReason = !!picked && (!!picked.ex || picked.c.soft.length > 0)
  const ok = !!picked && (!needsReason || f.reason.trim().length >= 5) && (!f.recTO || f.toReason.trim().length >= 5)

  return (
    <DialogShell
      s={s}
      title={`Swap DA - ${DAY_NAMES[shift.day]} · ${dp.name} ${fmtT(s.startOf(shift))} (${s.lenOf(shift)}h)`}
      width={560}
      cta="Apply swap"
      ctaEnabled={ok}
      onCta={() => {
        s.snap()
        s.reassign(shift, picked!.d.id)
        s.closeDlg()
        s.log('Swap', `${DAY_NAMES[shift.day]} ${shift.dept} · ${s.daOf(shift.da).name} to ${picked!.d.name}${f.reason ? ` · ${f.reason.trim()}` : ''}`)
        s.toastMsg(`Swapped to ${picked!.d.name}`, true)
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>Currently {s.daOf(shift.da).name}</span>

        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-medium)', maxHeight: 200, overflow: 'hidden auto', display: 'flex', flexDirection: 'column' }}>
          {eligible.map((x) => (
            <SwapRow key={x.d.id} s={s} x={x} dp={dp} picked={f.pick === x.d.id} onPick={() => s.setF('pick', x.d.id)} />
          ))}
          {f.showInel && ineligible.map((x) => (
            <SwapRow key={x.d.id} s={s} x={x} dp={dp} disabled picked={false} onPick={() => {}} />
          ))}
        </div>

        <span onClick={() => s.setF('showInel', !f.showInel)} style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}>
          {f.showInel ? 'Hide ineligible' : `Show ineligible (${ineligible.length}) and why`}
        </span>

        {needsReason && (
          <Field label="Reason">
            <Input value={f.reason} onChange={(v) => s.setF('reason', v)} placeholder="Required - this pick carries a warning" />
          </Field>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <CheckRow
            label={`Record ${s.daOf(shift.da).name.split(',')[0]}’s absence as time off`}
            on={f.recTO}
            onClick={() => s.setF('recTO', !f.recTO)}
          />
          {f.recTO && (
            <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
              <Field label="Hours"><Input value={f.toHours} onChange={(v) => s.setF('toHours', v)} placeholder="8" /></Field>
              <Field label="Reason"><Input value={f.toReason} onChange={(v) => s.setF('toReason', v)} placeholder="5 to 140 characters" /></Field>
            </div>
          )}
        </div>
      </div>
    </DialogShell>
  )
}

function SwapRow({
  s, x, dp, disabled, picked, onPick,
}: {
  s: SchedState
  x: { d: Da; ex: { reason: string } | null; hardReason: string | null }
  dp: Dept
  disabled?: boolean
  picked: boolean
  onPick: () => void
}) {
  return (
    <div
      onClick={disabled ? undefined : onPick}
      style={{
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        minHeight: 30, padding: '2px var(--size-120)', borderBottom: '1px solid var(--border-subtle)',
        background: picked ? 'var(--blue-50)' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        ...caption1,
      }}
    >
      <span
        style={{
          width: 14, height: 14, borderRadius: '50%',
          border: `1px solid ${picked ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: picked ? 'var(--primary)' : 'var(--surface-card)', flexShrink: 0,
        }}
      />
      <span style={{ fontWeight: 'var(--weight-semibold)', color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>{x.d.name}</span>
      <span style={{ color: disabled ? 'var(--text-disabled)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        #{s.ranks[x.d.id]} · {x.d.score > 0 ? '+' : ''}{x.d.score}
      </span>
      {!disabled && <TierChip tier={x.d.tier} palette={TIERS[x.d.tier]} />}
      <span style={{ flex: 1 }} />
      {disabled ? (
        <span style={{ color: 'var(--danger-fg)', ...caption2, whiteSpace: 'nowrap' }}>{x.hardReason}</span>
      ) : (
        <span style={{ color: 'var(--text-helper)', ...caption2, whiteSpace: 'nowrap' }}>
          {s.weekHours(x.d.id)} h → {s.weekHours(x.d.id) + dp.len} h
        </span>
      )}
      {x.ex && !disabled && (
        <span
          style={{
            ...caption2, lineHeight: '1', height: 18, display: 'inline-flex', alignItems: 'center',
            padding: '0 var(--size-40)', borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-subtle)', border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)', whiteSpace: 'nowrap',
          }}
        >
          Excluded - {x.ex.reason}
        </span>
      )}
    </div>
  )
}

/** Dropping one shift onto another means trading them - both halves checked. */
function SwapConfirmDialog({ s }: { s: SchedState }) {
  const f = s.form as { a: Shift; b: Shift }
  const ca = s.check(f.b.da, f.b.day, f.a.dept, f.b)
  const cb = s.check(f.a.da, f.a.day, f.b.dept, f.a)
  const ok = ca.hard.length === 0 && cb.hard.length === 0

  const line = (shift: Shift, toDa: string, chk: { hard: string[]; soft: string[] }) => (
    <div key={`${shift.da}${shift.day}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', ...caption1 }}>
      <span style={{ fontWeight: 'var(--weight-semibold)' }}>{s.daOf(toDa).name}</span>
      <span style={{ color: 'var(--text-secondary)' }}>
        takes {DAY_NAMES[shift.day]} {s.deptOf(shift.dept).code} {fmtT(s.startOf(shift))}
      </span>
      <span
        style={{
          color: chk.hard.length ? 'var(--danger-fg)' : chk.soft.length ? 'var(--warning-fg)' : 'var(--success-fg)',
          fontWeight: 'var(--weight-semibold)',
        }}
      >
        {chk.hard.length ? `✕ ${chk.hard[0]}` : chk.soft.length ? `⚠ ${chk.soft[0]}` : '✓ clear'}
      </span>
    </div>
  )

  return (
    <DialogShell
      s={s}
      title="Swap these two shifts?"
      width={440}
      cta="Swap"
      ctaEnabled={ok}
      onCta={() => {
        s.snap()
        s.swapShifts(f.a, f.b)
        s.closeDlg()
        s.log('Swap', `${s.daOf(f.a.da).name} ⇄ ${s.daOf(f.b.da).name}`)
        s.toastMsg('Swapped', true)
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        {line(f.a, f.b.da, ca)}
        {line(f.b, f.a.da, cb)}
      </div>
    </DialogShell>
  )
}

function ViolationsDialog({ s }: { s: SchedState }) {
  const v = s.viol
  const head = (t: string) => <span style={LABEL}>{t}</span>

  const sev = (kind: 'hard' | 'soft') => (
    <span
      style={{
        boxSizing: 'border-box', height: 20, display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: kind === 'hard' ? 'var(--danger-bg)' : 'var(--warning-bg)',
        border: `1px solid ${kind === 'hard' ? 'var(--danger-border)' : 'var(--warning-border)'}`,
        ...caption1Strong,
        color: kind === 'hard' ? 'var(--danger-fg)' : 'var(--warning-fg)',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: kind === 'hard' ? 'var(--danger-accent)' : 'var(--warning-accent)' }} />
      {kind === 'hard' ? 'Hard' : 'Soft'}
    </span>
  )

  const row = (r: typeof v.hard[number], kind: 'hard' | 'soft', overridden: boolean) => (
    <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 32, padding: '2px 0', borderBottom: '1px solid var(--border-subtle)', ...caption1 }}>
      {sev(kind)}
      <span style={{ fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap' }}>{s.daOf(r.da).name}</span>
      {r.day != null && (
        <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{DAY_NAMES[r.day]}{r.dept ? ` · ${r.dept}` : ''}</span>
      )}
      <span style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {r.rule} - {r.detail}
      </span>
      {overridden && (
        <ChipButton onClick={() => { s.setSoftOverrides((o) => o.filter((x) => x.key !== r.key)); s.log('Revert override', `${r.rule} · ${s.daOf(r.da).name}`) }}>
          Revert
        </ChipButton>
      )}
      {!overridden && r.shift && (
        <ChipButton tone="blue" onClick={() => s.openDlg('swap', { shift: r.shift, pick: null, reason: '', showInel: false, recTO: false, toHours: '8', toReason: '' })}>
          Swap…
        </ChipButton>
      )}
      {!overridden && r.shift && (
        <ChipButton
          tone="danger"
          onClick={() => {
            s.snap()
            s.removeShift(r.shift as Shift)
            s.log('Remove shift', `${DAY_NAMES[r.day as number]} ${r.dept} · ${s.daOf(r.da).name}`)
            s.toastMsg('Removed', true)
          }}
        >
          Remove
        </ChipButton>
      )}
      {!overridden && kind === 'soft' && (
        <ChipButton
          tone="warn"
          onClick={() =>
            s.openReason('Override a soft warning', [`${r.rule} - ${r.detail}`], (reason) => {
              s.setSoftOverrides((o) => [...o, { key: r.key, reason }])
              s.log('Override', `${r.rule} · ${s.daOf(r.da).name} · ${reason}`)
              s.openDlg('viol')
            })
          }
        >
          Override…
        </ChipButton>
      )}
    </div>
  )

  return (
    <DialogShell s={s} title={`Violations - ${v.hard.length} hard · ${v.soft.length} soft`} width={720} cancelLabel="Close">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        {head('Hard - fix before you export')}
        {v.hard.length
          ? <div style={{ display: 'flex', flexDirection: 'column' }}>{v.hard.map((r) => row(r, 'hard', false))}</div>
          : <span style={{ ...caption1, color: 'var(--text-secondary)' }}>None</span>}
        {head('Soft - override with a reason or fix')}
        {v.soft.length
          ? <div style={{ display: 'flex', flexDirection: 'column' }}>{v.soft.map((r) => row(r, 'soft', false))}</div>
          : <span style={{ ...caption1, color: 'var(--text-secondary)' }}>None</span>}
        {v.overridden.length > 0 && head('Overridden')}
        {v.overridden.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>{v.overridden.map((r) => row(r, 'soft', true))}</div>
        )}
      </div>
    </DialogShell>
  )
}

/**
 * The shift templates.
 *
 * The order is the fill priority the auto-scheduler walks, so the rows drag to
 * reorder. Deleting one leaves the shifts already on the board alone - it only
 * takes the template out of the pickers.
 */
function DeptsDialog({ s }: { s: SchedState }) {
  const f = s.form as { adding: boolean; name: string; code: string; start: string; tlo?: string; tli?: string; tout?: string; tperday?: string; confirmDeact?: string | null }
  const okAdd = f.name.trim().length >= 2 && f.code.trim().length >= 2 &&
    !s.depts.some((d) => d.code.toLowerCase() === f.code.trim().toLowerCase())

  return (
    <DialogShell s={s} title="Manage departments" width={720} cancelLabel="Done">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-medium)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 'var(--size-120)', padding: 'var(--size-60) var(--size-120)', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-subtle)', ...LABEL }}>
            <span style={{ width: 20 }} />
            <span style={{ flex: 1.4 }}>Name</span>
            <span style={{ width: 44 }}>Code</span>
            <span style={{ width: 60 }}>Start</span>
            <span style={{ width: 52 }}>Length</span>
            <span style={{ width: 56 }}>Cap/wk</span>
            <span style={{ flex: 1 }}>Qualification</span>
            <span style={{ width: 80, textAlign: 'right' }}>Shifts this wk</span>
            <span style={{ width: 70 }} />
          </div>
          {s.depts.map((dp, i) => (
            <DeptRow key={dp.id} s={s} dp={dp} index={i} confirming={f.confirmDeact === dp.id} />
          ))}
        </div>

        {f.adding ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
            <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
              <Field label="Name"><Input value={f.name} onChange={(v) => s.setF('name', v)} placeholder="Deluxe" /></Field>
              <Field label="Code"><Input value={f.code} onChange={(v) => s.setF('code', v)} placeholder="DLX" /></Field>
              <Field label="Shifts per day"><Input value={f.tperday ?? ''} onChange={(v) => s.setF('tperday', v)} placeholder="3" /></Field>
            </div>
            <div style={{ display: 'flex', gap: 'var(--size-120)', alignItems: 'flex-end' }}>
              <Field label="Start"><Input value={f.start} onChange={(v) => s.setF('start', v)} placeholder="07:00" /></Field>
              <Field label="Lunch out"><Input value={f.tlo ?? ''} onChange={(v) => s.setF('tlo', v)} placeholder="11:00" /></Field>
              <Field label="Lunch in"><Input value={f.tli ?? ''} onChange={(v) => s.setF('tli', v)} placeholder="11:30" /></Field>
              <Field label="Day out"><Input value={f.tout ?? ''} onChange={(v) => s.setF('tout', v)} placeholder="17:30" /></Field>
              <ChipButton
                tone={okAdd ? 'blue' : 'plain'}
                onClick={() => {
                  if (!okAdd) return
                  const pm = (t: string | undefined, fallback: number): number => parseT(t ?? '') ?? fallback
                  const start = pm(f.start, 420)
                  const lo = pm(f.tlo, Math.min(start + 240, 1380))
                  const li = pm(f.tli, lo + 30)
                  const out = pm(f.tout, start + 630)
                  const len = Math.max(1, Math.round((out - start - (li - lo)) / 6) / 10)
                  // Two spare quads the templates cycle through as they are added.
                  const spare = [
                    { fg: 'var(--red-700)', bg: 'var(--red-50)', bd: 'var(--red-200)', dot: 'var(--red-500)' },
                    { fg: 'var(--green-700)', bg: 'var(--green-50)', bd: 'var(--green-200)', dot: 'var(--green-500)' },
                  ][s.depts.length % 2]
                  const id = f.code.trim().toUpperCase()
                  s.setDepts((ds) => [...ds, { id, name: f.name.trim(), code: id, start, len, lo, li, cap: null, qual: null, active: true, c: spare }])
                  s.setF('adding', false)
                  s.setF('name', '')
                  s.setF('code', '')
                  s.log('Add shift template', f.name.trim())
                }}
              >
                Add
              </ChipButton>
            </div>
          </div>
        ) : (
          <span onClick={() => s.setF('adding', true)} style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}>+ Add new</span>
        )}
      </div>
    </DialogShell>
  )
}

function DeptRow({ s, dp, index, confirming }: { s: SchedState; dp: Dept; index: number; confirming: boolean }) {
  const count = s.shifts.filter((x) => x.dept === dp.id).length
  return (
    <div
      draggable
      onDragStart={() => s.setF('dragDept', index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const from = (s.form as { dragDept?: number }).dragDept
        if (from == null || from === index) return
        s.setDepts((ds) => {
          const next = ds.slice()
          const [moved] = next.splice(from, 1)
          next.splice(index, 0, moved)
          return next
        })
        s.log('Fill priority', `${dp.name} reordered`)
      }}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', minHeight: 32, padding: '2px var(--size-120)', borderBottom: '1px solid var(--border-subtle)', ...caption1 }}
    >
      <span style={{ width: 20, color: 'var(--text-disabled)', cursor: 'grab', display: 'flex' }}>
        <Icon name="SvDrag" size={14} />
      </span>
      <span style={{ flex: 1.4, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', color: dp.active ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dp.c.dot, flexShrink: 0 }} />
        {dp.name}
      </span>
      <span style={{ width: 44 }}>{dp.code}</span>
      <span style={{ width: 60, fontVariantNumeric: 'tabular-nums' }}>{fmtT(dp.start)}</span>
      <span style={{ width: 52 }}>{dp.len} h</span>
      <span style={{ width: 56 }}>{dp.cap ?? '-'}</span>
      <span style={{ flex: 1, color: dp.qual ? 'var(--text-primary)' : 'var(--text-disabled)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dp.qual ?? '-'}</span>
      <span style={{ width: 80, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      {dp.active ? (
        <span
          onClick={() => {
            if (confirming) {
              s.setDepts((ds) => ds.map((d) => (d.id === dp.id ? { ...d, active: false } : d)))
              s.setF('confirmDeact', null)
              s.log('Shift template deleted', dp.name)
              s.toastMsg(`${dp.name} deleted - existing shifts keep running; it leaves the pickers`)
            } else s.setF('confirmDeact', dp.id)
          }}
          style={{ width: 70, textAlign: 'right', color: 'var(--danger-fg)', cursor: 'pointer', ...caption2, whiteSpace: 'nowrap' }}
        >
          {confirming ? `${dp.name} has ${count} shifts - confirm?` : 'Delete'}
        </span>
      ) : (
        <span style={{ width: 70, textAlign: 'right', color: 'var(--text-disabled)', ...caption2 }}>Inactive</span>
      )}
    </div>
  )
}

/**
 * Copy last week forward.
 *
 * Anyone blocked or excluded is dropped by default; an exclusion can be kept
 * anyway with one reason logged for the whole batch, but a block cannot.
 */
function CopyDialog({ s }: { s: SchedState }) {
  const f = s.form as { keep: Record<string, boolean>; reason: string }
  const src = 31
  const srcShifts = s.shiftsByWeek[src] ?? []

  const dropped: { da: string; cause: string; keepable: boolean; n: number }[] = []
  const seen: Record<string, boolean> = {}
  srcShifts.forEach((shift) => {
    const ex = s.exclusionOf(shift.da)
    const da = s.daOf(shift.da)
    const cause = da.blocked
      ? 'Blocked - overdue coaching'
      : ex ? `Excluded - ${ex.reason}${ex.until ? ` · until ${ex.until}` : ''}` : null
    if (cause && !seen[shift.da]) {
      seen[shift.da] = true
      dropped.push({ da: shift.da, cause, keepable: !!ex && !da.blocked, n: srcShifts.filter((v) => v.da === shift.da).length })
    }
  })

  const kept = dropped.filter((d) => f.keep[d.da])
  const copyCount = srcShifts.filter((shift) => !seen[shift.da] || f.keep[shift.da]).length
  const targetHas = s.shifts.length
  const ok = s.week !== src && (kept.length === 0 || f.reason.trim().length >= 5)

  return (
    <DialogShell
      s={s}
      title={`Copy last week into ${weekLabelShort(s.week)}`}
      width={560}
      cta="Copy into this week"
      ctaEnabled={ok}
      onCta={() => {
        s.snap()
        srcShifts.forEach((shift) => {
          if (seen[shift.da] && !f.keep[shift.da]) return
          if (s.shiftAt(shift.da, shift.day)) return
          if (s.availOf(shift.da, shift.day).t !== 'A') return
          s.assign(shift.da, shift.day, shift.dept)
        })
        s.closeDlg()
        s.log('Copy last week', `${copyCount} shifts into ${weekLabelShort(s.week)}${kept.length ? ` · kept excluded: ${kept.map((k) => s.daOf(k.da).name).join(', ')}` : ''}`)
        s.toastMsg('Copied - every shift re-ran its rule check', true)
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
          Source: {weekLabelShort(src)} · {srcShifts.length} shifts
        </span>
        {s.week === src && (
          <span style={{ ...caption1, color: 'var(--danger-fg)' }}>The open week is the source week - step to another week first</span>
        )}
        {targetHas > 0 && (
          <span style={{ ...caption1, color: 'var(--warning-fg)' }}>
            This week already holds {targetHas} shifts - days already scheduled are skipped
          </span>
        )}
        {dropped.length > 0 && (
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-80) var(--size-120)', display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
            <span style={LABEL}>Dropped by default</span>
            {dropped.map((dr) => (
              <div key={dr.da} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', ...caption1 }}>
                {dr.keepable ? (
                  <span onClick={() => s.setF('keep', { ...f.keep, [dr.da]: !f.keep[dr.da] })} style={{ cursor: 'pointer', display: 'flex' }}>
                    <Tick on={!!f.keep[dr.da]} />
                  </span>
                ) : (
                  <span style={{ width: 14, flexShrink: 0 }} />
                )}
                <span style={{ fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap' }}>{s.daOf(dr.da).name}</span>
                <span style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dr.cause} · {dr.n} shifts
                </span>
                {dr.keepable && <span style={{ color: 'var(--text-helper)', ...caption2, whiteSpace: 'nowrap' }}>Keep anyway</span>}
              </div>
            ))}
          </div>
        )}
        {kept.length > 0 && (
          <Field label="Reason for keeping excluded DAs">
            <Input value={f.reason} onChange={(v) => s.setF('reason', v)} placeholder="Logged once for the batch - an override per shift" />
          </Field>
        )}
        <span style={{ ...caption1Strong }}>Copies {copyCount} shifts</span>
      </div>
    </DialogShell>
  )
}

function ClearDialog({ s }: { s: SchedState }) {
  const n = s.shifts.length
  const manual = s.shifts.filter((x) => x.manual).length
  return (
    <DialogShell
      s={s}
      title={`Clear the ${weekLabelShort(s.week)} schedule?`}
      width={440}
      cta="Clear draft"
      ctaTone="danger"
      onCta={() => {
        s.snap()
        s.clearWeek()
        s.closeDlg()
        s.log('Clear draft', `${n} shifts removed from ${weekLabelShort(s.week)}`)
        s.toastMsg(`Cleared - ${n} shifts removed`, true)
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        <span style={caption1}>
          Removes {n} shifts, including {manual} added or changed by hand since the Jul 24 run. Other weeks are untouched.
        </span>
        {s.week === 31 && (
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
            This week was exported Jul 25 - clearing it here does not withdraw that file from Paycom
          </span>
        )}
      </div>
    </DialogShell>
  )
}

function StatsDialog({ s }: { s: SchedState }) {
  const hours = s.das.map((d) => s.weekHours(d.id)).filter((h) => h > 0)
  return (
    <DialogShell s={s} title={`Week stats - ${weekLabelShort(s.week)}`} width={440} cancelLabel="Close">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        {s.depts.map((dp) => {
          const f = s.shifts.filter((x) => x.dept === dp.id).length
          const need = (s.needs?.[dp.id] ?? []).reduce((a, b) => a + b, 0)
          return (
            <div key={dp.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', ...caption1 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: dp.c.dot, flexShrink: 0 }} />
              <span style={{ width: 100, fontWeight: 'var(--weight-semibold)' }}>{dp.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {f} of {need} filled · {need ? Math.round((f / need) * 100) : 0}%
              </span>
              <span style={{ flex: 1 }} />
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.shifts.filter((x) => x.dept === dp.id).reduce((a, x) => a + s.lenOf(x), 0)} h
              </span>
            </div>
          )
        })}
        <div style={{ paddingTop: 'var(--size-80)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 'var(--size-160)', ...caption1, color: 'var(--text-secondary)' }}>
          <span>
            Per-DA hours: min {hours.length ? Math.min(...hours) : 0} · avg{' '}
            {hours.length ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length) : 0} · max{' '}
            {hours.length ? Math.max(...hours) : 0}
          </span>
          <span>Soft overrides: {s.softOverrides.length}</span>
        </div>
      </div>
    </DialogShell>
  )
}

export { HOURS_CAP }
