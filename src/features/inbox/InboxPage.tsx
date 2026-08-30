'use client'

import { useViewportWidth } from '../../ds/useViewportWidth'
import { RecentsPanel } from './RecentsPanel'
import { ActivityPanel } from './ActivityPanel'
import { DecisionRail } from './DecisionRail'
import { useInbox } from './useInbox'
import { dial } from '../dialer/dial'

// Breakpoints. The first three are the design file's:
//   ≥1180  three columns
//   920–1179  compact three columns
//   <920   two columns, decision rail becomes a Details drawer
// The fourth is an addition — below 640 the two-column grid needs more width
// than the viewport has, and because the page is `overflow: hidden` the
// composer would be pushed off-screen and become unreachable rather than
// merely scrolled. So Recents folds into a drawer too and the conversation
// takes the full width.
const STACK_BELOW = 640
const DRAWER_BELOW = 920
const COMPACT_BELOW = 1180

function layoutFor(width: number) {
  const stack = width < STACK_BELOW
  const drawer = width < DRAWER_BELOW
  const compact = width < COMPACT_BELOW
  return {
    stack,
    drawer,
    // minmax(0, 1fr) below the three-column modes: a hard min on the centre
    // column is exactly what forced the overflow.
    gridCols: stack
      ? 'minmax(0, 1fr)'
      : drawer
        ? '228px minmax(0, 1fr)'
        : compact
          ? '236px minmax(280px, 1fr) 256px'
          : '260px minmax(300px, 1fr) 280px',
    gridGap: compact ? 'var(--size-120)' : 'var(--size-160)',
  }
}

export function InboxPage({ onRoadStale = false }) {
  const state = useInbox()
  const { stack, drawer, gridCols, gridGap } = layoutFor(useViewportWidth())

  return (
    <div
      data-screen-label="Inbox"
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-120)',
        padding: 'var(--size-200)',
        // Stacked, the dialer gets its own strip so it cannot sit on top of the
        // composer's send control.
        paddingBottom: stack ? 64 : 'var(--size-200)',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: gridCols,
          gap: gridGap,
          overflow: 'hidden',
        }}
      >
        <RecentsPanel
          rows={state.rows}
          selectedId={state.selected.id}
          onSelect={(id) => {
            state.selectPerson(id)
            if (stack) state.setRecentsOpen(false) // go straight to the conversation
          }}
          filter={state.filter}
          onFilter={state.setFilter}
          isDrawer={stack}
          open={state.recentsOpen}
          onClose={() => state.setRecentsOpen(false)}
        />

        <ActivityPanel
          person={state.selected}
          feed={state.feed}
          channels={state.channels}
          onChannel={state.toggleChannel}
          railIsDrawer={drawer}
          onToggleDetails={() => state.setDetailsOpen(!state.detailsOpen)}
          recentsIsDrawer={stack}
          onToggleRecents={() => state.setRecentsOpen(!state.recentsOpen)}
          composer={{
            tab: state.tab,
            onTab: state.setTab,
            draft: state.draft,
            onDraft: state.setDraft,
            subject: state.subject,
            onSubject: state.setSubject,
            canSend: state.canSend,
            onSend: state.send,
            // The dialer lives in the shell; the page just asks it to call.
            onCall: () => dial(state.selected.name, state.selected.phone),
          }}
        />

        <DecisionRail
          person={state.selected}
          stale={onRoadStale}
          isDrawer={drawer}
          open={state.detailsOpen}
          onClose={() => state.setDetailsOpen(false)}
          state={state}
        />
      </div>
    </div>
  )
}
