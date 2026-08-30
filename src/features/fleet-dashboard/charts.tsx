'use client'

import { caption1 } from '../../ds/type'
import { MONTHS, SEG_COLORS, money } from './data'
import { AxisLabels } from './parts'
import type { FleetDashboardState } from './useFleetDashboard'

/**
 * Utilization: one bar per day or week, as a percentage of the fleet on route.
 * The dashed line at the top of the plot is 100%, so a full bar touches it.
 */
export function UtilChart({ s }: { s: FleetDashboardState }) {
  const bars = s.uScope.bars
  return (
    <div style={{ flex: 1, minHeight: 150, display: 'flex', gap: 'var(--size-80)' }}>
      <AxisLabels width={36} labels={['100%', '50%', '0']} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'stretch',
            gap: 'var(--size-120)',
            padding: '0 var(--size-40)',
            borderLeft: '1px solid var(--border-default)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          {/* The 100% line sits 20px down — the height the hover label reserves. */}
          <div
            style={{ position: 'absolute', left: 0, right: 0, top: 20, borderTop: '1px dashed var(--border-strong)', pointerEvents: 'none' }}
          />
          {bars.map(([label, pct], i) => (
            <div
              key={label}
              onMouseEnter={() => s.setHoverUtil(i)}
              onMouseLeave={() => s.setHoverUtil(null)}
              title={`${label} · ${pct}%`}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-40)' }}
            >
              <span
                style={{
                  minHeight: 16,
                  ...caption1,
                  color: 'var(--text-secondary)',
                  opacity: s.hoverUtil === i ? 1 : 0,
                  transition: 'opacity 100ms',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {pct}%
              </span>
              <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: 56, height: `${pct}%`, background: 'var(--blue-500)', borderRadius: '2px 2px 0 0' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--size-120)', padding: 'var(--size-40) var(--size-40) 0 var(--size-40)' }}>
          {bars.map(([label]) => (
            <span key={label} style={{ flex: 1, textAlign: 'center', ...caption1, color: 'var(--text-secondary)' }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Spend by month: a stacked bar per month, out-of-pocket at the bottom and
 * whoever covered the rest above it. July is month-to-date, so it is outlined
 * and its own share is drawn pale — the month is not finished arguing yet.
 */
export function TrendChart({ s }: { s: FleetDashboardState }) {
  return (
    <>
      <div style={{ flex: 1, minHeight: 190, display: 'flex', gap: 'var(--size-80)' }}>
        <AxisLabels width={52} labels={[s.axisMaxLabel, s.axisMidLabel, '$0']} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'stretch',
              gap: 'var(--size-160)',
              padding: '0 var(--size-40)',
              borderLeft: '1px solid var(--border-default)',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            {MONTHS.map((m, i) => {
              const g = m.oop + Object.values(m.segs).reduce((a, v) => a + v, 0)
              const segs: [string, number][] = [['Out of pocket', m.oop], ...Object.entries(m.segs)]
              return (
                <div
                  key={m.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => s.setSpendPeriod(`${m.key} 2026`)}
                  onMouseEnter={() => s.setHoverBar(i)}
                  onMouseLeave={() => s.setHoverBar(null)}
                  title={`${m.label} · total ${money(g)} · out of pocket ${money(m.oop)}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 'var(--size-40)',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      minHeight: 16,
                      ...caption1,
                      color: 'var(--text-secondary)',
                      opacity: s.hoverBar === i ? 1 : 0,
                      transition: 'opacity 100ms',
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.hoverBar === i ? money(g) : ''}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 56,
                      height: `${((g / s.axisMax) * 100).toFixed(1)}%`,
                      display: 'flex',
                      // The first segment is out-of-pocket, and it belongs at
                      // the bottom of the stack.
                      flexDirection: 'column-reverse',
                      border: `1px solid ${m.mtd ? 'var(--border-strong)' : 'transparent'}`,
                      borderBottom: 'none',
                      borderRadius: '2px 2px 0 0',
                      overflow: 'hidden',
                    }}
                  >
                    {segs.map(([name, v]) => (
                      <div
                        key={name}
                        title={`${m.label} · ${name} · ${money(v)} · ${Math.round((v / g) * 100)}%`}
                        style={{
                          height: `${((v / g) * 100).toFixed(1)}%`,
                          background: m.mtd && name === 'Out of pocket' ? 'var(--blue-100)' : SEG_COLORS[name],
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 'var(--size-160)', padding: 'var(--size-40) var(--size-40) 0 var(--size-40)' }}>
            {MONTHS.map((m) => {
              const picked = s.scopeKey === `${m.key} 2026`
              return (
                <span
                  key={m.key}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    ...caption1,
                    color: picked ? 'var(--blue-700)' : 'var(--text-primary)',
                    fontWeight: picked ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  }}
                >
                  {m.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)' }}>
        {Object.entries(SEG_COLORS).map(([label, fill]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--text-secondary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: fill }} />
            {label}
          </span>
        ))}
      </div>
    </>
  )
}
