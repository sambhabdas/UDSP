import type { CSSProperties } from 'react'
import { Button } from '../../ds/components/Button'
import { Dialog, DialogRow, Field, Note } from '../../ds/components/Overlay'
import { body1, caption1Strong } from '../../ds/type'
import { fmtD, fmtRange, money, periodWeeks } from './calendar'
import { CURRENT_USER, TODAY_LABEL, TODAY_LABEL_LONG, UNMAPPED_TOTAL } from './data'
import type { ButtonTone } from '../../ds/components/Button'
import type { NoteTone } from '../../ds/components/Overlay'
import type { Draft } from './data'
import type { PayrollState } from './usePayrollSetup'

const num = (v: number | null | undefined) => v ?? 0

// Discarding a draft removes it from the map — a year with no draft has no key,
// rather than a key holding nothing.
const dropYear = (drafts: Record<number, Draft>, year: number): Record<number, Draft> => {
  const next = { ...drafts }
  delete next[year]
  return next
}

const dialogInput: CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-family)',
  ...body1,
  color: 'var(--text-primary)',
  padding: 0,
}

// One shape for all five confirmations, so the renderer below reads it without
// knowing which one it got.
interface DialogSpec {
  title: string
  /** Key/value rows. */
  lines?: [string, string][] | null
  /** Prose paragraphs, where a key/value pair would be the wrong shape. */
  plain?: string[] | null
  note?: string
  noteTitle?: string
  noteTone?: NoteTone
  /** Requires the year typed out before the action arms. */
  typed?: boolean
  reason?: boolean
  reasonLabel?: string
  cta: string
  tone: ButtonTone
  enabled: boolean
  act: () => void
}

// Every dialog here is a confirmation for something irreversible or audited, so
// each one names what changes, what it costs, and who is allowed to do it.
function buildDialog(s: PayrollState): DialogSpec | null {
  const { dialog, year, draft, activePeriod, periodRow, periodState, figures, dataYear } = s

  if (dialog === 'lock') {
    if (!draft) return null
    const rows = draft.rows
    return {
      title: `Confirm & lock ${year}`,
      lines: [
        ['Year', String(year)],
        ['Seed week', `${periodWeeks(rows[0].start).split(' + ')[0]}, starting ${fmtD(rows[0].start, true)}`],
        ['First pay date', fmtD(rows[0].pay, true)],
        ['Periods', `26 biweekly payrolls · ${fmtD(rows[0].start)} – ${fmtD(rows[25].end, true)}`],
      ],
      note:
        draft.fromUnlock && !draft.dirty
          ? 'Nothing has changed since you unlocked the calendar. Locking it again has no effect.'
          : 'Once locked, the calendar cannot be edited. Invoice Validation, Profitability and Timecards start using it right away.',
      noteTone: 'warning',
      cta: 'Confirm & lock',
      tone: 'danger',
      enabled: true,
      act: () => {
        s.setYears((ys) => ({
          ...ys,
          [year]: {
            status: 'locked',
            seed: rows[0].start,
            pay: rows[0].pay,
            rows,
            lockedBy: CURRENT_USER,
            lockedOn: TODAY_LABEL_LONG,
          },
        }))
        s.setDrafts((d) => dropYear(d, year))
        s.setDialog(null)
        s.toast(
          `${year} is locked. Invoice Validation, Profitability and Timecards now use this calendar.`,
        )
      },
    }
  }

  if (dialog === 'unlock') {
    const posted = (s.years[year].rows ?? []).filter(
      (r) => s.periodStates[r.n]?.status === 'posted',
    ).length
    return {
      title: `Unlock ${year}`,
      plain: [
        'Unlocking recalculates nothing. Invoice Validation, Profitability and Timecards keep using this calendar until you edit it and lock it again.',
      ],
      note: `Every unlock is recorded.${posted ? ` The ${posted} posted payrolls keep their figures.` : ''}`,
      noteTitle: 'Owner and Sub Admin only',
      noteTone: 'warning',
      typed: true,
      reason: true,
      reasonLabel: 'Reason for unlocking',
      cta: 'Unlock year',
      tone: 'danger',
      enabled: s.typedVal === String(year) && s.reasonVal.trim() !== '',
      act: () => {
        const cur = s.years[year]
        s.setYears((ys) => ({ ...ys, [year]: { status: 'empty' } }))
        s.setDrafts((d) => ({
          ...d,
          [year]: {
            rows: cur.rows ?? [],
            by: cur.lockedBy ?? CURRENT_USER,
            on: cur.lockedOn ?? TODAY_LABEL_LONG,
            fromUnlock: true,
            dirty: false,
          },
        }))
        s.setDialog(null)
        s.setTypedVal('')
        s.setReasonVal('')
        s.toast(`${year} is unlocked. Nothing changes until you edit the calendar and lock it again.`)
      },
    }
  }

  if (dialog === 'post') {
    if (!figures || !periodRow || !periodState || activePeriod == null) return null
    const grand =
      num(figures.dg) + num(figures.pg) + num(figures.tg) + num(figures.dt) + num(figures.pt) + num(figures.tt)
    return {
      title: `Post payroll · P${activePeriod}`,
      lines: ([
        ['Period', `P${activePeriod} · ${periodWeeks(periodRow.start)} · ${fmtRange(periodRow.start, periodRow.end, dataYear)}`],
        ['Driver', `${money(num(figures.dg))} gross · ${money(num(figures.dt))} taxes`],
        ['Dispatch', `${money(num(figures.pg))} gross · ${money(num(figures.pt))} taxes`],
        [
          'Training',
          figures.tg == null
            ? 'No rows in this file'
            : `${money(figures.tg)} gross · ${money(num(figures.tt))} taxes`,
        ],
        ['Grand total', money(grand)],
      ] as [string, string][]).concat(
        periodState.source?.note ? [['Note', periodState.source.note]] : [],
      ),
      note:
        (periodState.unmapped ? `${UNMAPPED_TOTAL} from 3 unmapped groups is not included. ` : '') +
        'These figures become this period’s payroll cost in Profitability.',
      noteTone: periodState.unmapped ? 'warning' : 'info',
      cta: 'Post payroll',
      tone: 'primary',
      enabled: true,
      act: () => {
        s.setPeriodStates((ps) => ({
          ...ps,
          [activePeriod]: { ...ps[activePeriod], status: 'posted', by: CURRENT_USER, on: TODAY_LABEL },
        }))
        s.setDialog(null)
        s.toast(`P${activePeriod} is posted. Its figures are now in Profitability.`)
      },
    }
  }

  if (dialog === 'revert') {
    if (activePeriod == null) return null
    return {
      title: `Revert P${activePeriod} to uploaded`,
      plain: [
        'This period’s figures are removed from Profitability. You can upload the file again or enter the figures manually.',
      ],
      note: 'Every revert is recorded.',
      noteTone: 'warning',
      reason: true,
      reasonLabel: 'Reason for reverting',
      cta: 'Revert',
      tone: 'danger',
      enabled: s.reasonVal.trim() !== '',
      act: () => {
        s.setPeriodStates((ps) => ({
          ...ps,
          [activePeriod]: { ...ps[activePeriod], status: 'uploaded', by: undefined, on: undefined },
        }))
        s.setDialog(null)
        s.setReasonVal('')
        s.toast(`P${activePeriod} is reverted. Its figures are no longer in Profitability.`)
      },
    }
  }

  if (dialog === 'discard') {
    if (!draft) return null
    const fromUnlock = !!draft.fromUnlock
    return {
      title: fromUnlock ? 'Cancel the unlock?' : 'Discard this draft?',
      plain: fromUnlock
        ? ['Your edits are discarded and the calendar goes back to locked, exactly as it was. Nothing else changes.']
        : null,
      lines: fromUnlock ? null : [['Draft', `Generated by ${draft.by} on ${draft.on} · 26 periods`]],
      note: fromUnlock ? '' : 'The year goes back to empty and any edited pay dates are lost.',
      noteTone: 'warning',
      cta: fromUnlock ? 'Cancel unlock' : 'Discard draft',
      tone: 'danger',
      enabled: true,
      act: () => {
        if (fromUnlock) {
          s.setYears((ys) => ({
            ...ys,
            [year]: {
              status: 'locked',
              rows: draft.rows.map((r) => ({ ...r })),
              seed: draft.rows[0].start,
              pay: draft.rows[0].pay,
              lockedBy: draft.by,
              lockedOn: draft.on,
            },
          }))
          s.setDrafts((d) => dropYear(d, year))
          s.setDialog(null)
          s.toast('Unlock cancelled. The calendar is locked again.')
        } else {
          s.setDrafts((d) => dropYear(d, year))
          s.setDialog(null)
          s.toast('Draft discarded.')
        }
      },
    }
  }
  return null
}

export function PayrollDialogs({ s }: { s: PayrollState }) {
  if (!s.dialog) return null
  const d = buildDialog(s)
  if (!d) return null

  return (
    <Dialog title={d.title} onClose={s.closeDialog}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        {(d.lines || []).map(([k, v]) => (
          <DialogRow key={k} label={k} value={v} />
        ))}
        {(d.plain || []).map((line) => (
          <div key={line} style={{ ...body1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>
            {line}
          </div>
        ))}
      </div>

      {d.note && (
        <Note tone={d.noteTone} title={d.noteTitle}>
          {d.note}
        </Note>
      )}

      {d.typed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
          <span style={{ ...caption1Strong, color: 'var(--text-primary)' }}>
            Type {s.year} to proceed
          </span>
          <Field>
            <input
              value={s.typedVal}
              onChange={(e) => s.setTypedVal(e.target.value)}
              style={dialogInput}
            />
          </Field>
        </div>
      )}

      {d.reason && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
          <span style={{ ...caption1Strong, color: 'var(--text-primary)' }}>{d.reasonLabel}</span>
          <Field>
            <input
              value={s.reasonVal}
              onChange={(e) => s.setReasonVal(e.target.value)}
              style={dialogInput}
            />
          </Field>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--size-80)',
          marginTop: 'var(--size-80)',
        }}
      >
        <Button onClick={s.closeDialog}>Cancel</Button>
        <Button tone={d.tone} disabled={!d.enabled} onClick={d.act}>
          {d.cta}
        </Button>
      </div>
    </Dialog>
  )
}
