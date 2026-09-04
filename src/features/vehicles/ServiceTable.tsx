'use client'

import { body1Strong } from '../../ds/type'
import { categoryTone, money, short } from './calc'
import { Cell, DotPill, EmptyState, Row, SortHead } from './parts'
import type { HeadDef } from './parts'
import type { VehiclesState } from './useVehicles'
import { svcCols } from './style'

const BASE: HeadDef[] = [
  { label: 'Date', k: 'date' },
  { label: 'Category', k: 'cat' },
  { label: 'Vendor', k: 'vendor' },
  { label: 'Description', k: 'desc' },
  { label: 'Odometer', k: 'odo', justify: 'flex-end' },
  { label: 'Cost', k: 'cost', justify: 'flex-end' },
  { label: 'Paid by', k: 'paidBy', justify: 'flex-end' },
]

/**
 * Service records, shared by the ledger view and the profile's Service tab.
 * `withVehicle` is what tells them apart - everything else is identical.
 */
export function ServiceTable({
  s,
  withVehicle,
  sticky,
  emptyPadding,
}: {
  s: VehiclesState
  withVehicle: boolean
  sticky?: boolean
  emptyPadding?: string
}) {
  const cols = svcCols(withVehicle)
  const defs = withVehicle ? [{ label: 'Vehicle', k: 'vehicle' } as HeadDef, ...BASE] : BASE

  return (
    <>
      <div style={sticky ? { position: 'sticky', top: 0, zIndex: 5 } : undefined}>
        <SortHead defs={defs} sort={s.svSort} onSort={s.setSvSort} cols={cols} />
      </div>

      {s.svcRows.length === 0 ? (
        <EmptyState
          message="No service records match"
          action="Clear filters"
          onAction={() => { s.setPayer('All'); s.setSvcSearch('') }}
          padding={emptyPadding}
        />
      ) : (
        s.svcRows.map((rec) => {
          const veh = s.vehicles.find((x) => x.id === rec.vid)
          const t = categoryTone(rec.cat)
          return (
            <Row key={rec.id} cols={cols} opacity={veh && veh.status === 'Off fleet' ? 0.65 : 1}>
              {withVehicle && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); s.openProfile(rec.vid, 'service') }}
                  style={{ ...body1Strong, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
                >
                  {veh ? veh.name : ''}
                </a>
              )}
              <Cell>{short(rec.date)}</Cell>
              <span>
                <DotPill bg={t.bg} fg={t.fg} dot={t.dot}>{rec.cat}</DotPill>
              </span>
              <Cell ellipsis>{rec.vendor || '-'}</Cell>
              <Cell ellipsis>{rec.desc}</Cell>
              <Cell align="right" nums>{rec.odo ? `${rec.odo} mi` : '-'}</Cell>
              <Cell align="right" bold nums>{money(rec.cost)}</Cell>
              {/* A split bill names each payer's share; a single one just names them. */}
              <span
                style={{
                  textAlign: 'right',
                  fontSize: 'var(--caption-1-size)',
                  lineHeight: 'var(--caption-1-lh)',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {rec.alloc.map((a) => a[0] + (rec.alloc.length > 1 ? ` ${money(a[1])}` : '')).join(' · ')}
              </span>
            </Row>
          )
        })
      )}
    </>
  )
}
