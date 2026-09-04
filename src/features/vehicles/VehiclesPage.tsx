'use client'

import { Button, SearchBox, SectionTitle, Tabs, Toast } from './parts'
import { CARD } from './style'
import { Directory, PayerChips, SvcTotals } from './Directory'
import { ServiceTable } from './ServiceTable'
import { Profile } from './Profile'
import { Dialog } from './Dialog'
import { useVehicles } from './useVehicles'
import type { VehiclesState } from './useVehicles'

const VIEWS: [string, string][] = [
  ['dir', 'Vehicles'],
  ['ledger', 'Service Records'],
]

/**
 * Vehicles: the fleet's records.
 *
 * Two lists - every van, and every service record across all of them - plus a
 * profile for one van in six tabs. The profile is a view, not a route, so
 * getting back is a link rather than the browser's back button.
 */
export function VehiclesPage() {
  const s = useVehicles()
  const isProfile = s.view === 'profile'

  return (
    <div
      data-screen-label="Vehicles"
      data-rsp-page=""
      onClick={s.pageClick}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        // The design file subtracts the header; the shell has already done it.
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-120)',
        padding: 'var(--size-200)',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      {!isProfile && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-200)' }}>
          <Tabs
            big
            items={VIEWS}
            current={s.view}
            onPick={(id) => s.setView(id as 'dir' | 'ledger')}
            padding="0"
          />
          <div style={{ flex: 1 }} />
        </div>
      )}

      {s.view === 'dir' && <Directory s={s} />}
      {s.view === 'ledger' && <Ledger s={s} />}
      {isProfile && <Profile s={s} />}

      <Dialog s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}

/** Every service record on the fleet, with the vehicle named on each row. */
function Ledger({ s }: { s: VehiclesState }) {
  return (
    <div style={{ flex: 1, minHeight: 0, ...CARD }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <SectionTitle>Service Records</SectionTitle>
        <div style={{ flex: 1 }} />
        <PayerChips s={s} />
        <SearchBox value={s.svcSearch} onChange={s.setSvcSearch} placeholder="Search description or vendor" />
        <Button primary onClick={() => s.openDlg('service', { payer: 'Out of pocket', cat: 'Repair' })}>
          + Add service record
        </Button>
        <Button icon="SvExport" onClick={() => s.toastMsg(`Exported ${s.svcRows.length} records`)}>Export</Button>
      </div>

      <SvcTotals s={s} />

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div style={{ minWidth: 1100 }}>
          <ServiceTable s={s} withVehicle sticky />
        </div>
      </div>
    </div>
  )
}
