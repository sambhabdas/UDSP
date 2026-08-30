import Link from 'next/link'
import { DEFAULT_ROUTE } from '../shell/nav'
import { body1Strong, caption1 } from '../ds/type'

export default function NotFound() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        height: 'calc(100vh - var(--header-height))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-320)',
        background: 'var(--surface-page)',
        textAlign: 'center',
      }}
    >
      <span style={body1Strong}>That page is not part of this console</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', maxWidth: 420, textWrap: 'pretty' }}>
        The address does not match any portal in the navigation.
      </span>
      <Link href={DEFAULT_ROUTE} style={{ ...caption1, color: 'var(--text-link)' }}>
        Go to Payroll Setup
      </Link>
    </div>
  )
}
