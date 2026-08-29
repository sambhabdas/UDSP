import { Toast } from '../../ds/components/Overlay.jsx'
import { useHover } from '../../ds/useHover.js'
import { body1, caption1 } from '../../ds/type.js'
import { BANNER, TABS } from './data.js'
import { AddLineDialog, DeleteLineDialog, MailConnectDialog, ReleaseDialog, ReserveDialog } from './Dialogs.jsx'
import { LinesTab } from './LinesTab.jsx'
import { MailboxTab } from './MailboxTab.jsx'
import { PunchTab } from './PunchTab.jsx'
import { FOCUS_RING, useFocusRing } from './ui.js'
import { useConnections } from './useConnections.js'

// Three things UDSP plugs into, and none of them overlap: the punch API brings
// worked hours in, the mailbox sends and receives email in the Inbox, and phone
// lines carry text and calls. Losing one never degrades the others — each tab
// says so in its own banner.
export function AdminConnectionsPage() {
  const s = useConnections()

  const health = {
    punch: s.punchConnected,
    mail: s.mailConnected,
    lines: true,
  }

  const banner =
    s.tab === 'punch'
      ? s.punchConnected
        ? { ok: true, text: BANNER.punchOn(s.provider, s.env) }
        : { ok: false, text: BANNER.punchOff }
      : s.tab === 'mail'
        ? s.mailConnected
          ? { ok: true, text: BANNER.mailOn(s.mailAddr) }
          : { ok: false, text: BANNER.mailOff }
        : { ok: true, text: BANNER.lines(s.lines.length) }

  return (
    <div
      data-screen-label="Admin Connections"
      onClick={s.closeOverlays}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden auto',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexShrink: 0,
          display: 'flex',
          gap: 'var(--size-160)',
          padding: 'var(--size-200) var(--size-200) 0 var(--size-200)',
          background: 'var(--surface-page)',
          borderBottom: '1px solid var(--border-default)',
          flexWrap: 'wrap',
        }}
      >
        {TABS.map((t) => (
          <Tab
            key={t.id}
            label={t.label}
            healthy={health[t.id]}
            on={s.tab === t.id}
            onPick={() => {
              s.setTab(t.id)
              s.setMenuFor(null)
              s.setOpenDrop(null)
            }}
          />
        ))}
      </div>

      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-200)',
          padding: 'var(--size-200) var(--size-200) var(--size-320) var(--size-200)',
        }}
      >
        {/* The state of this connection, in words, before any control. */}
        <div
          role="status"
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-100)',
            padding: 'var(--size-80) var(--size-120)',
            background: banner.ok ? 'var(--success-bg)' : 'var(--warning-bg)',
            border: `1px solid ${banner.ok ? 'var(--success-border)' : 'var(--warning-border)'}`,
            borderRadius: 'var(--radius-medium)',
            ...caption1,
            color: banner.ok ? 'var(--success-fg)' : 'var(--warning-fg)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 'var(--radius-circle)',
              background: banner.ok ? 'var(--success-accent)' : 'var(--warning-accent)',
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, minWidth: 0, textWrap: 'pretty' }}>{banner.text}</span>
        </div>

        {s.tab === 'punch' && <PunchTab s={s} />}
        {s.tab === 'mail' && <MailboxTab s={s} />}
        {s.tab === 'lines' && <LinesTab s={s} />}
      </div>

      {s.addOpen && <AddLineDialog s={s} />}
      {s.mailOpen && <MailConnectDialog s={s} />}
      {s.deleteFor && <DeleteLineDialog s={s} />}
      {s.reserveOpen && <ReserveDialog s={s} />}
      {s.releaseFor && <ReleaseDialog s={s} />}
      {s.toastText && <Toast>{s.toastText}</Toast>}
    </div>
  )
}

// Each tab carries its own health dot, so a broken connection is visible from
// whichever tab you happen to be standing on.
function Tab({ label, healthy, on, onPick }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      role="tab"
      aria-selected={on}
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPick()
        }
      }}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: 'var(--size-80) 0',
        ...body1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on || hover ? 'var(--text-primary)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        transition: 'color var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      {label}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 'var(--radius-circle)',
          background: healthy ? 'var(--success-accent)' : 'var(--warning-accent)',
          flexShrink: 0,
        }}
      />
      {on && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -1,
            height: 2,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--primary)',
          }}
        />
      )}
    </div>
  )
}
