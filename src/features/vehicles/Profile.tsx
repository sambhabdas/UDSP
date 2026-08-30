'use client'

import { body1, caption1, title3 } from '../../ds/type'
import { tone, typeOf } from './calc'
import { Button, IconButton, Menu, Pill, DotPill, Tabs } from './parts'
import { OverviewTab } from './tabs/OverviewTab'
import { ServiceTab } from './tabs/ServiceTab'
import { MaintTab } from './tabs/MaintTab'
import { PhotosTab } from './tabs/PhotosTab'
import { OdoTab } from './tabs/OdoTab'
import { PriorityTab } from './tabs/PriorityTab'
import type { VehiclesState } from './useVehicles'

const TABS: [string, string][] = [
  ['overview', 'Overview'],
  ['service', 'Service Records'],
  ['maint', 'Maintenance & Renewals'],
  ['photos', 'Photos'],
  ['odo', 'Odometer'],
  ['priority', 'Priority'],
]

/**
 * One vehicle, in six tabs. The header is the same whichever is open, so the
 * status and the identity never leave the screen while you work.
 */
export function Profile({ s }: { s: VehiclesState }) {
  const v = s.pv
  const t = tone(v.status)
  const meta = [
    v.type,
    [v.year, v.make, v.model].filter(Boolean).join(' '),
    v.vin,
    v.plate ? `${v.plate} · ${v.plateState}` : 'No plate',
  ]
    .filter(Boolean)
    .join('  ·  ')

  const menuItems = [
    { label: 'Add service record', run: () => { s.setPMenuOpen(false); s.openDlg('service', { vid: v.id, payer: 'Out of pocket', cat: 'Repair' }) } },
    { label: 'Add odometer reading', run: () => { s.setPMenuOpen(false); s.openDlg('reading', { vid: v.id }) } },
    { label: 'Upload photo set', run: () => { s.setPMenuOpen(false); s.openDlg('photos', { vid: v.id, setType: 'Pre-trip' }) } },
    { label: 'Add reminder', run: () => { s.setPMenuOpen(false); s.openDlg('reminder', { vid: v.id, dueType: 'Date' }) } },
    { label: 'Add renewal', run: () => { s.setPMenuOpen(false); s.openDlg('renewal', { vid: v.id }) } },
  ]

  return (
    <>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); s.setView('dir') }}
          style={{ alignSelf: 'flex-start', ...body1, color: 'var(--text-secondary)' }}
        >
          ← Vehicles
        </a>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', padding: 'var(--size-160) var(--size-200)' }}>
            <div
              style={{
                width: 64, height: 64, flexShrink: 0,
                borderRadius: 'var(--radius-medium)',
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...caption1, fontWeight: 'var(--weight-semibold)', color: 'var(--text-disabled)',
              }}
            >
              {v.name.replace('Van ', 'V')}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
                <span style={title3}>{v.name}</span>
                <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>{v.status}</DotPill>
                {/* A DOT type can only be driven by a DOT-carded DA. */}
                {typeOf(v, s.types).dot && <Pill>DOT</Pill>}
              </div>
              <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {meta}
              </span>
            </div>

            <Button icon="FnSwap" onClick={() => s.openDlg('status', { vid: v.id, from: v.status })}>
              Change status
            </Button>

            <span style={{ position: 'relative', display: 'flex' }}>
              <IconButton
                name="FnMore"
                size={20}
                box={32}
                bordered
                title="More"
                onClick={(e) => { e.stopPropagation(); s.setPMenuOpen(!s.pMenuOpen) }}
              />
              {s.pMenuOpen && <Menu items={menuItems} top={36} />}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-240)',
              padding: 'var(--size-40) var(--size-200) 0 var(--size-200)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Tabs items={TABS} current={s.profileTab} onPick={(id) => s.setProfileTab(id as typeof s.profileTab)} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
        {s.profileTab === 'overview' && <OverviewTab s={s} />}
        {s.profileTab === 'service' && <ServiceTab s={s} />}
        {s.profileTab === 'maint' && <MaintTab s={s} />}
        {s.profileTab === 'photos' && <PhotosTab s={s} />}
        {s.profileTab === 'odo' && <OdoTab s={s} />}
        {s.profileTab === 'priority' && <PriorityTab s={s} />}
      </div>
    </>
  )
}
