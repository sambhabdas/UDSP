'use client'

import { AddServiceDialog } from './AddServiceDialog'
import { FilterPanel } from './FilterPanel'
import { Notes } from './Notes'
import { RateEditor } from './RateEditor'
import { RateTable, OthersTable } from './RateTable'
import { RateTimeline } from './RateTimeline'
import { Toast } from './parts'
import { useRateCards } from './useRateCards'

// Rate Cards answers one question: what does Amazon pay for a route, and since
// when. Every rate is a dated window rather than a single number, so changing
// today's price cannot rewrite what last week earned - the table, the timeline
// and the editor all say that in different ways.
//
// Below this the eight columns collide, so the page scrolls sideways in its own
// box rather than letting the shell scroll.
const MIN_WIDTH = 980

export function RateCardsPage() {
  const s = useRateCards()

  return (
    <div
      data-screen-label="Rate Cards"
      onClick={() => {
        if (s.addMenuOpen) s.setAddMenuOpen(false)
        if (s.dpOpen) s.setDpOpen(null)
      }}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-120)',
        // The two narrow steps are in app.css, keyed off the screen label.
        padding: 'var(--size-200)',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            minWidth: MIN_WIDTH,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-120)',
          }}
        >
          <RateTable s={s} />
          <OthersTable s={s} />
          <RateTimeline s={s} />
          <Notes s={s} />
        </div>
      </div>

      {s.editor && <RateEditor s={s} />}
      {s.addOpen && <AddServiceDialog s={s} />}
      {s.fpOpen && <FilterPanel s={s} />}
      {s.toastText && <Toast onUndo={s.undoSnap ? s.undo : undefined}>{s.toastText}</Toast>}
    </div>
  )
}
