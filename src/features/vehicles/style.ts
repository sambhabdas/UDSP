import type { CSSProperties } from 'react'
import { caption1Strong } from '../../ds/type'

/** The card every panel on the page sits in. */
export const CARD: CSSProperties = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

/** The uppercase label a column head or a field carries. */
export const LABEL: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

/** The ledger carries a Vehicle column the profile's own tab does not need. */
export const svcCols = (withVehicle: boolean): string =>
  withVehicle ? '130px 110px 150px 1.1fr 1.6fr 120px 110px 1fr' : '110px 150px 1.1fr 1.6fr 120px 110px 1fr'
