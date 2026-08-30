'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { BATCH_STATUSES, SOURCES } from './data'
import { Button, Checkbox, Field, IconButton, Input, PickerField } from './parts'
import type { ImportsState } from './useImports'

// ── The read-only record dialogs ────────────────────────────────────────────

const G_TITLES: Record<string, string> = {
  skips: 'Skipped Values', mapping: 'Mapping Used', skipRows: 'Skipped Rows', matches: 'Remembered Matches',
}

interface GRow {
  value: string
  detail: string
  actionLabel?: string
  action?: () => void
}

export function RecordDialog({ s }: { s: ImportsState }) {
  if (!s.gDlg || !s.gCtx) return null
  const rows = gRows(s)
  const empty = s.gDlg === 'skips' ? s.skipVals.length === 0 : s.gDlg === 'matches' ? s.remembered.length === 0 : false

  return (
    <Overlay onClose={s.closeG}>
      <Shell width={560} maxHeight="80vh" title={G_TITLES[s.gDlg]} onClose={s.closeG} footer={<><div style={{ flex: 1 }} /><Button onClick={s.closeG}>Close</Button></>}>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
          <span style={subtitle1}>{s.gCtx.src}</span>
          <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
            {rows.map((r) => (
              <div key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 44, padding: 'var(--size-60) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.value}</span>
                <span style={{ flex: 1, ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.detail}</span>
                {r.actionLabel && (
                  <a href="#" onClick={(e) => { e.preventDefault(); r.action?.() }} style={{ ...body1, whiteSpace: 'nowrap' }}>{r.actionLabel}</a>
                )}
              </div>
            ))}
            {empty && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 64 }}>
                <span style={{ ...body1, color: 'var(--text-secondary)' }}>
                  {s.gDlg === 'skips' ? 'No skipped values for this source.' : 'No remembered matches for this source.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Shell>
    </Overlay>
  )
}

function gRows(s: ImportsState): GRow[] {
  if (s.gDlg === 'mapping') {
    return [
      { value: 'Associate Match', detail: s.columns.daCol },
      { value: 'Event Date', detail: s.columns.dateCol },
      { value: 'Reporting Date', detail: s.columns.repCol },
      { value: 'Value Map', detail: `${s.vmap.length} values` },
      { value: 'Filters', detail: s.filters.join(' · ') || 'None' },
    ]
  }
  if (s.gDlg === 'skipRows') {
    return [
      { value: 'Failed filter', detail: '1,131 rows' },
      { value: 'Unmapped value', detail: '29 rows' },
      { value: 'Unparseable date', detail: '7 rows' },
    ]
  }
  if (s.gDlg === 'skips') {
    return s.skipVals.map((v) => ({
      value: v,
      detail: 'Blacklisted for this source',
      actionLabel: 'Un-skip',
      action: () => { s.setSkipVals(s.skipVals.filter((x) => x !== v)); s.toastMsg(`${v} will match again on the next run`) },
    }))
  }
  return s.remembered.map(([from, to]) => ({
    value: from,
    detail: `Matches ${to}`,
    actionLabel: 'Remove',
    action: () => { s.setRemembered(s.remembered.filter((x) => x[0] !== from)); s.toastMsg(`${from} will queue for remediation on the next run`) },
  }))
}

// ── The three form dialogs ──────────────────────────────────────────────────

const F_TITLES: Record<string, string> = { mv: 'Map Value', filter: 'Add Filter', source: 'Custom Source' }
const F_SAVES: Record<string, string> = { mv: 'Map Value', filter: 'Add Filter', source: 'Add Source' }

export function FormDialog({ s }: { s: ImportsState }) {
  if (!s.fDlg) return null
  const close = () => { s.setFDlg(null); s.closeMenu() }
  return (
    <Overlay onClose={close}>
      <Shell
        width={560}
        title={F_TITLES[s.fDlg]}
        onClose={close}
        footer={
          <>
            <div style={{ flex: 1 }} />
            <Button onClick={close}>Cancel</Button>
            <Button kind="primary" onClick={() => saveForm(s)}>{F_SAVES[s.fDlg!]}</Button>
          </>
        }
      >
        <div style={{ padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
          {s.fDlg === 'mv' && <MapValue s={s} />}
          {s.fDlg === 'filter' && <AddFilter s={s} />}
          {s.fDlg === 'source' && (
            <Field label="Source Name">
              <Input value={s.cs} onChange={s.setCs} placeholder="Name the source" />
            </Field>
          )}
        </div>
      </Shell>
    </Overlay>
  )
}

function MapValue({ s }: { s: ImportsState }) {
  return (
    <>
      <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
        <Field label="File Value">
          <Input value={s.mv.file} onChange={(v) => s.setMv({ ...s.mv, file: v })} placeholder="Value as it appears in the file" />
        </Field>
        <Field label="Standard">
          <PickerField
            label={s.mv.std ?? 'Pick a standard'}
            color={s.mv.std ? 'var(--text-primary)' : 'var(--text-helper)'}
            onClick={(e) => s.openMenu(e, 'mvStd')}
          />
        </Field>
      </div>
      <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
        <Field label="Direction">
          <div style={{ display: 'flex', height: 'var(--control-height)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
            <Half on={s.mv.dir === 'neg'} tone="danger" onClick={() => s.setMv({ ...s.mv, dir: 'neg' })}>Negative</Half>
            <div style={{ width: 1, background: 'var(--border-default)' }} />
            <Half on={s.mv.dir === 'pos'} tone="success" onClick={() => s.setMv({ ...s.mv, dir: 'pos' })}>Positive</Half>
          </div>
        </Field>
        <div />
      </div>
    </>
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

function AddFilter({ s }: { s: ImportsState }) {
  return (
    <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
      <Field label="Column">
        <PickerField label={s.ff.col} onClick={(e) => s.openMenu(e, 'fCol')} />
      </Field>
      <Field label="Operator">
        <PickerField label={s.ff.op} onClick={(e) => s.openMenu(e, 'fOp')} />
      </Field>
      <Field label="Value" span>
        <Input value={s.ff.val} onChange={(v) => s.setFf({ ...s.ff, val: v })} placeholder="Value to keep" />
      </Field>
    </div>
  )
}

function saveForm(s: ImportsState) {
  if (s.fDlg === 'mv') {
    if (!s.mv.file.trim()) { s.toastMsg('Enter the file value first'); return }
    if (!s.mv.std) { s.toastMsg('Pick a standard'); return }
    const file = s.mv.file.trim().toUpperCase()
    s.setVmap(s.vmap.concat([[file, s.mv.std, s.mv.dir]]))
    s.setFDlg(null)
    s.toastMsg(`${file} mapped to ${s.mv.std}`)
    return
  }
  if (s.fDlg === 'filter') {
    // "Is empty" is the one operator that needs no value.
    if (s.ff.op !== 'Is empty' && !s.ff.val.trim()) { s.toastMsg('Enter a value for the filter'); return }
    const label = s.ff.op === 'Is empty'
      ? `${s.ff.col} is empty`
      : `${s.ff.col} ${s.ff.op.toLowerCase()} ${s.ff.val.trim()}`
    s.setFilters(s.filters.concat([label]))
    s.setFDlg(null)
    s.toastMsg('Filter added - rows failing it will skip')
    return
  }
  if (s.cs.trim().length < 2) { s.toastMsg('Name the source first'); return }
  const name = s.cs.trim()
  s.setCustomSources(s.customSources.concat([name]))
  s.setSrc(name)
  s.setFDlg(null)
  s.toastMsg(`${name} added - upload a file and map it, then Save as Preset`)
}

// ── The filter drawer ───────────────────────────────────────────────────────

export function FilterPanel({ s }: { s: ImportsState }) {
  if (!s.fpOpen) return null
  const p = s.pending
  const close = () => { s.setFpOpen(false); s.closeMenu() }
  const groups: [string, string, string[], 'srcs' | 'sts'][] = [
    ['g0', 'Source', SOURCES, 'srcs'],
    ['g1', 'Status', BATCH_STATUSES, 'sts'],
  ]

  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', justifyContent: 'flex-end', zIndex: 60 }}>
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{ boxSizing: 'border-box', width: 360, height: '100%', background: 'var(--surface-raised)', boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={subtitle1}>Filters</span>
          <div style={{ flex: 1 }} />
          <IconButton icon="FnDismiss" onClick={close} size={32} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {groups.map(([id, label, pool, key]) => {
            const open = !!s.fpSec[id]
            const count = Object.keys(p[key]).length
            return (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
                <GroupHead label={label} count={count} open={open} onToggle={() => s.setFpSec({ ...s.fpSec, [id]: !open })} />
                {open && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
                    {pool.map((v) => {
                      const on = !!p[key][v]
                      const toggle = () => {
                        const next = { ...p[key] }
                        if (next[v]) delete next[v]
                        else next[v] = true
                        s.setPf({ ...p, [key]: next })
                      }
                      return (
                        <div key={v} data-fx="" tabIndex={0} role="button" onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 28, cursor: 'pointer' }}>
                          <Checkbox on={on} onClick={(e) => { e.stopPropagation(); toggle() }} />
                          <span style={body1}>{v}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
          <Button kind="link" onClick={() => s.setPf({ srcs: {}, sts: {} })}>Clear All</Button>
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" onClick={s.applyFilters}>Apply</Button>
        </div>
      </div>
    </div>
  )
}

function GroupHead({ label, count, open, onToggle }: { label: string; count: number; open: boolean; onToggle: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onToggle}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 48, padding: '0 var(--size-160)', cursor: 'pointer', background: hover ? 'var(--surface-subtle)' : undefined }}
      {...hoverProps}
    >
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{label}</span>
      {count > 0 && (
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 var(--size-60)', borderRadius: 'var(--radius-pill)', background: 'var(--blue-50)', color: 'var(--blue-700)', ...caption1Strong }}>
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

// ── Shared shell ────────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
      {children}
    </div>
  )
}

function Shell({
  width, maxHeight, title, onClose, children, footer,
}: {
  width: number
  maxHeight?: string
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div
      data-dialog-card=""
      onClick={(e) => e.stopPropagation()}
      style={{ boxSizing: 'border-box', width, maxHeight, background: 'var(--surface-raised)', borderRadius: 'var(--radius-large)', boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-200)' }}>
        <span style={subtitle1}>{title}</span>
        <div style={{ flex: 1 }} />
        <IconButton icon="FnDismiss" onClick={onClose} size={32} />
      </div>
      {children}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200)', borderTop: '1px solid var(--border-subtle)' }}>
        {footer}
      </div>
    </div>
  )
}
