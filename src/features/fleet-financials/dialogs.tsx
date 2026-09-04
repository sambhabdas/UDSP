'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption2Strong, subtitle1, subtitle2 } from '../../ds/type'
import { MONEY_BAND, MONTHS_FULL, RUN_RESULT, STATUSES, VEHICLES } from './data'
import { money } from './calc'
import { Button, IconButton, Scrim } from './parts'
import { LABEL } from './style'
import type { FleetFinancialsState } from './useFleetFinancials'

/**
 * Restating a closed period. The figure is already agreed with somebody, so
 * changing it costs a reason - and the Save button stays dead until there is one.
 */
export function RetroDialog({ s }: { s: FleetFinancialsState }) {
  const r = s.retro
  if (!r) return null
  const ok = s.retroReason.trim().length >= 5
  const veh = VEHICLES.find((v) => v.id === r.vid)
  const close = () => { s.setRetro(null); s.setRetroReason('') }

  return (
    <Scrim onClose={close}>
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width: 560, background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-large)', boxShadow: 'var(--elevation-dialog)',
          padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-160)',
        }}
      >
        <span style={subtitle1}>Restate a Figure</span>
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>
          {`${r.label} has ended. ${veh ? veh.name : 'Fleet (unallocated)'} ${money(r.old, true)} → ${money(r.num, true)}.`}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <span style={LABEL}>Reason</span>
          <textarea
            value={s.retroReason}
            onChange={(e) => s.setRetroReason(e.target.value)}
            placeholder="Why is this figure changing?"
            style={{
              boxSizing: 'border-box', width: '100%', height: 76, resize: 'none',
              padding: 'var(--size-80)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)', ...body1,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--size-80)' }}>
          <Button onClick={close}>Cancel</Button>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!ok) { s.toastMsg('A reason is required'); return }
              s.setRetro(null)
              s.writeCell(r.key, r.num, r.old, s.retroReason.trim())
            }}
            style={{
              height: 'var(--control-height)', display: 'flex', alignItems: 'center',
              padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)',
              border: `1px solid ${ok ? 'var(--primary)' : 'var(--border-default)'}`,
              background: ok ? 'var(--primary)' : 'var(--surface-subtle)',
              color: ok ? 'var(--text-inverse)' : 'var(--text-disabled)',
              ...body1Strong, cursor: ok ? 'pointer' : 'not-allowed',
            }}
          >
            Save restatement
          </div>
        </div>
      </div>
    </Scrim>
  )
}

const STEPS: [number, string][] = [[1, 'Upload'], [2, 'Map'], [3, 'Preview'], [4, 'Run']]

/** The four-step import: upload, map the columns, preview every row, then run. */
export function ImportDialog({ s }: { s: FleetFinancialsState }) {
  if (!s.importOpen) return null

  const title = s.isIns ? 'Import Insurance File' : s.isLease ? 'Import Lease File' : 'Import Amazon Payments File'
  const file = s.isIns
    ? 'insurer-jul-2026.csv · 24 rows'
    : s.isLease ? 'lessor-statement-jul-2026.csv · 26 rows' : 'amazon-vehicle-pay-2026-wk30.csv · 24 rows'
  const period = s.isAmz ? 'Wk 30 · Jul 19-25' : `${MONTHS_FULL[6]} ${s.year}`
  const close = () => { s.setImportOpen(false); s.setImpStep(1) }

  const mapRows = [
    { label: 'Vehicle key', value: 'VIN · file column "vin"' },
    { label: 'Period', value: period },
    { label: 'Amount', value: s.isAmz ? 'payment_amount' : s.isIns ? 'premium_usd' : 'monthly_rent' },
  ].concat(s.isAmz ? [{ label: 'Peak routes · Vehicles paid', value: 'peak_routes · vehicles_paid' }] : [])

  return (
    <Scrim onClose={close}>
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width: 880, maxHeight: '82vh',
          background: 'var(--surface-raised)', borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ boxSizing: 'border-box', minHeight: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-160)', padding: 'var(--size-80) var(--size-160)', borderBottom: '1px solid var(--border-default)' }}>
          <span style={subtitle1}>{title}</span>
          <div style={{ flex: 1 }} />
          {STEPS.map(([n, label]) => {
            const reached = s.impStep >= n
            return (
              <span
                key={n}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--size-80)', ...body1,
                  fontWeight: s.impStep === n ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  color: reached ? 'var(--text-primary)' : 'var(--text-disabled)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%',
                    background: reached ? 'var(--primary)' : 'var(--surface-subtle)',
                    color: reached ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    fontSize: 'var(--caption-1-size)', fontWeight: 'var(--weight-semibold)',
                  }}
                >
                  {n}
                </span>
                {label}
              </span>
            )
          })}
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
          {s.impStep === 1 && (
            <label
              style={{
                boxSizing: 'border-box', height: 200, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 'var(--size-80)',
                border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-medium)',
                background: 'var(--surface-subtle)', cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
                <Icon name="FnUpload" size={32} />
              </span>
              <span style={body1Strong}>Drop a CSV or XLSX file here, or browse</span>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (!/\.csv$/i.test(f.name)) { s.setImpFileName(f.name); s.setImpStep(2); return }
                  // A CSV can be counted, so the row count is real rather than seeded.
                  const reader = new FileReader()
                  reader.onload = (ev) => {
                    const rows = String(ev.target?.result ?? '').split('\n').filter((l) => l.trim()).length
                    s.setImpFileName(`${f.name} · ${Math.max(0, rows - 1)} rows`)
                    s.setImpStep(2)
                  }
                  reader.readAsText(f)
                }}
                style={{ display: 'none' }}
              />
            </label>
          )}

          {s.impStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
              <span style={{ ...body1, color: 'var(--text-secondary)' }}>{s.impFileName || file}</span>
              {mapRows.map((m) => (
                <div key={m.label} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: 'var(--size-160)', minHeight: 48, borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={LABEL}>{m.label}</span>
                  <div style={{ boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)', ...body1 }}>
                    <span style={{ flex: 1 }}>{m.value}</span>
                    <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
                      <Icon name="SvChevron" size={16} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {s.impStep === 3 && <Preview s={s} />}

          {s.impStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)', padding: 'var(--size-160)', border: '1px solid var(--success-border)', background: 'var(--success-bg)', borderRadius: 'var(--radius-medium)' }}>
              <span style={{ ...subtitle2, color: 'var(--success-fg)' }}>Import complete</span>
              {RUN_RESULT.map((line) => (
                <span key={line} style={{ ...body1, color: 'var(--text-primary)' }}>{line}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
          <span style={{ flex: 1, ...caption1, color: 'var(--text-secondary)' }} />
          {(s.impStep === 2 || s.impStep === 3) && (
            <Button onClick={() => s.setImpStep(Math.max(1, s.impStep - 1))}>Back</Button>
          )}
          <Button onClick={close}>{s.impStep === 4 ? 'Close' : 'Cancel'}</Button>
          <Button
            primary
            onClick={() => {
              if (s.impStep === 3) {
                s.setImpStep(4)
                s.setBatches((b) => [{ when: 'Aug 16, 10:14', file: file.split(' ·')[0], period, counts: '19 written · 2 overwritten · 3 skipped', status: 'Done' }, ...b])
                return
              }
              if (s.impStep === 4) { s.setImportOpen(false); s.setImpStep(1); s.setHistoryOpen(true); return }
              s.setImpStep(s.impStep + 1)
            }}
          >
            {s.impStep === 1 ? 'Continue' : s.impStep === 2 ? 'Preview' : s.impStep === 3 ? 'Run import' : 'View in History'}
          </Button>
        </div>
      </div>
    </Scrim>
  )
}

/** Step 3: what the file will do to the money, and every row it could not place. */
function Preview({ s }: { s: FleetFinancialsState }) {
  const rows = [
    { vehicle: 'Van 103', vin: '1FTBW2CM1PKB60427', amount: '$226.50', status: 'New value', color: 'var(--success-fg)' },
    { vehicle: 'Van 107', vin: '1FTBW2CM8NKA39114', amount: '$226.50', status: 'Overwrite', color: 'var(--warning-fg)' },
    s.resolvedVan
      ? { vehicle: `U-40213 → ${s.resolvedVan}`, vin: '-', amount: '$214.00', status: 'Resolved', color: 'var(--success-fg)' }
      : { vehicle: 'U-40213 (lessor ID)', vin: '-', amount: '$214.00', status: 'Unmatched key', color: 'var(--danger-fg)', resolve: 'Pick a vehicle' },
    { vehicle: 'Van 118', vin: '3C6TRVAG2ME517766', amount: '$198.00', status: 'Off fleet', color: 'var(--danger-fg)' },
    { vehicle: '"Policy admin fee"', vin: '-', amount: '$241.00', status: 'No vehicle key', color: 'var(--warning-fg)', resolve: 'Skip' },
    { vehicle: 'Van 131', vin: '3C6TRVAG7ME529431', amount: '"n/a"', status: 'Parse error', color: 'var(--danger-fg)' },
  ]
  const HEAD: [string, 'left' | 'right'][] = [['File row', 'left'], ['VIN', 'left'], ['Amount', 'right'], ['Status', 'right']]
  const COLS = '1.1fr 1.4fr .7fr 1.7fr'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-100)' }}>
        {MONEY_BAND.map((b) => (
          <div
            key={b.label}
            style={{ boxSizing: 'border-box', padding: 'var(--size-120)', border: `1px solid ${b.border}`, borderRadius: 'var(--radius-medium)', background: b.bg, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}
          >
            <span style={{ ...caption2Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              {b.label}
            </span>
            <span style={{ ...body1Strong, color: b.color, fontVariantNumeric: 'tabular-nums' }}>{b.value}</span>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-120)' }}>
          {HEAD.map(([label, align]) => (
            <span key={label} style={{ ...caption2Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: align }}>
              {label}
            </span>
          ))}
        </div>
        {rows.map((p, i) => (
          <div key={`${p.vehicle}-${i}`} style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', minHeight: 44, padding: 'var(--size-60) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={body1}>{p.vehicle}</span>
            <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{p.vin}</span>
            <span style={{ textAlign: 'right', ...body1, fontVariantNumeric: 'tabular-nums' }}>{p.amount}</span>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--size-60)' }}>
              <span style={{ ...caption1, fontWeight: 'var(--weight-semibold)', color: p.color, textAlign: 'right' }}>
                {p.status}
              </span>
              {p.resolve && (
                <ResolveButton
                  label={p.resolve}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (p.resolve === 'Pick a vehicle') s.setResolvePickerOpen(!s.resolvePickerOpen)
                  }}
                />
              )}
              {p.resolve === 'Pick a vehicle' && s.resolvePickerOpen && (
                <div
                  style={{
                    position: 'absolute', top: 28, right: 0, boxSizing: 'border-box', width: 180,
                    maxHeight: 200, overflow: 'auto', padding: 'var(--size-40)',
                    background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)',
                    zIndex: 20, display: 'flex', flexDirection: 'column',
                  }}
                >
                  {VEHICLES.filter((v) => v.status !== 'Off fleet').map((v) => (
                    <PickerRow
                      key={v.id}
                      label={v.name}
                      onClick={(e) => { e.stopPropagation(); s.setResolvedVan(v.name); s.setResolvePickerOpen(false) }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResolveButton({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--size-40)', height: 24,
        padding: '0 var(--size-80)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        ...caption1, cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {label}
    </span>
  )
}

function PickerRow({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box', minHeight: 28, display: 'flex', alignItems: 'center',
        padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1, cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

/** Every cell edit and every import batch, in a right-hand drawer. */
export function HistoryDrawer({ s }: { s: FleetFinancialsState }) {
  if (!s.historyOpen) return null
  const which = s.isIns ? 'Insurance' : s.isLease ? 'Lease' : 'Amazon Payments'

  return (
    <Scrim onClose={() => s.setHistoryOpen(false)} align="right">
      <div
        data-dialog-drawer=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width: 720, height: '100%',
          background: 'var(--surface-raised)', boxShadow: 'var(--elevation-drawer)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-200) var(--size-240)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={subtitle1}>{`Change history · ${which}`}</span>
          <div style={{ flex: 1 }} />
          <IconButton name="FnDismiss" onClick={() => s.setHistoryOpen(false)} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-240)', display: 'flex', flexDirection: 'column', gap: 'var(--size-240)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
            <span style={{ ...caption2Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Cell Edits
            </span>
            {s.edits.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 90px 1fr 1.2fr 1fr 70px', alignItems: 'center', gap: 'var(--size-100)', minHeight: 44, padding: 'var(--size-60) 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{e.when}</span>
                <span style={caption1}>{e.period}</span>
                <span style={body1}>{e.vehicle}</span>
                <span style={{ ...body1, fontVariantNumeric: 'tabular-nums' }}>{e.change}</span>
                <span style={{ ...caption1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.reason}
                </span>
                <span style={{ ...caption1, color: 'var(--text-secondary)', textAlign: 'right' }}>{e.by}</span>
              </div>
            ))}
            {s.edits.length === 0 && <span style={{ ...body1, color: 'var(--text-secondary)' }}>No edits yet.</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
            <span style={{ ...caption2Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Import Batches
            </span>
            {s.batches.map((b, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 90px 1.3fr 90px', alignItems: 'center', gap: 'var(--size-100)', minHeight: 44, padding: 'var(--size-60) 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{b.when}</span>
                <span style={{ ...body1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.file}</span>
                <span style={caption1}>{b.period}</span>
                <span style={{ ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{b.counts}</span>
                <span style={{ ...caption1, fontWeight: 'var(--weight-semibold)', color: 'var(--success-fg)', textAlign: 'right' }}>
                  {b.status}
                </span>
              </div>
            ))}
            {s.batches.length === 0 && <span style={{ ...body1, color: 'var(--text-secondary)' }}>No imports yet.</span>}
          </div>
        </div>
      </div>
    </Scrim>
  )
}

/** The filter drawer. Edits a draft, so Cancel really does cancel. */
export function FilterDrawer({ s }: { s: FleetFinancialsState }) {
  if (!s.fpOpen) return null
  const d = s.draft
  const open = !!s.fpSec.g0
  const count = Object.keys(d.sts).length

  return (
    <Scrim onClose={() => s.setFpOpen(false)} align="right">
      <div
        data-dialog-drawer=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width: 360, height: '100%',
          background: 'var(--surface-raised)', boxShadow: 'var(--elevation-dialog)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={subtitle1}>Filters</span>
          <div style={{ flex: 1 }} />
          <IconButton name="FnDismiss" size={20} box={32} onClick={() => s.setFpOpen(false)} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
            <GroupHeader
              label="Status"
              count={count}
              open={open}
              onToggle={() => s.setFpSec({ ...s.fpSec, g0: !open })}
            />
            {open && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
                {STATUSES.map((v) => {
                  const on = !!d.sts[v]
                  return (
                    <div
                      key={v}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const sts = { ...d.sts }
                        if (sts[v]) delete sts[v]
                        else sts[v] = true
                        s.setPf({ ...d, sts })
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 28, cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          boxSizing: 'border-box', width: 16, height: 16,
                          borderRadius: 'var(--radius-small)',
                          border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: on ? 'var(--primary)' : 'var(--surface-card)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-inverse)',
                        }}
                      >
                        {on && <Icon name="FnCheck" size={12} />}
                      </span>
                      <span style={body1}>{v}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', minHeight: 48, padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ flex: 1, ...body1Strong }}>Incomplete Rows Only</span>
            <div
              role="switch"
              aria-checked={d.inc}
              tabIndex={0}
              onClick={() => s.setPf({ ...d, inc: !d.inc })}
              style={{
                boxSizing: 'border-box', width: 36, height: 20, borderRadius: 'var(--radius-pill)',
                background: d.inc ? 'var(--primary)' : 'var(--neutral-400)',
                display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer',
                transition: 'background 120ms',
              }}
            >
              <span
                style={{
                  width: 16, height: 16, borderRadius: '50%', background: 'var(--surface-card)',
                  boxShadow: 'var(--elevation-card)',
                  transform: `translateX(${d.inc ? 16 : 0}px)`, transition: 'transform 120ms',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
          <ClearAll onClick={() => s.setPf({ sts: {}, inc: false })} />
          <div style={{ flex: 1 }} />
          <Button onClick={() => s.setFpOpen(false)}>Cancel</Button>
          <Button
            primary
            onClick={() => {
              s.setFpOpen(false)
              s.setSSts(d.sts)
              s.setOnlyIncomplete(d.inc)
              s.toastMsg('Filters applied')
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </Scrim>
  )
}

function GroupHeader({ label, count, open, onToggle }: { label: string; count: number; open: boolean; onToggle: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 48,
        padding: '0 var(--size-160)', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : undefined,
      }}
      {...hoverProps}
    >
      <span style={body1Strong}>{label}</span>
      {count > 0 && (
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 var(--size-60)', borderRadius: 'var(--radius-pill)', background: 'var(--blue-50)', color: 'var(--blue-700)', ...caption1, fontWeight: 'var(--weight-semibold)' }}>
          {count}
        </span>
      )}
      <div style={{ flex: 1 }} />
      <span style={{ display: 'flex', color: 'var(--text-secondary)', transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform 120ms' }}>
        <Icon name="SvChevron" size={16} />
      </span>
    </div>
  )
}

function ClearAll({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', height: 'var(--control-height)',
        padding: '0 var(--size-100)', borderRadius: 'var(--radius-medium)',
        color: 'var(--text-link)', ...body1Strong, cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : undefined,
      }}
      {...hoverProps}
    >
      Clear All
    </div>
  )
}
