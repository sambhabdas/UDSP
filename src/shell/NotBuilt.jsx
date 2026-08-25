import { body1Strong, caption1 } from '../ds/type.js'

// The nav lists the real pane-2 order even where the page does not exist yet.
// Naming the gap is the honest option — an empty state states the situation in
// the user's terms rather than pretending the entry does something.
export function NotBuilt({ title, portal }) {
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
      <span style={{ ...body1Strong }}>{title} is not built yet</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', maxWidth: 420, textWrap: 'pretty' }}>
        It is listed here because it is a real entry in the {portal} navigation. Only Payroll Setup
        and Inbox have been implemented so far.
      </span>
    </div>
  )
}
