'use client'

import { caption1, caption1Strong, caption2, caption2Strong } from '../../ds/type'
import { CheckRow, Field, Input, Seg } from './parts'
import { LABEL } from './style'
import { DialogShell } from './dialogs'
import type { Da } from './data'
import { fmtIso, fmtMdY, fmtT, fmtT12, weekLabelShort } from './date'
import type { SchedState } from './useSchedule'

/** How each payroll system wants the same week written down. */
interface Preset {
  id: (d: Da) => string
  heads: string[]
  date: (week: number, day: number) => string
  time: (min: number) => string
  pto: string
  reg: string
}

const PRESETS: Record<string, Preset> = {
  Paycom: {
    id: (d) => d.ee,
    heads: ['ee_code', 'Employee Name', 'Date', 'Time In', 'Time Out', 'Hours', 'Labor Allocation', 'Pay Code'],
    date: fmtMdY, time: fmtT12, pto: 'PTO', reg: 'REG',
  },
  ADP: {
    id: (d) => (d.ee ? `F${d.ee}` : ''),
    heads: ['File #', 'Employee Name', 'Work Date', 'Time In', 'Time Out', 'Hours', 'Dept Code', 'Earnings Code'],
    date: fmtMdY, time: fmtT, pto: 'PTO', reg: 'REG',
  },
  Generic: {
    id: (d) => d.tid,
    heads: ['transporter_id', 'name', 'date', 'start', 'end', 'hours', 'department_code', 'pay_code'],
    date: fmtIso, time: fmtT, pto: 'PTO', reg: 'REG',
  },
}

/**
 * Export — the payroll dump.
 *
 * It refuses to be a quiet button: the preview shows the actual bytes, the
 * warnings name every reason the file might be wrong, and a hard violation
 * needs a deliberate tick before Download will fire.
 */
export function ExportDialog({ s }: { s: SchedState }) {
  const f = s.form as {
    preset: string; format: string; range: string
    pto: boolean; scores: boolean; unfilled: boolean; confirmHard: boolean
    logFirst: boolean; fname: string | null; from?: string; to?: string
  }
  const M = PRESETS[f.preset]
  const week = s.week
  const shifts = s.shifts.slice().sort((a, b) => a.day - b.day || a.da.localeCompare(b.da))

  const rows = shifts.map((shift) => {
    const d = s.daOf(shift.da)
    return {
      pto: false,
      cells: [
        M.id(d), d.name, M.date(week, shift.day),
        M.time(s.startOf(shift)), M.time(s.startOf(shift) + s.lenOf(shift) * 60),
        s.lenOf(shift).toFixed(2), s.deptOf(shift.dept).code, M.reg,
      ].concat(f.scores ? [String(d.score), String(s.ranks[shift.da])] : []),
    }
  })

  const ptoRows: { pto: boolean; cells: string[] }[] = []
  if (f.pto) {
    Object.keys(s.overrides).forEach((daId) =>
      Object.keys(s.overrides[daId]).forEach((dayKey) => {
        const o = s.overrides[daId][Number(dayKey)]
        if (o.t !== 'PTO') return
        const d = s.daOf(daId)
        ptoRows.push({
          pto: true,
          cells: [M.id(d), d.name, M.date(week, Number(dayKey)), '', '', o.h.toFixed(2), '', M.pto]
            .concat(f.scores ? [String(d.score), String(s.ranks[daId])] : []),
        })
      }))
  }

  const all = [...rows, ...ptoRows]
  const heads = M.heads.concat(f.scores ? ['net_score', 'rank'] : [])
  const missing = [...new Set(shifts.filter((x) => !M.id(s.daOf(x.da))).map((x) => s.daOf(x.da).name))]

  const unfilledN = s.needs
    ? Object.keys(s.needs).reduce(
        (n, dp) => n + (s.needs?.[dp] ?? []).reduce((a, need, day) => a + Math.max(0, need - s.filled(dp, day)), 0),
        0,
      )
    : 0

  // A PTO day that also carries a shift exports twice, and payroll pays both.
  const doublePay = f.pto ? s.viol.hard.filter((h) => h.rule === 'Approved time off').length : 0

  const fname = f.fname ?? `UDSP_schedule_${f.preset.toLowerCase()}_${fmtIso(week, 0)}_${fmtIso(week, 6)}`
  const canDownload = s.viol.hard.length === 0 || f.confirmHard
  const rangeLabel = f.range === 'Custom' ? `${f.from ?? 'Jul 26'} - ${f.to ?? 'Aug 1'}` : weekLabelShort(week)

  const warnings: { tone: 'danger' | 'warn'; text: string }[] = []
  if (s.viol.hard.length) {
    warnings.push({ tone: 'danger', text: `${s.viol.hard.length} hard violation${s.viol.hard.length > 1 ? 's' : ''} - listed in Violations` })
  }
  const exScheduled = s.excluded.filter((e) => s.shifts.some((x) => x.da === e.da))
  if (exScheduled.length) {
    warnings.push({
      tone: 'warn',
      text: `${exScheduled.length} excluded DAs are scheduled this week: ${exScheduled.map((e) => `${s.daOf(e.da).name.split(',')[0]} (${e.reason})`).join(' · ')}`,
    })
  }
  if (unfilledN) warnings.push({ tone: 'warn', text: `${unfilledN} unfilled slots in the range` })
  if (missing.length) {
    warnings.push({
      tone: 'warn',
      text: `${missing.length} rows have no ${f.preset === 'Generic' ? 'identifier' : `${f.preset} code`}: ${missing.join(' · ')} - set it on the roster`,
    })
  }
  if (doublePay) warnings.push({ tone: 'danger', text: `${doublePay} day exports as both a shift and PTO - Paycom will pay both` })

  const logBlock = (
    <div key="log" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={LABEL}>Export log</span>
      {s.exportLog.length === 0 && <span style={{ ...caption1, color: 'var(--text-secondary)' }}>Nothing exported yet</span>}
      {s.exportLog.map((l, i) => (
        <div
          key={i}
          title={`Settings as run: ${l.preset} · ${l.format} · ${l.range} · ${l.scores} · by ${l.by}`}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 28, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 2, ...caption1 }}
        >
          <span style={{ width: 150, color: 'var(--text-secondary)', flexShrink: 0, whiteSpace: 'nowrap' }}>{l.when}</span>
          <span style={{ fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap' }}>{l.preset} · {l.format}</span>
          <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{l.range} · {l.rows} · {l.scores}</span>
          <span style={{ flex: 1 }} />
          <span
            onClick={() => s.toastMsg(`Re-served the stored original bytes - ${l.file}`)}
            style={{ color: 'var(--text-link)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Download again
          </span>
          <span
            onClick={() => {
              s.setF('preset', l.preset)
              s.setF('format', l.format)
              s.setF('scores', l.scores !== 'DA-safe')
              s.toastMsg('Form prefilled from this row - Download writes a new log row')
            }}
            style={{ color: 'var(--text-link)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Export again
          </span>
        </div>
      ))}
    </div>
  )

  const body = (
    <>
      <div style={{ display: 'flex', gap: 'var(--size-160)', flexWrap: 'wrap' }}>
        <Field label="System preset">
          <div style={{ display: 'flex', gap: 'var(--size-40)' }}>
            {['Paycom', 'ADP', 'Generic'].map((p) => (
              <Seg key={p} on={f.preset === p} onClick={() => s.setF('preset', p)}>{p}</Seg>
            ))}
          </div>
        </Field>
        <Field label="Format">
          <div style={{ display: 'flex', gap: 'var(--size-40)' }}>
            {['CSV', 'XLSX'].map((p) => (
              <Seg key={p} on={f.format === p} onClick={() => s.setF('format', p)}>{p}</Seg>
            ))}
          </div>
        </Field>
        <Field label="Range">
          <div style={{ display: 'flex', gap: 'var(--size-40)' }}>
            <Seg on={f.range !== 'Custom'} onClick={() => s.setF('range', 'This week')}>This week</Seg>
            <Seg on={f.range === 'Custom'} onClick={() => s.setF('range', 'Custom')}>Custom</Seg>
          </div>
        </Field>
      </div>

      {f.range === 'Custom' && (
        <div style={{ display: 'flex', gap: 'var(--size-120)' }}>
          <Field label="From"><Input value={f.from ?? 'Jul 26'} onChange={(v) => s.setF('from', v)} placeholder="Jul 26" /></Field>
          <Field label="To"><Input value={f.to ?? 'Aug 1'} onChange={(v) => s.setF('to', v)} placeholder="Aug 1" /></Field>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--size-200)', flexWrap: 'wrap' }}>
        <CheckRow label="Include approved PTO rows" on={f.pto} onClick={() => s.setF('pto', !f.pto)} />
        <CheckRow label="Include scores and ranks" on={f.scores} onClick={() => s.setF('scores', !f.scores)} />
        <CheckRow label="Include unfilled slots" on={f.unfilled} onClick={() => s.setF('unfilled', !f.unfilled)} />
      </div>

      {f.scores && <span style={{ ...caption1, color: 'var(--warning-fg)' }}>Scores on - not DA-safe</span>}

      <Field label="File name">
        <Input mono value={fname} onChange={(v) => s.setF('fname', v)} />
      </Field>

      <span style={caption1Strong}>
        {rows.length} shift rows · {ptoRows.length} PTO rows · {f.unfilled ? unfilledN : 0} unfilled · {rangeLabel}
      </span>

      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-medium)', overflow: 'auto hidden' }}>
        <div style={{ display: 'flex', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          {heads.map((h, i) => (
            <span
              key={i}
              style={{
                boxSizing: 'border-box', width: i === 1 ? 130 : 92, flexShrink: 0, padding: '4px 8px',
                ...caption2Strong, color: 'var(--text-label)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {h}
            </span>
          ))}
        </div>
        {all.slice(0, 6).map((r, ri) => (
          <div key={ri} style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: r.pto ? 'var(--green-50)' : 'transparent' }}>
            {r.cells.map((c, i) => (
              <span
                key={i}
                style={{
                  boxSizing: 'border-box', width: i === 1 ? 130 : 92, flexShrink: 0, padding: '3px 8px',
                  ...caption2, color: c === '' ? 'var(--text-disabled)' : 'var(--text-primary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontVariantNumeric: 'tabular-nums',
                }}
              >
                {c === '' ? '-' : c}
              </span>
            ))}
          </div>
        ))}
        {all.length > 6 && (
          <div style={{ padding: '4px 8px', ...caption2, color: 'var(--text-helper)' }}>Plus {all.length - 6} more rows</div>
        )}
      </div>

      {warnings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
          {warnings.map((w, i) => (
            <div
              key={i}
              style={{
                boxSizing: 'border-box', padding: 'var(--size-40) var(--size-100)',
                background: w.tone === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                border: `1px solid ${w.tone === 'danger' ? 'var(--danger-border)' : 'var(--warning-border)'}`,
                borderRadius: 'var(--radius-small)',
                ...caption1, color: w.tone === 'danger' ? 'var(--danger-fg)' : 'var(--warning-fg)',
              }}
            >
              {w.text}
            </div>
          ))}
        </div>
      )}

      {s.viol.hard.length > 0 && (
        <CheckRow
          label={`Export anyway - ${s.viol.hard.length} hard violation${s.viol.hard.length > 1 ? 's' : ''}`}
          on={f.confirmHard}
          onClick={() => s.setF('confirmHard', !f.confirmHard)}
        />
      )}
    </>
  )

  return (
    <DialogShell
      s={s}
      title="Export - the payroll dump file"
      width={720}
      cancelLabel="Close"
      cta="Download"
      ctaEnabled={canDownload}
      onCta={() => {
        const rowsTxt = `${rows.length} shifts · ${ptoRows.length} PTO${f.unfilled ? ` · ${unfilledN} unfilled` : ''}`
        const file = `${fname}.${f.format.toLowerCase()}`
        s.setExportLog((log) => [
          { when: 'Just now', by: 'You', preset: f.preset, format: f.format, range: rangeLabel, rows: rowsTxt, scores: f.scores ? 'Scores included' : 'DA-safe', file },
          ...log,
        ])
        s.closeDlg()
        s.log('Export', `${f.preset} · ${f.format} · ${rowsTxt} · ${file}`)
        s.toastMsg(`Downloaded ${file} - a new log row was written`)
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
        {f.logFirst && logBlock}
        {f.logFirst && <div style={{ borderTop: '1px solid var(--border-subtle)' }} />}
        {body}
        {!f.logFirst && <div style={{ borderTop: '1px solid var(--border-subtle)' }} />}
        {!f.logFirst && logBlock}
      </div>
    </DialogShell>
  )
}
