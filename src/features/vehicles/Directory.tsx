'use client'

import { body1, body1Strong, caption1 } from '../../ds/type'
import { money } from '../../ds/format'
import { latestOdo, prioSummary, tone } from './calc'
import type { Vehicle } from './data'
import { Button, Cell, Checkbox, DotPill, EmptyState, IconButton, Menu, Pill, Row, SearchBox, SectionTitle, SortHead } from './parts'
import { CARD } from './style'
import type { HeadDef } from './parts'
import type { VehiclesState } from './useVehicles'
import { int } from '../../ds/format'

const COLS = '36px 130px 150px 210px 150px 190px 1fr 1.2fr 150px 40px'

/** Only five of the eight columns carry a sort; the rest are just facts. */
const HEAD: HeadDef[] = [
  { label: 'Vehicle', k: 'name' },
  { label: 'Type', k: 'type' },
  { label: 'VIN' },
  { label: 'Plate' },
  { label: 'Status', k: 'status' },
  { label: 'Latest odometer', k: 'odo' },
  { label: 'Service type' },
  { label: 'Priority', k: 'prio' },
]

/**
 * The vehicle directory — one row per van, whatever its status. An off-fleet
 * van stays on the list, stepped back, because its history still matters.
 */
export function Directory({ s }: { s: VehiclesState }) {
  return (
    <div style={{ flex: 1, minHeight: 0, ...CARD }}>
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--size-80)',
          padding: 'var(--size-160)',
        }}
      >
        <SectionTitle>Vehicles</SectionTitle>
        <div style={{ flex: 1 }} />
        <SearchBox value={s.dirSearch} onChange={s.setDirSearch} placeholder="Search vehicle, VIN or plate" />
        <Button primary onClick={() => s.openDlg('vehicle', { own: 'Owned', type: '' })}>+ Add vehicle</Button>
        <Button icon="FnUpload" onClick={() => s.openDlg('import', {})}>Import</Button>
        <Button icon="SvExport" onClick={() => s.toastMsg(`Exported ${s.dirList.length} vehicles`)}>Export</Button>
      </div>

      {s.selIds.length > 0 && <BulkBar s={s} />}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ minWidth: 1180 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <SortHead
              defs={[{ label: '' }, ...HEAD, { label: '' }]}
              sort={s.sort}
              onSort={s.setSort}
              cols={COLS}
            />
          </div>

          {s.dirList.length === 0 ? (
            <EmptyState message="No vehicles match" action="Clear search" onAction={() => s.setDirSearch('')} />
          ) : (
            s.dirList.map((v) => <VehicleRow key={v.id} v={v} s={s} />)
          )}
        </div>
      </div>
    </div>
  )
}

/** Appears the moment anything is checked, and acts on the whole selection. */
function BulkBar({ s }: { s: VehiclesState }) {
  const ids = s.selIds
  const actions: [string, () => void][] = [
    ['Add reminder', () => s.openDlg('reminder', { vid: ids[0], ids, dueType: 'Date' })],
    ['Add renewal', () => s.openDlg('renewal', { vid: ids[0], ids })],
    ['Change status', () => s.openDlg('status', { vid: ids[0], ids })],
    ['Export selected', () => s.toastMsg(`Exported ${ids.length}${ids.length === 1 ? ' vehicle' : ' vehicles'}`)],
  ]
  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        padding: 'var(--size-80) var(--size-160)',
        background: 'var(--blue-50)',
        borderTop: '1px solid var(--blue-200)',
        borderBottom: '1px solid var(--blue-200)',
      }}
    >
      <span style={body1Strong}>{ids.length} selected</span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          const next: Record<string, boolean> = {}
          s.dirList.forEach((x) => { next[x.id] = true })
          s.setSel(next)
        }}
        style={body1}
      >
        Select all
      </a>
      <div style={{ flex: 1 }} />
      {actions.map(([label, run]) => (
        <Button key={label} onClick={run}>{label}</Button>
      ))}
      <IconButton name="FnDismiss" title="Clear selection" onClick={() => s.setSel({})} />
    </div>
  )
}

function VehicleRow({ v, s }: { v: Vehicle; s: VehiclesState }) {
  const t = tone(v.status)
  const od = latestOdo(s.odo, v.id)
  const pr = prioSummary(v, s.prio, s.types)
  const checked = !!s.sel[v.id]
  const off = v.status === 'Off fleet'

  const menuItems = [
    { label: 'Open profile', run: (e: React.MouseEvent) => { e.stopPropagation(); s.openProfile(v.id) } },
    { label: 'Change status', run: (e: React.MouseEvent) => { e.stopPropagation(); s.openDlg('status', { vid: v.id, from: v.status }) } },
    { label: 'Edit vehicle', run: (e: React.MouseEvent) => { e.stopPropagation(); s.openDlg('vehicle', { id: v.id, name: v.name, type: v.type, vin: v.vin, ext: v.ext, plate: v.plate, plateState: v.plateState, year: v.year, make: v.make, model: v.model, own: v.own }) } },
    { label: 'Add service record', run: (e: React.MouseEvent) => { e.stopPropagation(); s.openDlg('service', { vid: v.id, payer: 'Out of pocket', cat: 'Repair' }) } },
    { label: 'Add odometer reading', run: (e: React.MouseEvent) => { e.stopPropagation(); s.openDlg('reading', { vid: v.id, date: 'Jul 29, 2026', time: '10:20' }) } },
    { label: 'Upload photo set', run: (e: React.MouseEvent) => { e.stopPropagation(); s.openDlg('photos', { vid: v.id, setType: 'Pre-trip' }) } },
    { label: 'Add reminder', run: (e: React.MouseEvent) => { e.stopPropagation(); s.openDlg('reminder', { vid: v.id, dueType: 'Date' }) } },
    { label: 'Add renewal', run: (e: React.MouseEvent) => { e.stopPropagation(); s.openDlg('renewal', { vid: v.id }) } },
  ]

  return (
    <Row
      cols={COLS}
      bg={off ? 'var(--surface-subtle)' : checked ? 'var(--blue-50)' : 'transparent'}
      opacity={off ? 0.65 : 1}
    >
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          const next = { ...s.sel }
          if (next[v.id]) delete next[v.id]
          else next[v.id] = true
          s.setSel(next)
        }}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        <Checkbox on={checked} />
      </div>

      <a
        href="#"
        onClick={(e) => { e.preventDefault(); s.openProfile(v.id) }}
        style={{ ...body1Strong, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
      >
        {v.name}
      </a>
      <Cell>{v.type}</Cell>
      <Cell mono color="var(--text-secondary)" ellipsis>{v.vin}</Cell>

      {/* A van with no plate cannot legally run, so the gap is called out. */}
      {v.plate ? (
        <Cell>{`${v.plate} · ${v.plateState}`}</Cell>
      ) : off ? (
        <Cell />
      ) : (
        <span><Pill bg="var(--warning-bg)" fg="var(--warning-fg)" border={null}>No plate</Pill></span>
      )}

      <div style={{ display: 'flex', minWidth: 0 }}>
        <DotPill
          bg={t.bg}
          fg={t.fg}
          dot={t.dot}
          alignSelf="flex-start"
          onClick={(e) => { e.stopPropagation(); s.openDlg('status', { vid: v.id, from: v.status }) }}
        >
          {v.status}
        </DotPill>
      </div>

      <Cell nums>{od ? `${int(od.reading)} mi` : 'Never read'}</Cell>
      <Cell color="var(--text-secondary)" ellipsis>{v.svcTypes.length ? v.svcTypes.join(' · ') : '-'}</Cell>
      <Cell color={pr.color}>{pr.txt}</Cell>

      <span style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton
          name="FnMore"
          size={20}
          onClick={(e) => { e.stopPropagation(); s.setOpenMenu(s.openMenu === v.id ? null : v.id) }}
        />
        {s.openMenu === v.id && <Menu items={menuItems} />}
      </span>
    </Row>
  )
}

/** The three totals above the service table, shared by both places it appears. */
export function SvcTotals({ s }: { s: VehiclesState }) {
  const { total, oop, re } = s.svcTotals
  const rows: [string, string, string][] = [
    ['Total', money(total), 'var(--text-primary)'],
    ['Out of pocket', money(oop), 'var(--danger-fg)'],
    ['Reimbursed', money(re), 'var(--success-fg)'],
  ]
  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-240)',
        padding: 'var(--size-100) var(--size-160)',
        background: 'var(--surface-card)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {rows.map(([label, value, color]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-80)' }}>
          <span style={{ ...caption1, fontWeight: 'var(--weight-semibold)', letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {label}
          </span>
          <span style={{ ...body1Strong, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

/** The payer filter, on both the ledger and the profile's service tab. */
export function PayerChips({ s }: { s: VehiclesState }) {
  return (
    <>
      {['All', 'Out of pocket', 'Amazon', 'FIF', 'Insurance', 'Warranty'].map((p) => {
        const on = s.payer === p
        return (
          <div
            key={p}
            role="button"
            tabIndex={0}
            onClick={() => s.setPayer(p)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 'var(--control-height)',
              padding: '0 var(--size-120)',
              borderRadius: 'var(--radius-medium)',
              background: on ? 'var(--blue-100)' : 'var(--surface-card)',
              border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
              color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
              ...caption1,
              fontWeight: 'var(--weight-semibold)',
              cursor: 'pointer',
            }}
          >
            {p}
          </div>
        )
      })}
    </>
  )
}
