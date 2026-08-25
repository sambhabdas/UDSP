import { useCallback, useRef } from 'react'
import { Toast } from '../../ds/components/Overlay.jsx'
import { Toolbar } from './Toolbar.jsx'
import { CurrentStrip, MoneyKpis, SectionLabel, WhatMovesIt } from './Summary.jsx'
import {
  CostBreakdown,
  PerRouteEconomics,
  RegularVsOvertime,
  RevenueAndProfit,
  RevenueDistribution,
  TimecardHours,
  WorkforceUtilization,
} from './charts/Charts.jsx'
import { HistoryTable } from './HistoryTable.jsx'
import { useProfitability } from './useProfitability.js'
import { ALL, CURRENT, PERIODS } from './data.js'

// Profit per 2-week pay period, with an always-on projection of the period in
// flight. The calendar comes from Payroll Setup; this page never reconciles
// with Profit Projection — they answer different questions at different grains.
export function ProfitabilityPage() {
  const scroller = useRef(null)
  const scrollToTop = useCallback(
    () => scroller.current && scroller.current.scrollTo({ top: 0, behavior: 'smooth' }),
    [],
  )
  const s = useProfitability({ scrollToTop })

  // The trend charts show the last N closed periods plus the current one.
  const trend = PERIODS.slice(-s.range).concat([CURRENT])
  // Three-period charts read the most recent periods that carry timecards.
  const last3 = ALL.slice(-3)

  return (
    <div
      data-screen-label="Profitability"
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
        ref={scroller}
        onScroll={s.closeMenus}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden auto', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
          <Toolbar s={s} />
          <CurrentStrip s={s} />
          <MoneyKpis s={s} />
          <WhatMovesIt s={s} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
            <SectionLabel>Trends</SectionLabel>
            <div
              style={{
                display: 'grid',
                // min() lets the track collapse below 380px on a narrow pane; without
              // it an auto-fit track holds its minimum and the page scrolls sideways.
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
                gap: 'var(--size-160)',
              }}
            >
              <RevenueAndProfit s={s} periods={trend} />
              <PerRouteEconomics s={s} periods={trend} />
              <RevenueDistribution s={s} periods={trend} />
              <CostBreakdown s={s} periods={last3} />
              <TimecardHours s={s} periods={last3} />
              <RegularVsOvertime s={s} periods={last3} />
              <WorkforceUtilization s={s} periods={trend} />
            </div>
          </div>

          <HistoryTable s={s} />
          <div style={{ height: 'var(--size-200)' }} />
        </div>
      </div>

      {s.toastMsg && <Toast>{s.toastMsg}</Toast>}
    </div>
  )
}
