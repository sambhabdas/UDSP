'use client'

import { caption1, subtitle2 } from '../../../ds/type'
import { PHOTO_SLOTS } from '../data'
import { Button, Pill, SearchBox, SectionTitle } from '../parts'
import type { VehiclesState } from '../useVehicles'

/** One card per photo set, each showing which of the five angles were taken. */
export function PhotosTab({ s }: { s: VehiclesState }) {
  const q = s.photoSearch.trim().toLowerCase()
  const cards = s.photos
    .filter((x) => x.vid === s.pv.id)
    .filter((p) => !q || `${p.type} ${p.note} ${p.date}`.toLowerCase().includes(q))

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <SectionTitle>Photo Sets</SectionTitle>
        <div style={{ flex: 1 }} />
        <SearchBox value={s.photoSearch} onChange={s.setPhotoSearch} placeholder="Search photo sets" />
        <Button primary onClick={() => s.openDlg('photos', { vid: s.pv.id, setType: 'Pre-trip' })}>
          + Upload photo set
        </Button>
      </div>

      {cards.map((p) => {
        const slots = PHOTO_SLOTS.map((sl) => ({
          label: sl.charAt(0).toUpperCase() + sl.slice(1),
          on: p.filled.includes(sl),
        }))
        return (
          <div
            key={p.id}
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
              <span style={subtitle2}>{p.date}</span>
              <Pill>{p.type}</Pill>
              <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{p.note}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 'var(--size-80)' }}>
              {slots.map((sl) => (
                <Slot key={sl.label} label={sl.label} bg={sl.on ? 'var(--blue-50)' : 'var(--surface-subtle)'} fg={sl.on ? 'var(--blue-700)' : 'var(--text-disabled)'} />
              ))}
              {/* Anything beyond the five named angles is counted, not shown. */}
              {p.extras > 0 && (
                <Slot label={`+${p.extras} extras`} bg="var(--surface-subtle)" fg="var(--text-secondary)" />
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}

function Slot({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <div
      style={{
        aspectRatio: '4/3',
        borderRadius: 'var(--radius-small)',
        background: bg,
        border: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...caption1,
        color: fg,
        fontWeight: 'var(--weight-semibold)',
      }}
    >
      {label}
    </div>
  )
}
