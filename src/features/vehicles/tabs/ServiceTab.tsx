'use client'

import { caption1, body1 } from '../../../ds/type'
import { PayerChips, SvcTotals } from '../Directory'
import { ServiceTable } from '../ServiceTable'
import { Button, Cell, DotPill, Pill, Row, SearchBox, SectionTitle, SortHead } from '../parts'
import { CARD } from '../style'
import type { HeadDef } from '../parts'
import type { VehiclesState } from '../useVehicles'

const INC_COLS = '150px 2fr 110px 130px 90px 80px'
const INC_HEAD: HeadDef[] = [
  { label: 'Date', k: 'when' },
  { label: 'What happened', k: 'what' },
  { label: 'Liability', k: 'liability' },
  { label: 'Claim ref', k: 'claim' },
  { label: 'Linked', k: 'linked', justify: 'flex-end' },
  { label: 'Status', k: 'status', justify: 'flex-end' },
]

/** This vehicle's spend, and the incidents that caused some of it. */
export function ServiceTab({ s }: { s: VehiclesState }) {
  return (
    <>
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
          <SectionTitle>Service Records</SectionTitle>
          <div style={{ flex: 1 }} />
          <PayerChips s={s} />
          <SearchBox value={s.svcSearch} onChange={s.setSvcSearch} placeholder="Search description or vendor" />
          <Button primary onClick={() => s.openDlg('service', { vid: s.pv.id, payer: 'Out of pocket', cat: 'Repair' })}>
            + Add service record
          </Button>
        </div>
        <SvcTotals s={s} />
        <ServiceTable s={s} withVehicle={false} emptyPadding="var(--size-240)" />
      </div>

      <Incidents s={s} />
    </>
  )
}

function Incidents({ s }: { s: VehiclesState }) {
  const q = s.incSearch.trim().toLowerCase()
  const rows = s.incidents
    .filter((i) => i.vid === s.pv.id)
    .filter((i) => !q || `${i.what} ${i.claim}`.toLowerCase().includes(q))
  const mul = s.inSort.d === 'asc' ? 1 : -1
  const sorted = rows.slice().sort((a, b) => {
    const va = (a as unknown as Record<string, string | number>)[s.inSort.k]
    const vb = (b as unknown as Record<string, string | number>)[s.inSort.k]
    return (va > vb ? 1 : va < vb ? -1 : 0) * mul
  })

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <SectionTitle>Incidents</SectionTitle>
        <div style={{ flex: 1 }} />
        <SearchBox value={s.incSearch} onChange={s.setIncSearch} placeholder="Search incidents" />
        <Button primary onClick={() => s.openDlg('incident', { vid: s.pv.id, liability: 'Unknown' })}>+ Log incident</Button>
      </div>
      <SortHead topBorder defs={INC_HEAD} sort={s.inSort} onSort={s.setInSort} cols={INC_COLS} />
      {sorted.length === 0 && (
        <span style={{ padding: 'var(--size-200) var(--size-160)', ...body1, color: 'var(--text-secondary)' }}>
          No incidents recorded.
        </span>
      )}
      {sorted.map((i) => {
        const open = i.status === 'open'
        return (
          <Row key={i.id} cols={INC_COLS}>
            <Cell>{i.when}</Cell>
            <Cell ellipsis>{i.what}</Cell>
            <span><Pill>{i.liability}</Pill></span>
            <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 'var(--size-80)' }}>
              {i.claim || '-'}
            </span>
            <Cell align="right" nums>{String(i.linked)}</Cell>
            <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <DotPill
                bg={open ? 'var(--warning-bg)' : 'var(--surface-subtle)'}
                fg={open ? 'var(--warning-fg)' : 'var(--text-secondary)'}
                dot={open ? 'var(--warning-accent)' : 'var(--neutral-400)'}
              >
                {open ? 'Open' : 'Closed'}
              </DotPill>
            </span>
          </Row>
        )
      })}
    </div>
  )
}
