'use client'

import { caption1 } from '../../../ds/type'
import { latestOdo, short } from '../calc'
import { Button, Cell, Row, SearchBox, SectionTitle, SortHead } from '../parts'
import { CARD, LABEL } from '../style'
import type { HeadDef } from '../parts'
import type { VehiclesState } from '../useVehicles'
import { int } from '../../../ds/format'

const COLS = '120px 130px 130px 120px 1fr'
const HEAD: HeadDef[] = [
  { label: 'Date', k: 'date' },
  { label: 'Reading', k: 'reading', justify: 'flex-end' },
  { label: 'Source', k: 'source', pad: 'var(--size-160)' },
  { label: 'By', k: 'by' },
  { label: 'Note', k: 'note' },
]

/** Every reading ever taken, newest first. The latest one is the vehicle's. */
export function OdoTab({ s }: { s: VehiclesState }) {
  const od = latestOdo(s.odo, s.pv.id)
  const q = s.odoSearch.trim().toLowerCase()
  const mul = s.odSort.d === 'asc' ? 1 : -1
  const rows = s.odo
    .filter((o) => o.vid === s.pv.id)
    .filter((o) => !q || `${o.date} ${o.source} ${o.by} ${o.note}`.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => {
      const va = s.odSort.k === 'date' ? a.d.getTime() : s.odSort.k === 'reading' ? a.reading : (a as unknown as Record<string, string>)[s.odSort.k] || ''
      const vb = s.odSort.k === 'date' ? b.d.getTime() : s.odSort.k === 'reading' ? b.reading : (b as unknown as Record<string, string>)[s.odSort.k] || ''
      return (va > vb ? 1 : va < vb ? -1 : 0) * mul
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        <span style={LABEL}>Latest Reading</span>
        <span style={{ fontSize: 28, lineHeight: '36px', fontWeight: 'var(--weight-semibold)', color: 'var(--success-fg)', fontVariantNumeric: 'tabular-nums' }}>
          {od ? `${int(od.reading)} mi` : 'Never read'}
        </span>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{od ? `${od.date} · ${od.by}` : '-'}</span>
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
          <SectionTitle>Readings</SectionTitle>
          <div style={{ flex: 1 }} />
          <SearchBox value={s.odoSearch} onChange={s.setOdoSearch} placeholder="Search readings" />
          <Button primary onClick={() => s.openDlg('reading', { vid: s.pv.id, date: 'Jul 29, 2026', time: '10:20' })}>
            + Add reading
          </Button>
        </div>
        <SortHead topBorder defs={HEAD} sort={s.odSort} onSort={s.setOdSort} cols={COLS} />
        {rows.map((o, i) => (
          <Row key={o.id} cols={COLS} minHeight={44}>
            <Cell>{short(o.date)}</Cell>
            {/* The first row is whatever the current sort puts on top. */}
            <span style={{ textAlign: 'right', fontSize: 'var(--body-1-size)', lineHeight: 'var(--body-1-lh)', fontWeight: i === 0 ? 'var(--weight-semibold)' : 'var(--weight-regular)', fontVariantNumeric: 'tabular-nums' }}>
              {int(o.reading)} mi
            </span>
            <span style={{ paddingLeft: 'var(--size-160)', ...caption1, color: 'var(--text-secondary)' }}>{o.source}</span>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{o.by}</span>
            <span style={{ ...caption1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {o.note || '-'}
            </span>
          </Row>
        ))}
      </div>
    </div>
  )
}
