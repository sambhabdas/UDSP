import type { CSSProperties } from 'react'
import { caption1Strong } from '../../ds/type'

export const HEAD: CSSProperties = {
  ...caption1Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

export const TILE_LABEL: CSSProperties = { ...HEAD, color: 'var(--text-helper)' }

export const NUM: CSSProperties = { fontVariantNumeric: 'tabular-nums' }

export const FIELD_LABEL: CSSProperties = { ...caption1Strong, color: 'var(--text-secondary)' }

/** Each tab lays its table out differently; the header and rows share these. */
export const COLS: Record<string, string> = {
  all: '85px 150px minmax(130px,1.2fr) 70px 145px minmax(135px,1.2fr) 140px 90px',
  open: '36px 95px 125px minmax(110px,1fr) minmax(130px,1.05fr) 100px 125px 95px 165px',
  done: '120px 130px minmax(120px,1fr) minmax(140px,1.05fr) 55px 90px minmax(140px,1.5fr) 110px 100px',
}

/** [sortKey | null, label, justify] */
export const HEADS: Record<string, [string | null, string, string][]> = {
  all: [
    ['date', 'Date', 'flex-start'], ['da', 'Associate', 'flex-start'], ['standard', 'Standard', 'flex-start'],
    ['pts', 'Points', 'flex-end'], ['source', 'Source', 'flex-start'], ['module', 'Module', 'flex-start'],
    ['coach', 'Coaching Status', 'flex-start'], [null, 'Actions', 'center'],
  ],
  open: [
    ['due', 'Due', 'flex-start'], ['da', 'Associate', 'flex-start'], ['standard', 'Standard', 'flex-start'],
    ['module', 'Module', 'flex-start'], ['assigned', 'Assigned', 'flex-start'], ['status', 'Status', 'flex-start'],
    ['reminded', 'Last Reminded', 'flex-start'], [null, 'Actions', 'flex-end'],
  ],
  done: [
    ['completed', 'Completed', 'flex-start'], ['da', 'Associate', 'flex-start'], ['standard', 'Standard', 'flex-start'],
    ['module', 'Module', 'flex-start'], ['time', 'Time', 'flex-end'], ['score', 'Score', 'flex-end'],
    ['ack', 'Acknowledged', 'flex-start'], [null, 'Conversation', 'center'], [null, 'Actions', 'center'],
  ],
}

export const CARD_TITLES: Record<string, string> = { all: 'Ledger', open: 'Chase List', done: 'Closed Loops' }
