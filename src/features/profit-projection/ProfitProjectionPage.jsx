import { Toast } from '../../ds/components/Overlay.jsx'
import { Toolbar } from './Toolbar.jsx'
import {
  CostBreakdown,
  MoneyKpis,
  ProjectionInputs,
  SectionLabel,
  WhatMovesIt,
} from './Summary.jsx'
import {
  CostPerRoute,
  DailyPL,
  PerRouteEconomics,
  RegularVsOvertime,
  WorkforceUtilization,
} from './charts/WeekCharts.jsx'
import { HoursPerRoute } from './charts/DayCharts.jsx'
import { DetailTable } from './DetailTable.jsx'
import { ImportDialog } from './ImportDialog.jsx'
import { Notes } from './Notes.jsx'
import { useProfitProjection } from './useProfitProjection.js'

// The DAILY P&L. One editable day; a range is a read-only sum of its days.
// Payroll-side only — the vehicle economy lives on Fleet Financials and is
// never added, compared or reconciled here.
export function ProfitProjectionPage() {
  const s = useProfitProjection()
  const charts = { locked: s.locked, tip: s.tip, setTip: s.setTip, onPickDay: s.openDay }

  return (
    <div
      data-screen-label="Profit Projection"
      onClick={s.closeMenus}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--size-200)',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      <div
        onScroll={s.closeMenus}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden auto', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
          <Toolbar s={s} />

          {s.isDay && <ProjectionInputs s={s} />}

          <MoneyKpis s={s} />
          <WhatMovesIt s={s} />

          <SectionLabel>Trends</SectionLabel>
          {s.isWeek && !s.empty && <DailyPL {...charts} />}

          <div
            style={{
              display: 'grid',
              // min() lets the track collapse below 380px on a narrow pane; without
              // it an auto-fit track holds its minimum and the page scrolls sideways.
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
              gap: 'var(--size-160)',
            }}
          >
            <CostBreakdown s={s} />
            {s.isWeek && !s.empty && (
              <>
                <CostPerRoute {...charts} />
                <PerRouteEconomics {...charts} />
                <RegularVsOvertime {...charts} />
                <WorkforceUtilization {...charts} />
              </>
            )}
            {s.isDay && <HoursPerRoute dayIdx={s.dayIdx} />}
          </div>

          <SectionLabel>Detail</SectionLabel>
          <DetailTable s={s} />

          <Notes s={s} />
        </div>
      </div>

      {s.importOpen && <ImportDialog s={s} />}
      {s.toastMsg && <Toast>{s.toastMsg}</Toast>}
    </div>
  )
}
