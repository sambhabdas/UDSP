'use client'

import { PAIR } from './style'
import { Toast } from './parts'
import {
  AtRisk, AutomationHealth, CategoryPanel, CoachingAging, CompletionByWeek, Declines,
  EventSources, Kudos, Leaderboard, PageHead, SectionLabel, Tiles, TierDistribution,
  TimeToComplete, TrendPanel, WeeklyBonuses, WeeklyDeductions,
} from './panels'
import { useScorecardOverview } from './useScorecardOverview'

/**
 * Scorecard Overview.
 *
 * Four readings of the same fleet, in the order a manager asks for them:
 * the headline numbers, where the score is coming from, who is at either end
 * of it, and whether the coaching that follows is actually getting done.
 */
export function ScorecardOverviewPage() {
  const s = useScorecardOverview()
  return (
    <div
      data-screen-label="Scorecard Overview"
      onClick={s.closeDrop}
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
            gap: 'var(--size-100)', padding: 'var(--size-160)',
          }}
        >
          <PageHead s={s} />
          <Tiles s={s} />

          <SectionLabel>Scores</SectionLabel>
          <div data-rsp-c2="" style={PAIR}>
            <CategoryPanel s={s} />
            <TrendPanel s={s} />
          </div>
          <div data-rsp-c2="" style={PAIR}>
            <WeeklyDeductions s={s} />
            <WeeklyBonuses s={s} />
          </div>
          <div data-rsp-c2="" style={PAIR}>
            <EventSources s={s} />
            <TierDistribution s={s} />
          </div>

          <SectionLabel>People</SectionLabel>
          <div data-rsp-c2="" style={PAIR}>
            <AtRisk s={s} />
            <Leaderboard s={s} />
          </div>
          <div data-rsp-c2="" style={PAIR}>
            <Kudos s={s} />
            <Declines s={s} />
          </div>

          <SectionLabel>Coaching</SectionLabel>
          <div data-rsp-c2="" style={PAIR}>
            <AutomationHealth s={s} />
            <CompletionByWeek s={s} />
          </div>
          <div data-rsp-c2="" style={PAIR}>
            <CoachingAging />
            <TimeToComplete s={s} />
          </div>
        </div>
      </div>

      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}
