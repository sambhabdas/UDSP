import { useHover } from '../../ds/useHover.js'
import { body1, caption1, caption2 } from '../../ds/type.js'
import { IMAP, INFO, MAIL_PROVIDERS, MAIL_SCOPE_NOTE } from './data.js'
import { Card, Helper, Section, SmallButton } from './parts.jsx'

export function MailboxTab({ s }) {
  return (
    <Section label="Mailbox" info={INFO.mailbox}>
      {s.mailConnected ? (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.mailAddr}
              </span>
              <Helper>
                {s.mailProvider}
                {s.mailProvider === IMAP ? ' · app password' : ' · OAuth · no password stored'}
              </Helper>
            </div>
            <SmallButton onClick={() => s.toast('Test email sent to you')}>Send test email</SmallButton>
            {/* Disconnecting keeps every message already in the Inbox. */}
            <SmallButton danger onClick={s.disconnectMail}>
              Disconnect
            </SmallButton>
          </div>
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 'var(--grid-gutter)' }}>
            {MAIL_PROVIDERS.map((p) => (
              <ProviderCard key={p.name} name={p.name} sub={p.sub} onPick={() => s.beginMailConnect(p.name)} />
            ))}
          </div>
          {/* Why a read-only grant will not do. */}
          <div
            style={{
              boxSizing: 'border-box',
              padding: 'var(--size-80) var(--size-120)',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-small)',
              ...caption1,
              color: 'var(--warning-fg)',
              textWrap: 'pretty',
            }}
          >
            {MAIL_SCOPE_NOTE}
          </div>
        </>
      )}
    </Section>
  )
}

function ProviderCard({ name, sub, onPick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-medium)',
        padding: 'var(--size-160)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-20)',
        cursor: 'pointer',
        transition: 'border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{name}</span>
      <span style={{ ...caption2, color: 'var(--text-helper)', textWrap: 'pretty' }}>{sub}</span>
    </div>
  )
}
