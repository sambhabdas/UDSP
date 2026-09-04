'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { body1, body1Strong, caption1, subtitle1 } from '../../ds/type'
import { PAYER_OPTS, SET_TYPES, STATUSES, TODAY, WEEKDAYS } from './data'
import { fmt } from './calc'
import { Button, IconButton, Pill, Segmented, Tag } from './parts'
import { LABEL } from './style'
import type { Form, VehiclesState } from './useVehicles'

type FieldKind = 'text' | 'area' | 'seg' | 'combo'

interface Field {
  key: string
  label: string
  kind: FieldKind
  ph?: string
  mono?: boolean
  span?: number
  options?: string[]
  /** Combos can create the value they were searched for. */
  addNew?: (typed: string) => void
}

const T = (key: string, label: string, o: Partial<Field> = {}): Field => ({ key, label, kind: 'text', span: 1, ...o })
const AREA = (key: string, label: string, span = 3): Field => ({ key, label, kind: 'area', span })
const SEG = (key: string, label: string, options: string[], span = 1): Field => ({ key, label, kind: 'seg', options, span })
const COMBO = (key: string, label: string, options: string[], ph: string, span = 1, addNew?: (t: string) => void): Field =>
  ({ key, label, kind: 'combo', options, ph, span, addNew })

/**
 * Every popup on the page is this one dialog wearing a different shape: a
 * title, a grid of fields, and optionally a file drop, a repeat block, a tag
 * picker or a plain list.
 */
export function Dialog({ s }: { s: VehiclesState }) {
  if (!s.dlg) return null
  const shape = shapeOf(s)

  return (
    <div
      onClick={s.closeDlg}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width: shape.width, maxHeight: '84vh',
          background: 'var(--surface-raised)', borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ boxSizing: 'border-box', height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-default)' }}>
          <span style={{ flex: 1, ...subtitle1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {shape.title}
          </span>
          <IconButton name="FnDismiss" size={20} box={32} onClick={s.closeDlg} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
          {shape.note && <span style={subtitle1}>{shape.note}</span>}
          {s.dlgError && (
            <div style={{ padding: 'var(--size-100) var(--size-120)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-medium)', ...body1, color: 'var(--danger-fg)' }}>
              {s.dlgError}
            </div>
          )}

          {shape.fields.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--size-200) var(--size-160)' }}>
              {shape.fields.map((f) => (
                <FieldBox key={f.key} f={f} s={s} />
              ))}
            </div>
          )}

          {shape.repeat && <RepeatBlock s={s} />}
          {shape.fileZone && <FileZone s={s} label={shape.fileLabel!} />}
          {shape.tagZone && <TagZone s={s} />}
          {shape.list && <ListBlock rows={shape.listRows!} />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
          <span style={{ flex: 1, ...caption1, color: 'var(--text-secondary)' }} />
          <Button onClick={s.closeDlg}>Cancel</Button>
          {shape.saveLabel && <Button primary onClick={s.saveDlg}>{shape.saveLabel}</Button>}
        </div>
      </div>

      <ComboOverlay s={s} />
    </div>
  )
}

function FieldBox({ f, s }: { f: Field; s: VehiclesState }) {
  const val = (k: string) => (s.form[k] === undefined || s.form[k] === null ? '' : String(s.form[k]))
  const input: CSSProperties = {
    boxSizing: 'border-box',
    height: 'var(--control-height)',
    padding: '0 var(--size-120)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-medium)',
    background: 'var(--surface-card)',
    ...body1,
    fontFamily: f.mono ? 'var(--font-mono)' : undefined,
  }

  return (
    <div style={{ gridColumn: `span ${Math.min(f.span ?? 1, 2)}`, display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={LABEL}>{f.label}</span>

      {f.kind === 'text' && (
        <input data-field="" value={val(f.key)} onChange={(e) => s.setF(f.key, e.target.value)} placeholder={f.ph} style={input} />
      )}

      {f.kind === 'area' && (
        <textarea
          data-field=""
          value={val(f.key)}
          onChange={(e) => s.setF(f.key, e.target.value)}
          placeholder={f.ph}
          style={{ boxSizing: 'border-box', width: '100%', height: 72, resize: 'none', padding: 'var(--size-80) var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)', ...body1 }}
        />
      )}

      {f.kind === 'seg' && <Segmented options={f.options!} value={val(f.key)} onPick={(v) => s.setF(f.key, v)} />}

      {f.kind === 'combo' && <Combo f={f} s={s} />}
    </div>
  )
}

/**
 * A text field with a list under it. Focusing shows every option with the
 * current one ticked; typing filters, and offers to create what was typed.
 */
function Combo({ f, s }: { f: Field; s: VehiclesState }) {
  const typed = String(s.form[f.key] ?? '').trim()

  const anchor = (e: React.FocusEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
    const box = (e.target.parentElement as HTMLElement).getBoundingClientRect()
    s.setComboOpen(f.key)
    s.setComboRect({ left: box.left, top: box.bottom + 4, width: box.width })
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        data-combo=""
        style={{ boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)' }}
      >
        <input
          value={typed}
          onChange={(e) => { s.setF(f.key, e.target.value); s.setComboTyping(true); anchor(e) }}
          onFocus={(e) => { s.setComboTyping(false); anchor(e) }}
          onBlur={s.closeComboSoon}
          placeholder={f.ph}
          style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
        />
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={16} />
        </span>
      </div>
    </div>
  )
}

interface ComboOpt {
  label: string
  selected?: boolean
  create?: boolean
  pick: (e: React.MouseEvent) => void
}

/** The combo list floats above the dialog, anchored to whichever field opened it. */
function ComboOverlay({ s }: { s: VehiclesState }) {
  const key = s.comboOpen
  if (!key) return null
  const opts = comboOptions(s, key)
  if (!opts.length) return null
  const r = s.comboRect ?? { left: 0, top: 0, width: 280 }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', top: r.top, left: r.left, width: r.width,
        boxSizing: 'border-box', maxHeight: 220, overflow: 'auto',
        padding: 'var(--size-40)', background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)', zIndex: 90,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {opts.map((o) => (
        <ComboRow key={o.label} o={o} />
      ))}
    </div>
  )
}

function ComboRow({ o }: { o: ComboOpt }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={o.pick}
      style={{
        boxSizing: 'border-box', minHeight: 'var(--row-height)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: o.selected ? 'var(--blue-50)' : 'transparent',
        ...body1,
        fontWeight: o.selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: o.create ? 'var(--primary)' : o.selected ? 'var(--blue-700)' : 'var(--text-primary)',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>
        {o.selected && <Icon name="FnCheck" size={16} />}
      </span>
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.label}</span>
    </div>
  )
}

function comboOptions(s: VehiclesState, key: string): ComboOpt[] {
  if (key === 'pickerTags') {
    const vid = String(s.form.vid ?? '')
    const v = s.vehicles.find((x) => x.id === vid)
    const already = s.prio[vid] ?? []
    const tags = (s.form.tags as string[]) ?? []
    const q = String(s.form.tagQ ?? '').trim().toLowerCase()
    return s.das
      .filter((d) => !already.includes(d.id) && !tags.includes(d.id) && !!v && isEligible(s, d.id, vid))
      .filter((d) => !q || `${d.name} ${d.tid}`.toLowerCase().includes(q))
      .map((d) => ({
        label: `${d.name} · ${d.tid}`,
        pick: (e) => { e.stopPropagation(); s.setForm({ ...s.form, tags: tags.concat([d.id]), tagQ: '' }) },
      }))
  }

  const field = shapeOf(s).fields.find((f) => f.key === key)
  if (!field || field.kind !== 'combo') return []
  const options = field.options ?? []
  const typed = String(s.form[key] ?? '').trim()
  const exact = options.some((c) => c.toLowerCase() === typed.toLowerCase())

  // Focusing lists everything with the current pick floated to the top; typing
  // narrows instead, and can offer to create what was typed.
  const source = s.comboTyping
    ? options.filter((c) => !typed || c.toLowerCase().includes(typed.toLowerCase()))
    : options.slice().sort((x, y) =>
        (y.toLowerCase() === typed.toLowerCase() ? 1 : 0) - (x.toLowerCase() === typed.toLowerCase() ? 1 : 0),
      )

  const rows: ComboOpt[] = source.map((c) => ({
    label: c,
    selected: !s.comboTyping && !!typed && c.toLowerCase() === typed.toLowerCase(),
    pick: (e) => { e.stopPropagation(); s.setF(key, c); s.setComboOpen(null) },
  }))

  if (field.addNew && s.comboTyping && typed && !exact) {
    rows.push({
      label: `Add "${typed}"`,
      create: true,
      pick: (e) => { e.stopPropagation(); field.addNew!(typed); s.setComboOpen(null) },
    })
  }
  return rows
}

function isEligible(s: VehiclesState, daId: string, vid: string): boolean {
  const v = s.vehicles.find((x) => x.id === vid)
  if (!v) return false
  const da = s.das.find((d) => d.id === daId)
  if (!da || !da.active) return false
  if (!da.types.includes(v.type)) return false
  const t = s.types.find((x) => x.name === v.type)
  if (t?.dot && !da.dot) return false
  return true
}

/** How often a reminder comes back - by date or by miles. */
function RepeatBlock({ s }: { s: VehiclesState }) {
  const f = s.form
  const on = !!f.repeatOn
  const basis = String(f.basis ?? 'Date')
  const freq = String(f.freq ?? 'Weekly')
  const seg = (opts: string[], value: string, onPick: (v: string) => void) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)' }}>
      {opts.map((o) => {
        const sel = value === o
        return (
          <div
            key={o}
            role="button"
            tabIndex={0}
            onClick={() => onPick(o)}
            style={{
              boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center',
              padding: '0 var(--size-100)', borderRadius: 'var(--radius-medium)',
              background: sel ? 'var(--blue-50)' : 'var(--surface-card)',
              border: `1px solid ${sel ? 'var(--blue-200)' : 'var(--border-default)'}`,
              color: sel ? 'var(--blue-700)' : 'var(--text-primary)',
              ...caption1, fontWeight: sel ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {o}
          </div>
        )
      })}
    </div>
  )

  const numField = (width: number, unit: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
      <input
        value={String(f.repN ?? '')}
        onChange={(e) => s.setF('repN', e.target.value.replace(/[^0-9,]/g, ''))}
        style={{ boxSizing: 'border-box', width, height: 28, textAlign: 'center', padding: '0 var(--size-40)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)', ...body1, fontVariantNumeric: 'tabular-nums' }}
      />
      <span style={{ ...body1, color: 'var(--text-secondary)' }}>{unit}</span>
    </div>
  )

  const showEvery = (basis === 'Date' && (freq === 'Weekly' || freq === 'Monthly')) || basis === 'Mileage'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)', overflow: 'hidden' }}>
      <RepeatRow label="Repeat">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div
            role="switch"
            aria-checked={on}
            tabIndex={0}
            onClick={() => s.setF('repeatOn', !on)}
            style={{ boxSizing: 'border-box', position: 'relative', width: 36, height: 20, flexShrink: 0, borderRadius: 'var(--radius-pill)', background: on ? 'var(--primary)' : 'var(--neutral-400)', cursor: 'pointer', transition: 'background 120ms' }}
          >
            <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--surface-card)', transition: 'left 120ms' }} />
          </div>
        </div>
      </RepeatRow>

      {on && (
        <>
          <RepeatRow label="According to" bordered>
            {seg(['Date', 'Mileage'], basis, (v) => s.setF('basis', v))}
          </RepeatRow>
          {basis === 'Date' && (
            <RepeatRow label="Repetition" bordered>
              {seg(['Daily', 'Weekly', 'Monthly'], freq, (v) => s.setF('freq', v))}
            </RepeatRow>
          )}
          {showEvery && (
            <RepeatRow label="Every" bordered>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
                {basis === 'Date' && freq === 'Weekly' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)' }}>
                    {WEEKDAYS.map((d) => {
                      const picked = !!(f.days as Record<string, boolean> | undefined)?.[d]
                      return (
                        <div
                          key={d}
                          role="button"
                          tabIndex={0}
                          title={d}
                          onClick={() => s.setF('days', { ...(f.days as Record<string, boolean> ?? {}), [d]: !picked })}
                          style={{
                            boxSizing: 'border-box', width: 28, height: 28,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                            background: picked ? 'var(--primary)' : 'var(--surface-card)',
                            border: `1px solid ${picked ? 'var(--primary)' : 'var(--border-default)'}`,
                            color: picked ? 'var(--text-inverse)' : 'var(--text-secondary)',
                            ...caption1, fontWeight: picked ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                            cursor: 'pointer',
                          }}
                        >
                          {d[0]}
                        </div>
                      )
                    })}
                  </div>
                )}
                {basis === 'Date' && freq === 'Monthly' && numField(64, 'months')}
                {basis === 'Mileage' && numField(80, 'miles')}
              </div>
            </RepeatRow>
          )}
        </>
      )}
    </div>
  )
}

function RepeatRow({ label, bordered, children }: { label: string; bordered?: boolean; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', minHeight: 44, padding: 'var(--size-60) var(--size-120)', borderTop: bordered ? '1px solid var(--border-subtle)' : undefined }}>
      <span style={LABEL}>{label}</span>
      {children}
    </div>
  )
}

function FileZone({ s, label }: { s: VehiclesState; label: string }) {
  const files = (s.form.files as { name: string; type: string; when: string }[]) ?? []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
      <span style={LABEL}>{label}</span>
      <label
        style={{ boxSizing: 'border-box', minHeight: 88, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--size-40)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)', cursor: 'pointer' }}
      >
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="FnUpload" size={16} />
        </span>
        <span style={body1Strong}>Drop PDF, JPG or PNG here, or browse</span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={(e) => {
            const now = new Date()
            const items = Array.from(e.target.files ?? []).map((x) => ({
              name: x.name,
              type: (x.name.split('.').pop() ?? '').toUpperCase(),
              when: `${fmt(TODAY).replace(', 2026', '')}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            }))
            if (items.length) s.setF('files', files.concat(items))
          }}
          style={{ display: 'none' }}
        />
      </label>

      {files.length > 0 && (
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px 40px', padding: 'var(--size-60) var(--size-120)', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)' }}>
            <span style={LABEL}>File</span>
            <span style={LABEL}>Type</span>
            <span style={LABEL}>Added</span>
            <span />
          </div>
          {files.map((fl, i) => (
            <div key={`${fl.name}-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px 40px', alignItems: 'center', minHeight: 40, padding: 'var(--size-40) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 'var(--size-80)' }}>{fl.name}</span>
              <span><Pill>{fl.type}</Pill></span>
              <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fl.when}</span>
              <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton name="FnDismiss" box={24} onClick={(e) => { e.stopPropagation(); s.setF('files', files.filter((_, j) => j !== i)) }} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TagZone({ s }: { s: VehiclesState }) {
  const tags = (s.form.tags as string[]) ?? []
  const vid = String(s.form.vid ?? '')
  const already = s.prio[vid] ?? []
  const eligibleCount = s.das.filter((d) => !already.includes(d.id) && !tags.includes(d.id) && isEligible(s, d.id, vid)).length

  const anchor = (e: React.FocusEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
    const box = (e.target.parentElement as HTMLElement).getBoundingClientRect()
    s.setComboOpen('pickerTags')
    s.setComboRect({ left: box.left, top: box.bottom + 4, width: box.width })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={LABEL}>DAs</span>
      <div
        data-combo=""
        style={{ boxSizing: 'border-box', minHeight: 40, display: 'flex', alignItems: 'center', gap: 'var(--size-40)', flexWrap: 'wrap', padding: 'var(--size-40) var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)' }}
      >
        {tags.map((id) => {
          const d = s.das.find((x) => x.id === id)
          return (
            <Tag
              key={id}
              label={d ? d.name : '-'}
              onRemove={(e) => { e.stopPropagation(); s.setForm({ ...s.form, tags: tags.filter((x) => x !== id) }) }}
            />
          )
        })}
        <input
          value={String(s.form.tagQ ?? '')}
          onChange={(e) => { s.setForm({ ...s.form, tagQ: e.target.value }); anchor(e) }}
          onFocus={anchor}
          onBlur={s.closeComboSoon}
          placeholder={eligibleCount ? 'Add a DA' : 'Everyone eligible is ranked'}
          style={{ flex: 1, minWidth: 140, height: 24, border: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
        />
      </div>
    </div>
  )
}

interface ListRow {
  label: string
  meta: string
  bold?: boolean
  bg?: string
}

function ListBlock({ rows }: { rows: ListRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
      {rows.map((l) => (
        <div
          key={l.label}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', minHeight: 44, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)', background: l.bg ?? 'transparent' }}
        >
          <span style={{ flex: 1, ...body1, fontWeight: l.bold ? 'var(--weight-semibold)' : 'var(--weight-regular)' }}>
            {l.label}
          </span>
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{l.meta}</span>
        </div>
      ))}
    </div>
  )
}

interface Shape {
  title: string
  note?: string
  fields: Field[]
  saveLabel: string
  width: string
  fileZone?: boolean
  fileLabel?: string
  repeat?: boolean
  tagZone?: boolean
  list?: boolean
  listRows?: ListRow[]
}

/** Which shape the dialog is wearing, from the kind that opened it. */
function shapeOf(s: VehiclesState): Shape {
  const f: Form = s.form
  const name = (id: unknown) => s.vehicles.find((x) => x.id === id)?.name ?? ''
  const ids = (f.ids as string[]) ?? [f.vid as string]
  const many = ids.length > 1

  switch (s.dlg) {
    case 'vehicle': {
      const fields = [
        T('name', 'Vehicle name/ID', { ph: 'Van 118' }),
        T('vin', 'VIN', { ph: '17 characters', mono: true }),
        SEG('type', 'Type', s.types.map((t) => t.name), 2),
        T('ext', 'External / lessor ID', { ph: 'U-40213', mono: true }),
        T('plate', 'Plate'),
        T('plateState', 'Plate state', { ph: 'CA' }),
        T('year', 'Year'),
        T('make', 'Make'),
        T('model', 'Model'),
        SEG('own', 'Ownership', ['Owned', 'Rented'], f.id ? 2 : 1),
      ]
      // A new vehicle can start with a reading; an existing one already has one.
      if (!f.id) fields.push(T('odoInit', 'Initial odometer', { ph: 'mi' }))
      return { title: f.id ? 'Edit Vehicle' : 'Add Vehicle', fields, saveLabel: 'Save', width: '672px' }
    }

    case 'status': {
      const cur = s.vehicles.find((x) => x.id === f.vid)
      // Moving to the status it already has is not a move, so it is not offered.
      const targets = STATUSES.filter((x) => many || x !== cur?.status)
      const fields: Field[] = [SEG('to', 'New status', targets, 2), AREA('reason', 'Reason', 2)]
      if (f.to === 'In shop') {
        fields.push(T('back', 'Expected back', { ph: 'Aug 8' }))
        fields.push(COMBO('vendor', 'Vendor', s.vendorList, "Bob's Auto", 1, (t) => s.addCustom('vendor', t)))
      }
      return {
        title: 'Change Status',
        note: many ? `Applies to ${ids.length} vehicles` : `${name(f.vid)} · ${cur?.status ?? ''}`,
        fields, saveLabel: 'Save', width: '672px',
      }
    }

    case 'service': {
      const fields: Field[] = []
      if (!f.vid) {
        fields.push(SEG('vehName', 'Vehicle', s.vehicles.filter((x) => x.status !== 'Off fleet').map((x) => x.name), 2))
      }
      fields.push(
        COMBO('cat', 'Category', s.svcCats, 'Pick or type a new one', 1, (t) => s.setF('cat', t)),
        COMBO('vendor', 'Vendor', s.vendorList, "Bob's Auto", 1, (t) => s.addCustom('vendor', t)),
        T('desc', 'Description', { span: 2 }),
        T('odoAt', 'Odometer at service', { ph: 'mi' }),
        T('cost', 'Cost', { ph: '$' }),
        SEG('payer', 'Paid by', PAYER_OPTS, 2),
      )
      return {
        title: 'Add Service Record',
        note: f.vid ? name(f.vid) : undefined,
        fields, saveLabel: 'Save', width: '672px', fileZone: true, fileLabel: 'Invoice / documents',
      }
    }

    case 'incident':
      return {
        title: 'Log Incident', note: name(f.vid),
        fields: [
          AREA('what', 'What happened', 2),
          SEG('liability', 'Liability', ['Ours', 'Third party', 'Unknown'], 1),
          T('claim', 'Claim / FIF ref', { ph: 'CLM-88213', mono: true }),
        ],
        saveLabel: 'Log incident', width: '672px', fileZone: true, fileLabel: 'Supporting documents',
      }

    case 'reminder': {
      const dueType = String(f.dueType ?? 'Date')
      const fields: Field[] = [
        COMBO('name', 'Name', s.reminderNames, 'Oil change', 2, (t) => { s.setCustomReminders((c) => c.concat([t])); s.setF('name', t) }),
        SEG('dueType', 'Due', ['Date', 'Mileage'], 1),
      ]
      fields.push(dueType === 'Mileage' ? T('dueMi', 'Due mileage', { ph: '85,000' }) : T('dueDate', 'Due date', { ph: 'Aug 15' }))
      return {
        title: 'Add Reminder',
        note: many ? `Applies to ${ids.length} vehicles` : name(f.vid),
        fields, saveLabel: 'Save', width: '672px', repeat: true,
      }
    }

    case 'renewal':
      return {
        title: 'Add Renewal',
        note: many ? `Applies to ${ids.length} vehicles` : name(f.vid),
        fields: [
          COMBO('type', 'Type', s.renTypes, 'Registration', 2, (t) => { s.setRenTypes((r) => r.concat([t])); s.setF('type', t) }),
          T('name', 'Name / ID', { ph: 'CA' }),
          T('exp', 'Expiration date', { ph: 'Aug 3, 2027' }),
          T('notice', 'Notice by', { ph: 'Jul 1, 2027' }),
          T('cost', 'Cost', { ph: '$' }),
          COMBO('authority', 'Issuing authority', s.vendorList.concat(s.vendorList.includes('CA DMV') ? [] : ['CA DMV']), 'CA DMV', 2, (t) => s.addCustom('authority', t)),
        ],
        saveLabel: 'Save', width: '672px',
      }

    case 'renew': {
      const src = s.renewals.find((n) => n.id === f.nid)
      return {
        title: 'Renew',
        note: src ? `${name(src.vid)} · ${src.type}${src.name ? ` · ${src.name}` : ''} · expires ${src.exp}` : '',
        fields: [
          T('exp', 'New expiration date', { ph: 'Aug 3, 2027' }),
          T('notice', 'Notice by'),
          T('cost', 'Cost', { ph: '$', span: 2 }),
        ],
        saveLabel: 'Renew', width: '672px',
      }
    }

    case 'reading':
      return {
        title: 'Add Odometer Reading', note: name(f.vid),
        fields: [
          T('reading', 'Reading', { ph: 'mi', span: 2 }),
          T('date', 'Date', { ph: 'Jul 29, 2026' }),
          T('time', 'Time', { ph: '10:20' }),
          T('reason', 'Reason', { ph: 'Post repair', span: 2 }),
        ],
        saveLabel: 'Save', width: '672px',
      }

    case 'photos':
      return {
        title: 'Upload Photo Set', note: name(f.vid),
        fields: [
          COMBO('setType', 'Set type', SET_TYPES, 'Pre-trip', 1),
          T('reason', 'Reason', { ph: 'Post repair' }),
          T('note', 'Note', { span: 2 }),
        ],
        saveLabel: 'Save', width: '672px', fileZone: true, fileLabel: 'Photos',
      }

    case 'picker':
      return {
        title: 'Add DAs', note: name(f.vid),
        fields: [], saveLabel: 'Add selected', width: '672px', tagZone: true,
      }

    case 'types':
      return {
        title: 'Manage Vehicle Types', fields: [], saveLabel: '', width: '560px', list: true,
        listRows: s.types.map((t) => ({
          label: t.name + (t.dot ? ' · DOT' : ''),
          meta: `${t.suits}  ·  ${t.use}`,
          bold: true,
        })),
      }

    case 'import':
      return {
        title: 'Import Vehicles', note: 'CSV or XLSX. VIN is the match key.',
        fields: [], saveLabel: 'Run import', width: '672px', list: true,
        listRows: [
          { label: 'fleet-roster-2026.csv', meta: '9 rows · 6 create · 2 update · 1 error', bold: true },
          { label: 'Row 7 · Type "Cargo XL" is not in the registry', meta: 'skipped', bg: 'var(--danger-bg)' },
        ],
      }

    default:
      return { title: '', fields: [], saveLabel: 'Save', width: '672px' }
  }
}
