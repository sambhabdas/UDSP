'use client'

import { Detail } from './Detail'
import { Dialogs } from './dialogs'
import { FilterPanel } from './FilterPanel'
import { FloatingMenu } from './FloatingMenu'
import { Roster } from './Roster'
import { Toast } from './parts'
import { useRoster } from './useRoster'

/**
 * Performance Roster.
 *
 * One screen with two states: the whole fleet as a sortable table, and any
 * single associate's record in full. Opening a row swaps the body; the header
 * kebab brings you back.
 */
export function PerformanceRosterPage() {
  const s = useRoster()
  return (
    <div
      data-screen-label="Associates"
      onClick={() => { if (s.menu || s.winOpen) { s.closeMenu(); s.setWinOpen(false) } }}
      style={{
        boxSizing: 'border-box', height: 'calc(100vh - var(--header-height))', minHeight: 0,
        display: 'flex', flexDirection: 'column', background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)', color: 'var(--text-primary)', overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div
          data-rsp-minw0=""
          data-rsp-page=""
          style={{
            boxSizing: 'border-box', minWidth: 1120, display: 'flex', flexDirection: 'column',
            gap: 'var(--size-120)', padding: 'var(--size-200)',
          }}
        >
          {s.view === 'roster' ? <Roster s={s} /> : <Detail s={s} />}
        </div>
      </div>

      <FilterPanel s={s} />
      <Dialogs s={s} />
      <FloatingMenu s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}
