import { caption2, caption2Strong } from '../../../ds/type.js'
import { Axis, ChartCard, Plot, ReferenceRule } from '../../../ds/charts/ChartKit.jsx'
import { AXIS, BLOCK_HOURS, DAYS, PEOPLE } from '../data.js'

const H = 196

// The day's six busiest drivers, scaled from the reference day's hours so the
// shape follows whichever day is open.
export function HoursPerRoute({ dayIdx }) {
  const day = DAYS[dayIdx]
  const scale = day.hours / 324
  const people = PEOPLE.slice(0, 9)
    .filter((p) => !p.unmatched && p.pos === 'Driver')
    .slice(0, 6)

  const cols = people.map((p) => {
    const total = Math.round((p.reg + p.ot) * scale * 100) / 100
    const ot = Math.round(p.ot * scale * 100) / 100
    return { name: p.name.split(',')[0], total, ot, reg: total - ot }
  })

  return (
    <ChartCard
      title="Hours per route"
      legend={[
        { label: 'Regular', color: 'var(--blue-500)' },
        { label: 'Overtime', color: 'var(--yellow-500)' },
        { label: `${BLOCK_HOURS} hrs block`, color: 'var(--success-accent)', rule: true },
      ]}
    >
      <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
        <Axis ticks={['12 h', '6', '0']} height={H} />
        <Plot
          height={H}
          rules={<ReferenceRule top={`${((1 - BLOCK_HOURS / AXIS.dayHours) * 100).toFixed(1)}%`} />}
        >
          {cols.map((c) => (
            <div
              key={c.name}
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {/* Six bars, so every one is directly labelled instead of
                  needing a hover. */}
              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bottom: `calc(${((c.total / AXIS.dayHours) * 100).toFixed(1)}% + 4px)`,
                  ...caption2Strong,
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.total.toFixed(2)}
              </span>
              <div
                style={{
                  width: 28,
                  height: `${((c.total / AXIS.dayHours) * 100).toFixed(1)}%`,
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  borderRadius: '2px 2px 0 0',
                  overflow: 'hidden',
                }}
              >
                <div style={{ flex: c.reg, background: 'var(--blue-500)' }} />
                <div style={{ flex: c.ot, background: 'var(--yellow-500)' }} />
              </div>
            </div>
          ))}
        </Plot>
      </div>
      <div style={{ display: 'flex', marginLeft: 46 }}>
        {cols.map((c) => (
          <span
            key={c.name}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', ...caption2 }}
          >
            <span
              style={{
                color: 'var(--text-secondary)',
                fontWeight: 'var(--weight-semibold)',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {c.name}
            </span>
            <span style={{ color: 'var(--warning-fg)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {c.ot > 0 ? `+${c.ot.toFixed(2)} OT` : ' '}
            </span>
          </span>
        ))}
      </div>
    </ChartCard>
  )
}
