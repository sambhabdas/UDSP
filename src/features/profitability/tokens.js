// Style constants the Profitability components share, kept out of the
// component files so fast refresh stays intact.
import { caption2Strong } from '../../ds/type.js'

export const EYEBROW = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
}
