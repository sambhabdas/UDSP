'use client'

import { Toast } from './parts'
import { Directory } from './Directory'
import { BackLink, ProfileHeader } from './Profile'
import { FilterDrawer } from './FilterDrawer'
import { ActionMenu } from './ActionMenu'
import { CoachDialog, DaDialog, ExclDialog } from './dialogs'
import { OverviewTab } from './tabs/OverviewTab'
import { ScheduleTab } from './tabs/ScheduleTab'
import { PerformanceTab } from './tabs/PerformanceTab'
import { DispatchTab } from './tabs/DispatchTab'
import { TimecardTab } from './tabs/TimecardTab'
import { DocsTab } from './tabs/DocsTab'
import { useGeneralAssociates } from './useGeneralAssociates'

/**
 * Associates — every DA on the roster, and one profile in six tabs.
 *
 * The profile is a view rather than a route: opening one keeps the roster's
 * scroll, sort and filters intact underneath, so working a filtered list one
 * person at a time does not mean rebuilding the filter each time you come back.
 */
export function GeneralAssociatesPage() {
  const s = useGeneralAssociates()

  return (
    <div
      data-screen-label="Associates"
      style={{
        boxSizing: 'border-box',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-subtle)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
      }}
    >
      {s.view === 'dir' && (
        <div
          data-rsp-assoc=""
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            boxSizing: 'border-box',
            padding: 'var(--size-200) var(--size-240) var(--size-320) var(--size-240)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-160)',
          }}
        >
          <Directory s={s} />
        </div>
      )}

      {s.view === 'profile' && (
        <div
          data-rsp-assoc=""
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            boxSizing: 'border-box',
            padding: 'var(--size-160) var(--size-240) var(--size-320) var(--size-240)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-160)',
          }}
        >
          <BackLink s={s} />
          <ProfileHeader s={s} />

          {s.tab === 'overview' && <OverviewTab s={s} />}
          {s.tab === 'schedule' && <ScheduleTab s={s} />}
          {s.tab === 'performance' && <PerformanceTab s={s} />}
          {s.tab === 'dispatch' && <DispatchTab s={s} />}
          {s.tab === 'timecard' && <TimecardTab s={s} />}
          {s.tab === 'docs' && <DocsTab s={s} />}
        </div>
      )}

      <FilterDrawer s={s} />
      <DaDialog s={s} />
      <CoachDialog s={s} />
      <ExclDialog s={s} />
      <ActionMenu s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}
