'use client'

import { body1 } from '../../ds/type'
import { Dialogs, FormDialog, RecordDialog } from './dialogs'
import { FilterPanel } from './FilterPanel'
import { FloatingMenu } from './FloatingMenu'
import { Grid } from './Grid'
import { History } from './History'
import { Import } from './Import'
import { Toast } from './parts'
import { useAvailability, type Tab } from './useAvailability'

const TABS: Tab[] = ['Week Grid', 'Import', 'History']

/**
 * Availability.
 *
 * Who can work which day. The grid is the page; Import fills it from a file
 * and History says which file wrote what. Every cell carries its provenance,
 * and approved time off is protected from a stray click throughout.
 */
export function AvailabilityPage() {
  const s = useAvailability()
  return (
    <div
      data-screen-label="Availability"
      onClick={() => { if (s.openDrop) s.setOpenDrop(null); if (s.menu) s.closeMenu() }}
      style={{
        boxSizing: 'border-box', position: 'relative', height: 'calc(100vh - var(--header-height))',
        minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)', color: 'var(--text-primary)', overflow: 'hidden',
      }}
    >
      <div
        data-rsp-page=""
        style={{ position: 'sticky', top: 0, zIndex: 30, flexShrink: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', padding: 'var(--size-160) var(--size-200) var(--size-120) var(--size-200)', background: 'var(--surface-page)' }}
      >
        <div style={{ display: 'flex', gap: 'var(--size-160)', borderBottom: '1px solid var(--border-default)' }}>
          {TABS.map((t) => {
            const on = s.tab === t
            return (
              <div
                key={t}
                data-fx=""
                tabIndex={0}
                role="button"
                onClick={() => s.setTab(t)}
                onMouseDown={(e) => e.preventDefault()}
                style={{ position: 'relative', boxSizing: 'border-box', padding: 'var(--size-80) 0', ...body1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'color var(--motion-hover)' }}
              >
                {t}
                {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, borderRadius: 'var(--radius-pill)', background: 'var(--primary)' }} />}
              </div>
            )
          })}
        </div>
      </div>

      {s.tab === 'Week Grid' && <Grid s={s} />}
      {s.tab === 'Import' && <Import s={s} />}
      {s.tab === 'History' && <History s={s} />}

      <RecordDialog s={s} />
      <FormDialog s={s} />
      <FloatingMenu s={s} />
      <Dialogs s={s} />
      <FilterPanel s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}
