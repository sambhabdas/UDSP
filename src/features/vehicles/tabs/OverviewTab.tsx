'use client'

import { body1, body1Strong, caption1 } from '../../../ds/type'
import { days, latestOdo, renewalStatus, short } from '../calc'
import { PHOTO_SLOTS, SVC_CATALOG } from '../data'
import { Button, Cell, DotPill, MenuItem, Row, SectionTitle, Segmented, SortHead, Tag } from '../parts'
import { CARD, LABEL } from '../style'
import type { HeadDef } from '../parts'
import type { VehiclesState } from '../useVehicles'
import { int } from '../../../ds/format'

const SH_HEAD: HeadDef[] = [
  { label: 'Date', k: 'date' },
  { label: 'From → To', k: 'move' },
  { label: 'Reason', k: 'reason' },
  { label: 'By', k: 'by', justify: 'flex-end' },
]
const RC_HEAD: HeadDef[] = [
  { label: 'Date', k: 'date' },
  { label: 'Who', k: 'who' },
  { label: 'What changed', k: 'what' },
  { label: 'Source', k: 'source', justify: 'flex-end' },
]
const SH_COLS = '110px 1.1fr 1.6fr 110px'
const RC_COLS = '110px 110px 1.7fr 1fr'

/** Everything about a vehicle that is not a list of its own. */
export function OverviewTab({ s }: { s: VehiclesState }) {
  return (
    <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--size-200)', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
        <BasicInfo s={s} />
        <OpenIncidents s={s} />
        <StatusHistory s={s} />
        <RecordChanges s={s} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
        <LatestOdo s={s} />
        <LatestPhotos s={s} />
        <Upcoming s={s} />
      </div>
    </div>
  )
}

function BasicInfo({ s }: { s: VehiclesState }) {
  const v = s.pv
  const f = s.form
  const val = (k: string) => (f[k] === undefined || f[k] === null ? '' : String(f[k]))

  // Editing swaps the read-only facts for the same fields as inputs; the
  // in-service date is never one of them, because it is history.
  const fields: { label: string; node: React.ReactNode }[] = s.infoEdit
    ? [
        { label: 'Vehicle name/ID', node: <TextField value={val('name')} onChange={(x) => s.setF('name', x)} /> },
        { label: 'Type', node: <Segmented options={s.types.map((t) => t.name)} value={val('type')} onPick={(x) => s.setF('type', x)} /> },
        { label: 'VIN', node: <TextField value={val('vin')} onChange={(x) => s.setF('vin', x)} mono /> },
        { label: 'External / lessor ID', node: <TextField value={val('ext')} onChange={(x) => s.setF('ext', x)} mono /> },
        { label: 'Plate', node: <TextField value={val('plate')} onChange={(x) => s.setF('plate', x)} /> },
        { label: 'Plate state', node: <TextField value={val('plateState')} onChange={(x) => s.setF('plateState', x)} /> },
        { label: 'Year', node: <TextField value={val('year')} onChange={(x) => s.setF('year', x)} /> },
        { label: 'Make', node: <TextField value={val('make')} onChange={(x) => s.setF('make', x)} /> },
        { label: 'Model', node: <TextField value={val('model')} onChange={(x) => s.setF('model', x)} /> },
        { label: 'Ownership', node: <Segmented options={['Owned', 'Rented']} value={val('own')} onPick={(x) => s.setF('own', x)} /> },
        { label: 'In-service date', node: <ReadOnly>{v.inService}</ReadOnly> },
      ]
    : [
        { label: 'Vehicle name/ID', node: <ReadOnly bold>{v.name}</ReadOnly> },
        { label: 'Type', node: <ReadOnly>{v.type}</ReadOnly> },
        { label: 'VIN', node: <ReadOnly mono>{v.vin}</ReadOnly> },
        { label: 'Plate · state', node: <ReadOnly>{v.plate ? `${v.plate} · ${v.plateState}` : '-'}</ReadOnly> },
        { label: 'Year', node: <ReadOnly>{String(v.year || '-')}</ReadOnly> },
        { label: 'Make · model', node: <ReadOnly>{`${v.make || '-'} · ${v.model || '-'}`}</ReadOnly> },
        { label: 'Ownership', node: <ReadOnly>{v.own}</ReadOnly> },
        { label: 'In-service date', node: <ReadOnly>{v.inService}</ReadOnly> },
        { label: 'External / lessor ID', node: <ReadOnly mono={!!v.ext}>{v.ext || '-'}</ReadOnly> },
      ]

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <SectionTitle>Basic Info</SectionTitle>
        <div style={{ flex: 1 }} />
        {s.infoEdit ? (
          <>
            <Button onClick={() => { s.setInfoEdit(false); s.setDlgError(''); s.setForm({}) }}>Cancel</Button>
            <Button primary onClick={s.saveVehicleInline}>Save</Button>
          </>
        ) : (
          <Button
            icon="FnEdit"
            onClick={() => {
              s.setInfoEdit(true)
              s.setDlgError('')
              s.setForm({ id: v.id, name: v.name, type: v.type, vin: v.vin, ext: v.ext, plate: v.plate, plateState: v.plateState, year: v.year, make: v.make, model: v.model, own: v.own })
            }}
          >
            Edit
          </Button>
        )}
      </div>

      {s.infoEdit && s.dlgError && (
        <div style={{ padding: 'var(--size-100) var(--size-120)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-medium)', ...body1, color: 'var(--danger-fg)' }}>
          {s.dlgError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {fields.map((f2) => (
          <FieldRow key={f2.label} label={f2.label}>{f2.node}</FieldRow>
        ))}
      </div>

      <ServiceTypeTags s={s} />
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', minHeight: 44, padding: 'var(--size-60) 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={LABEL}>{label}</span>
      {children}
    </div>
  )
}

function ReadOnly({ children, mono, bold }: { children: React.ReactNode; mono?: boolean; bold?: boolean }) {
  return (
    <span style={{ ...body1, fontWeight: bold ? 'var(--weight-semibold)' : undefined, fontFamily: mono ? 'var(--font-mono)' : undefined }}>
      {children}
    </span>
  )
}

function TextField({ value, onChange, mono }: { value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <input
      data-field=""
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        maxWidth: 340,
        padding: '0 var(--size-120)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        ...body1,
        fontFamily: mono ? 'var(--font-mono)' : undefined,
      }}
    />
  )
}

/** Which kinds of work this van is allowed to run. */
function ServiceTypeTags({ s }: { s: VehiclesState }) {
  const v = s.pv
  const tags = v.svcTypes
  const q = s.svcTypeQuery.trim().toLowerCase()
  const options = SVC_CATALOG.filter((c) => !tags.includes(c) && (!q || c.toLowerCase().includes(q)))
  const setTags = (next: string[]) =>
    s.setVehicles(s.vehicles.map((x) => (x.id === v.id ? { ...x, svcTypes: next } : x)))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', minHeight: 44, padding: 'var(--size-60) 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={LABEL}>Service Type</span>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--size-40)', flexWrap: 'wrap' }}>
        {tags.map((t) => (
          <Tag key={t} label={t} onRemove={(e) => { e.stopPropagation(); setTags(tags.filter((x) => x !== t)) }} />
        ))}
        <input
          value={s.svcTypeQuery}
          onChange={(e) => { s.setSvcTypeQuery(e.target.value); s.setSvcTypeOpen(true) }}
          onFocus={() => { if (options.length) s.setSvcTypeOpen(true) }}
          onBlur={() => setTimeout(() => { s.setSvcTypeOpen(false); s.setSvcTypeQuery('') }, 150)}
          onClick={(e) => e.stopPropagation()}
          placeholder={tags.length ? '' : 'Add a service type'}
          style={{ flex: 1, minWidth: 140, height: 24, border: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
        />
        {s.svcTypeOpen && options.length > 0 && (
          <div
            style={{
              position: 'absolute', top: 32, left: 0,
              boxSizing: 'border-box', width: 260, maxHeight: 220, overflow: 'auto',
              padding: 'var(--size-40)', background: 'var(--surface-raised)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
              boxShadow: 'var(--elevation-menu)', zIndex: 30,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {options.map((c) => (
              <MenuItem
                key={c}
                label={c}
                onMouseDown={(e) => { e.stopPropagation(); setTags(tags.concat([c])); s.setSvcTypeQuery('') }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OpenIncidents({ s }: { s: VehiclesState }) {
  const open = s.incidents.filter((i) => i.vid === s.pv.id && i.status === 'open')
  if (!open.length) return null
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => s.setProfileTab('service')}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        background: 'var(--warning-bg)', border: '1px solid var(--warning-border)',
        borderRadius: 'var(--radius-medium)', padding: 'var(--size-100) var(--size-160)', cursor: 'pointer',
      }}
    >
      <span style={{ ...body1Strong, color: 'var(--warning-fg)' }}>
        {open.length} open incident{open.length > 1 ? 's' : ''}
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ ...caption1, color: 'var(--warning-fg)' }}>→ Service Records</span>
    </div>
  )
}

function StatusHistory({ s }: { s: VehiclesState }) {
  const rows = s.statusHist
    .filter((h) => h.vid === s.pv.id)
    .map((h) => ({ ...h, move: `${h.from} → ${h.to}`, _d: new Date(h.date).getTime() || 0 }))
  const key = s.shSort.k
  const mul = s.shSort.d === 'asc' ? 1 : -1
  rows.sort((a, b) => {
    const va = key === 'date' ? a._d : (a as unknown as Record<string, string>)[key]
    const vb = key === 'date' ? b._d : (b as unknown as Record<string, string>)[key]
    return (va > vb ? 1 : va < vb ? -1 : 0) * mul
  })

  return (
    <div style={CARD}>
      <span style={{ padding: 'var(--size-160)', fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>
        Status History
      </span>
      <SortHead topBorder defs={SH_HEAD} sort={s.shSort} onSort={s.setShSort} cols={SH_COLS} />
      {rows.map((h, i) => (
        <Row key={`${h.date}-${i}`} cols={SH_COLS} minHeight={44}>
          <Cell>{short(h.date)}</Cell>
          <Cell>{h.move}</Cell>
          <Cell color="var(--text-secondary)" ellipsis>{h.reason}</Cell>
          <span style={{ textAlign: 'right', ...caption1, color: 'var(--text-secondary)' }}>{h.by}</span>
        </Row>
      ))}
    </div>
  )
}

function RecordChanges({ s }: { s: VehiclesState }) {
  const rows = s.recChanges
    .filter((c) => c.vid === s.pv.id)
    .map((c) => ({ ...c, _d: new Date(c.date).getTime() || 0 }))
  const key = s.rcSort.k
  const mul = s.rcSort.d === 'asc' ? 1 : -1
  rows.sort((a, b) => {
    const va = key === 'date' ? a._d : (a as unknown as Record<string, string>)[key]
    const vb = key === 'date' ? b._d : (b as unknown as Record<string, string>)[key]
    return (va > vb ? 1 : va < vb ? -1 : 0) * mul
  })

  return (
    <div style={CARD}>
      <span style={{ padding: 'var(--size-160)', fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>
        Record Changes
      </span>
      <SortHead topBorder defs={RC_HEAD} sort={s.rcSort} onSort={s.setRcSort} cols={RC_COLS} />
      {rows.map((c, i) => (
        <Row key={`${c.date}-${i}`} cols={RC_COLS} minHeight={44}>
          <Cell>{short(c.date)}</Cell>
          <Cell>{c.who}</Cell>
          <Cell color="var(--text-secondary)" ellipsis>{c.what}</Cell>
          <span style={{ textAlign: 'right', ...caption1, color: 'var(--text-secondary)' }}>{c.source}</span>
        </Row>
      ))}
    </div>
  )
}

function SideCard({ title, link, onLink, children, gap }: {
  title: string
  link: string
  onLink: () => void
  children: React.ReactNode
  gap?: string
}) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)', display: 'flex', flexDirection: 'column', gap: gap ?? 'var(--size-60)' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SectionTitle>{title}</SectionTitle>
        <div style={{ flex: 1 }} />
        <a href="#" onClick={(e) => { e.preventDefault(); onLink() }} style={caption1}>{link}</a>
      </div>
      {children}
    </div>
  )
}

function LatestOdo({ s }: { s: VehiclesState }) {
  const od = latestOdo(s.odo, s.pv.id)
  return (
    <SideCard title="Latest Odometer" link="Odometer" onLink={() => s.setProfileTab('odo')}>
      <span style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'var(--weight-semibold)', color: 'var(--success-fg)', fontVariantNumeric: 'tabular-nums' }}>
        {od ? `${int(od.reading)} mi` : 'Never read'}
      </span>
      <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{od ? `${od.date} · ${od.by}` : '-'}</span>
    </SideCard>
  )
}

function LatestPhotos({ s }: { s: VehiclesState }) {
  const p = s.photos.find((x) => x.vid === s.pv.id)
  const slots = (p ? p.filled : PHOTO_SLOTS).slice(0, 5)
  return (
    <SideCard title="Latest Photo Set" link="Photos" onLink={() => s.setProfileTab('photos')} gap="var(--size-100)">
      <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{p ? `${p.date} · ${p.type}` : 'No photo set'}</span>
      <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
        {slots.map((sl) => (
          <div
            key={sl}
            style={{
              flex: 1, aspectRatio: '4/3', borderRadius: 'var(--radius-small)',
              background: 'var(--surface-subtle)', border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...caption1, color: 'var(--text-secondary)',
            }}
          >
            {sl.charAt(0).toUpperCase() + sl.slice(1)}
          </div>
        ))}
      </div>
    </SideCard>
  )
}

/** The three most pressing things due, reminders and renewals together. */
function Upcoming({ s }: { s: VehiclesState }) {
  const v = s.pv
  const latest = latestOdo(s.odo, v.id)

  const fromReminders = s.reminders.filter((r) => r.vid === v.id && !r.done).map((r) => {
    if (r.dueType === 'Mileage') {
      const away = latest ? r.dueMi! - latest.reading : null
      return {
        kind: 'Reminder', kBg: 'var(--blue-100)', kFg: 'var(--blue-700)', kDot: 'var(--blue-500)',
        name: r.name, dueDate: `${int(r.dueMi!)} mi`,
        due: away === null ? 'Needs a reading' : away <= 0 ? 'Overdue' : `${int(away)} mi away`,
        color: away === null ? 'var(--warning-fg)' : away <= 0 ? 'var(--danger-fg)' : away <= 500 ? 'var(--warning-fg)' : 'var(--text-primary)',
        // A mileage reminder with no reading sorts behind everything dated.
        k: away === null ? 3 : away <= 0 ? 0 : away / 1000,
      }
    }
    const dd = days(r.dd!)
    return {
      kind: 'Reminder', kBg: 'var(--blue-100)', kFg: 'var(--blue-700)', kDot: 'var(--blue-500)',
      name: r.name, dueDate: short(r.dueDate!), due: dd < 0 ? 'Overdue' : `in ${dd} d`,
      color: dd < 0 || dd <= 7 ? 'var(--danger-fg)' : dd <= 30 ? 'var(--warning-fg)' : 'var(--text-primary)',
      k: dd,
    }
  })

  const fromRenewals = s.renewals.filter((n) => n.vid === v.id).map((n) => {
    const st = renewalStatus(n)
    return {
      kind: 'Renewal', kBg: 'var(--surface-subtle)', kFg: 'var(--text-secondary)', kDot: 'var(--neutral-400)',
      name: n.type + (n.name ? ` · ${n.name}` : ''), dueDate: short(n.exp),
      due: st.u === 'LAPSED' ? 'LAPSED' : `in ${st.dd} d`,
      color: st.u === 'LAPSED' || st.u === 'red' ? 'var(--danger-fg)' : st.u === 'amber' ? 'var(--warning-fg)' : 'var(--text-primary)',
      k: st.dd,
    }
  })

  const rows = [...fromReminders, ...fromRenewals].sort((a, b) => a.k - b.k).slice(0, 3)

  return (
    <SideCard title="Upcoming" link="Maintenance & Renewals" onLink={() => s.setProfileTab('maint')} gap="var(--size-100)">
      <div
        style={{
          display: 'grid', gridTemplateColumns: '100px 1fr 120px 90px',
          padding: 'var(--size-60) var(--size-160)',
          background: 'var(--surface-subtle)',
          borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)',
          margin: '0 calc(var(--size-160) * -1)',
        }}
      >
        <span style={LABEL}>Type</span>
        <span style={LABEL}>Item</span>
        <span style={{ ...LABEL, textAlign: 'right' }}>Due date</span>
        <span style={{ ...LABEL, textAlign: 'right' }}>Due</span>
      </div>
      {rows.length === 0 && <span style={{ ...body1, color: 'var(--text-secondary)' }}>Nothing due.</span>}
      {rows.map((u, i) => (
        <div
          key={`${u.name}-${i}`}
          style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 90px', alignItems: 'center', minHeight: 44, borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span><DotPill bg={u.kBg} fg={u.kFg} dot={u.kDot}>{u.kind}</DotPill></span>
          <span style={body1}>{u.name}</span>
          <span style={{ textAlign: 'right', ...body1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{u.dueDate}</span>
          <span style={{ textAlign: 'right', ...body1Strong, color: u.color, whiteSpace: 'nowrap' }}>{u.due}</span>
        </div>
      ))}
    </SideCard>
  )
}
