'use client'

import { body1, body1Strong, caption1Strong, subtitle1 } from '../../ds/type'
import { Button, Field, IconButton } from './parts'
import { CTA_TONES, NOTE_TONES } from './style'
import type { CtaTone, NoteTone } from './style'
import { billedTotal, hasInvoice } from './calc'
import { TODAY, WHO } from './data'
import { weekName, weekRange } from './date'
import { money } from './fmt'
import type { IvState } from './useInvoiceValidation'

interface FieldDef {
  key: string
  label: string
  prefix?: string
  placeholder?: string
}

interface DialogSpec {
  title: string
  width?: number
  /** Label / value pairs; a line with no key runs full width as prose. */
  lines?: { k?: string; v: string }[]
  fields?: FieldDef[]
  note?: string
  noteTone?: NoteTone
  cta?: string
  tone?: CtaTone
  enabled?: boolean
  act?: () => void
  cancel?: string
  history?: boolean
}

/**
 * Every confirm, edit and record-the-outcome step on the page.
 *
 * They share one shell because they share one shape: say what will happen, take
 * whatever the outcome needs, and name the button after the act rather than
 * "OK". Destructive ones refuse to close on a backdrop click.
 */
export function Dialogs({ s }: { s: IvState }) {
  const kind = s.dialog
  const x = s.dlgRow
  if (!kind || x == null) return null

  const spec = specFor(s, kind, x)
  const enabled = spec.cta ? spec.enabled !== false : false
  const cta = spec.tone ? CTA_TONES[spec.tone] : null
  const note = spec.noteTone ? NOTE_TONES[spec.noteTone] : null
  const width = spec.width ?? (spec.fields?.length ? 672 : 440)
  const destructive = spec.tone === 'danger'

  return (
    <div
      onClick={destructive ? undefined : s.closeDialog}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--size-320) var(--size-200)',
      }}
    >
      <div
        data-dialog-card=""
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width,
          maxHeight: '100%',
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-xlarge)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ boxSizing: 'border-box', height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-default)' }}>
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...subtitle1 }}>{spec.title}</span>
          <IconButton name="FnDismiss" title="Close" size={32} onClick={s.closeDialog} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', boxSizing: 'border-box', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
          {!!spec.lines?.length && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
              {spec.lines.map((l, i) =>
                l.k ? (
                  <div key={i} style={{ display: 'flex', gap: 'var(--size-160)', ...body1 }}>
                    <span style={{ width: 140, flexShrink: 0, color: 'var(--text-secondary)' }}>{l.k}</span>
                    <span style={{ flex: 1, minWidth: 0, fontVariantNumeric: 'tabular-nums' }}>{l.v}</span>
                  </div>
                ) : (
                  <div key={i} style={{ ...body1, color: 'var(--text-secondary)' }}>{l.v}</div>
                ),
              )}
            </div>
          )}

          {spec.history && <History s={s} x={x} />}

          {!!spec.fields?.length && (
            <div style={{ display: 'grid', gridTemplateColumns: spec.fields.length > 2 ? 'repeat(2,1fr)' : '1fr', gap: 'var(--size-160)' }}>
              {spec.fields.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  prefix={f.prefix}
                  placeholder={f.placeholder}
                  value={s.fields[f.key] ?? ''}
                  onChange={(v) => s.setField(f.key, v)}
                />
              ))}
            </div>
          )}

          {spec.note && note && (
            <div
              role="status"
              style={{
                boxSizing: 'border-box',
                padding: 'var(--size-120) var(--size-160)',
                background: note.bg,
                border: `1px solid ${note.border}`,
                borderRadius: 'var(--radius-medium)',
                ...body1,
                color: note.fg,
              }}
            >
              {spec.note}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, boxSizing: 'border-box', display: 'flex', justifyContent: 'flex-end', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
          <Button onClick={s.closeDialog}>{spec.cancel ?? 'Cancel'}</Button>
          {spec.cta && cta && (
            <CtaButton label={spec.cta} tone={cta} enabled={enabled} onClick={() => { if (enabled) spec.act?.() }} />
          )}
        </div>
      </div>
    </div>
  )
}

function CtaButton({
  label,
  tone,
  enabled,
  onClick,
}: {
  label: string
  tone: { bg: string; border: string; fg: string; hover: string }
  enabled: boolean
  onClick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-160)',
        borderRadius: 'var(--radius-medium)',
        background: enabled ? tone.bg : 'var(--surface-subtle)',
        border: `1px solid ${enabled ? tone.border : 'var(--border-default)'}`,
        color: enabled ? tone.fg : 'var(--text-disabled)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: enabled ? 'pointer' : 'default',
        transition: 'background var(--motion-hover)',
      }}
    >
      {label}
    </div>
  )
}

function History({ s, x }: { s: IvState; x: number }) {
  const rows = s.inv[x].history
  return (
    <div style={{ boxSizing: 'border-box', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          padding: 'var(--size-100) var(--size-120)',
          background: 'var(--surface-subtle)',
          borderBottom: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-medium) var(--radius-medium) 0 0',
          ...caption1Strong,
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ width: 120, flexShrink: 0 }}>When</span>
        <span style={{ width: 90, flexShrink: 0 }}>Who</span>
        <span style={{ width: 150, flexShrink: 0 }}>Action</span>
        <span style={{ flex: 1, minWidth: 0 }}>Detail</span>
      </div>
      {rows.map((h, i) => (
        <div
          key={i}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-160)',
            minHeight: 48,
            padding: 'var(--size-100) var(--size-120)',
            borderBottom: '1px solid var(--border-subtle)',
            ...body1,
          }}
        >
          <span style={{ width: 120, flexShrink: 0, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{h.when}</span>
          <span style={{ width: 90, flexShrink: 0, color: 'var(--text-secondary)' }}>{h.who}</span>
          <span style={{ width: 150, flexShrink: 0, fontWeight: 'var(--weight-semibold)' }}>{h.action}</span>
          <span style={{ flex: 1, minWidth: 0, color: 'var(--text-secondary)' }}>{h.detail}</span>
        </div>
      ))}
    </div>
  )
}

function specFor(s: IvState, kind: NonNullable<IvState['dialog']>, x: number): DialogSpec {
  const i = s.inv[x]
  const c = hasInvoice(i) ? s.comparisonOf(x) : null
  const done = (msg: string) => { s.closeDialog(); s.toastMsg(msg) }

  switch (kind) {
    case 'na':
      return {
        title: `Mark ${weekName(x)} as no invoice expected`,
        lines: [{ v: 'This week drops out of the pending count and no invoice is chased for it. You can undo this from the row menu.' }],
        cta: 'Mark as N/A', tone: 'primary',
        act: () => {
          s.patchInvoice(x, { na: true }, 'Marked N/A', 'No invoice expected for this week')
          done(`${weekName(x)} is marked as no invoice expected.`)
        },
      }
    case 'expect':
      return {
        title: `Expect an invoice for ${weekName(x)}`,
        lines: [{ v: 'The week goes back to pending and counts again in the pending total.' }],
        cta: 'Expect invoice', tone: 'primary',
        act: () => {
          s.patchInvoice(x, { na: false }, 'Expect invoice', 'Back to pending')
          done(`${weekName(x)} is pending again.`)
        },
      }
    case 'delete':
      return {
        title: `Delete the invoice for ${weekName(x)}`,
        lines: [{ v: 'The uploaded figures are removed and the week goes back to pending. You can upload again at any time.' }],
        note: 'Every deletion is recorded.', noteTone: 'warning',
        cta: 'Delete invoice', tone: 'danger',
        act: () => {
          s.patchInvoice(x, { uploaded: false }, 'Deleted invoice', 'Week reset to pending')
          s.setDrafts({})
          done(`Invoice deleted. ${weekName(x)} is pending.`)
        },
      }
    case 'disputeIt':
      return {
        title: `Dispute ${weekName(x)}`,
        lines: [
          { k: 'Invoice total', v: money(billedTotal(s.weekFigures(x))) },
          { k: 'Discrepancies', v: c ? String(c.count) : '-' },
          { v: 'The week moves to under dispute and the draft opens so you can review it before submitting.' },
        ],
        cta: 'Open the dispute draft', tone: 'primary',
        act: () => {
          s.patchInvoice(x, { status: 'dispute', disputedOn: TODAY }, 'Disputed', 'Re-opened from validated')
          s.closeDialog()
          s.openWeek(x)
          s.toastMsg(`${weekName(x)} is under dispute.`)
        },
      }
    case 'revert':
      return {
        title: `Revert ${weekName(x)} to pending`,
        lines: [{ v: 'The frozen comparison is dropped and the week is compared again against the current work summary.' }],
        note: i.recovered != null ? `The ${money(i.recovered)} recovered on this week is reversed too.` : 'Every revert is recorded.',
        noteTone: 'warning',
        cta: 'Revert to pending', tone: 'danger',
        act: () => {
          s.patchInvoice(x, { status: 'pending', flagged: false, recovered: null, disputedOn: null }, 'Reverted', 'Back to pending')
          done(`${weekName(x)} is pending again.`)
        },
      }
    case 'accept':
      return {
        title: `Accept ${weekName(x)} as billed`,
        lines: [{ k: 'At stake', v: c ? money(c.atStake) : '-' }, { v: 'The week becomes validated and nothing is recovered.' }],
        note: c ? `${money(c.atStake)} will not be recovered.` : undefined,
        noteTone: 'warning',
        cta: 'Accept as billed', tone: 'danger',
        act: () => {
          s.patchInvoice(x, { status: 'validated', recovered: 0, decidedBy: WHO, decidedOn: TODAY }, 'Accepted', 'Dispute conceded, $0.00 recovered')
          done(`${weekName(x)} is validated.`)
        },
      }
    case 'resolve': {
      const editing = i.recovered != null && i.status === 'validated'
      const rec = parseFloat(s.fields.rec ?? '0') || 0
      return {
        title: editing ? `Edit money recovered on ${weekName(x)}` : `Mark ${weekName(x)} resolved`,
        lines: [{ k: 'At stake', v: c ? money(c.atStake) : '-' }],
        fields: [
          { key: 'rec', label: 'Money recovered', prefix: '$', placeholder: '0.00' },
          { key: 'ref', label: 'Case reference', placeholder: 'AMZ-DSP-0000' },
          { key: 'note', label: 'Note', placeholder: 'Optional' },
        ],
        note: c && rec > c.atStake ? 'That is more than the disputed amount.' : undefined,
        noteTone: 'warning',
        cta: 'Save', tone: 'primary',
        enabled: (s.fields.rec ?? '').trim() !== '',
        act: () => {
          s.patchInvoice(
            x,
            { status: 'validated', recovered: rec, caseRef: s.fields.ref, decidedBy: WHO, decidedOn: TODAY },
            'Marked resolved',
            `${money(rec)} recovered`,
          )
          done(`${money(rec)} recovered on ${weekName(x)}.`)
        },
      }
    }
    case 'ref':
      return {
        title: 'Save the case reference',
        lines: [{ k: 'Week', v: weekName(x) }],
        fields: [
          { key: 'ref', label: 'Case reference', placeholder: 'AMZ-DSP-0000' },
          { key: 'note', label: 'Note', placeholder: 'Optional' },
        ],
        cta: 'Save', tone: 'primary',
        act: () => {
          s.patchInvoice(x, { caseRef: s.fields.ref, notes: s.fields.note }, 'Edited case reference', s.fields.ref ?? '')
          done('Case reference saved.')
        },
      }
    case 'reviewed':
      return {
        title: 'Clear the re-check flag',
        lines: [
          { k: 'Changed days', v: i.flagDays ?? '-' },
          { v: 'The flag clears and the decision stands. It comes back if the work summary changes again.' },
        ],
        cta: 'Clear the flag', tone: 'primary',
        act: () => {
          s.patchInvoice(x, { flagged: false }, 'Reviewed, no change', `${i.flagDays ?? ''} · figures unaffected`)
          done(`Flag cleared on ${weekName(x)}.`)
        },
      }
    case 'adjusted':
      return {
        title: 'Upload the adjusted invoice',
        lines: [
          { k: 'Week', v: `${weekName(x)} · ${weekRange(x)}` },
          { k: 'Claimed', v: c ? money(c.atStake) : '-' },
          { k: 'Case reference', v: i.caseRef ?? '-' },
          { v: 'Amazon reissues an invoice when it settles a dispute. The adjusted figures replace the billed side, the comparison runs again, and the week goes back to pending so you can validate it or dispute it once more.' },
        ],
        note: 'The dispute stays in the history with its case reference.', noteTone: 'info',
        cta: 'Upload and compare', tone: 'primary',
        act: () => {
          s.patchInvoice(
            x,
            { status: 'pending', adjusted: true, uploaded: true, disputedOn: null },
            'Uploaded adjusted invoice',
            `Invoice_W${x}_2026_adjusted.pdf${i.caseRef ? ` · ${i.caseRef}` : ''}`,
          )
          s.setDrafts({})
          s.closeDialog()
          s.openWeek(x)
          s.toastMsg(`Adjusted invoice compared. ${weekName(x)} is pending a decision.`)
        },
      }
    case 'history':
      return { title: `History · ${weekName(x)}`, width: 880, history: true, cancel: 'Close' }
    case 'approve':
      return {
        title: 'Approve this invoice as billed',
        lines: [
          { k: 'Week', v: `${weekName(x)} · ${weekRange(x)}` },
          { k: 'Invoice total', v: money(billedTotal(s.weekFigures(x))) },
          { k: 'Discrepancies', v: c ? String(c.count) : '0' },
        ],
        note: c && c.count ? `You are approving ${money(c.atStake)} of differences as billed.` : undefined,
        noteTone: 'warning',
        cta: 'Approve invoice', tone: 'success',
        act: () => {
          s.patchInvoice(
            x,
            { status: 'validated', decidedBy: WHO, decidedOn: TODAY },
            'Validated',
            c && c.count ? `${c.count} differences approved as billed` : 'All lines matched',
          )
          s.closeDialog()
          s.setTab('dash')
          s.toastMsg(`${weekName(x)} is validated.`)
        },
      }
    case 'dispute':
      return {
        title: 'Dispute this invoice',
        lines: [
          { k: 'Week', v: `${weekName(x)} · ${weekRange(x)}` },
          { k: 'Discrepancies', v: c ? String(c.count) : '0' },
          { k: 'Claimed', v: c ? money(c.atStake) : '-' },
        ],
        note: 'File the document in the Amazon portal yourself, then record the outcome from the dashboard row menu.',
        noteTone: 'info',
        cta: 'Dispute invoice', tone: 'danger',
        act: () => {
          s.patchInvoice(
            x,
            { status: 'dispute', disputedOn: TODAY },
            'Disputed',
            `${c ? c.count : 0} discrepancies · ${c ? money(c.atStake) : ''} at stake`,
          )
          s.closeDialog()
          s.setTab('dash')
          s.toastMsg('Dispute document generated.')
        },
      }
    case 'manual':
      return {
        title: 'Enter the invoice figures by hand',
        width: 672,
        lines: [{ v: 'Typed figures carry no per-line breakdown, so this week runs no per-type or rate check.' }],
        fields: [
          { key: 'routes', label: 'Routes', placeholder: '0' },
          { key: 'rescues', label: 'Rescues', placeholder: '0' },
          { key: 'sessions', label: 'Training sessions', placeholder: '0' },
          { key: 'income', label: 'Training income', prefix: '$', placeholder: '0.00' },
          { key: 'packages', label: 'Packages', placeholder: 'Optional' },
          { key: 'total', label: 'Total due', prefix: '$', placeholder: '0.00' },
        ],
        cta: 'Save figures', tone: 'primary',
        enabled: ['routes', 'rescues', 'sessions', 'total'].every((k) => (s.fields[k] ?? '').trim() !== ''),
        act: () => {
          s.patchInvoice(x, { uploaded: true, source: 'manual' }, 'Entered by hand', `Figures typed for ${weekName(x)}`)
          done('Figures saved. Review the comparison, then decide.')
        },
      }
  }
}
