'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { ACK_STATEMENT, ackDay, ackMeta, ackScore, buildMix, buildTrend, criteria, rankOf } from './calc'
import { WINDOW_PRESETS, catTone, coachTone, signed, tierOf } from './data'
import type { DonutSeg } from './calc'
import {
  Avatar, Button, CardTitle, CountChip, EmptyRow, GridHead, HoverRow, IconButton,
  Pill, SearchField, SortHead,
} from './parts'
import { ACK_COLS, CARD, HEAD, NUM, PAIR } from './style'
import type { RosterState } from './useRoster'

export function Detail({ s }: { s: RosterState }) {
  const d = s.current
  const dd = s.detail
  const tier = tierOf(d.net)
  const trend = buildTrend(d, dd.marks)
  const mix = buildMix(dd)
  const crit = criteria(d, dd)
  const caption = s.winPreset === 'Custom' ? `${s.winFrom} to ${s.winTo}` : s.winPreset

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <Header s={s} tier={tier} />

      <SectionRule>Score</SectionRule>
      <div data-rsp-c2="" style={PAIR}>
        <ScoreTrend trend={trend} caption={caption} />
        <PointsMix neg={mix.neg} pos={mix.pos} caption={caption} />
      </div>

      <div data-rsp-c2="" style={PAIR}>
        <LossBars bars={mix.lossBars} caption={caption} />
        <EventMix segs={mix.mixSegs} total={mix.mixTotal} caption={caption} />
      </div>

      <SectionRule>Recognition</SectionRule>
      <div data-rsp-c2="" style={PAIR}>
        <Kudos s={s} />
        <Readiness s={s} crit={crit} />
      </div>

      <SectionRule>Coaching and Events</SectionRule>
      <div data-rsp-c2="" style={PAIR}>
        <Events s={s} />
        <Coaching s={s} />
      </div>

      <Acknowledgements s={s} />
    </div>
  )
}

function SectionRule({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', margin: 'var(--size-40) 0' }}>
      <span style={{ ...HEAD, whiteSpace: 'nowrap' }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}

function Header({ s, tier }: { s: RosterState; tier: string }) {
  const d = s.current
  const el = d.inactive ? 'Inactive' : d.blocked ? 'Blocked' : 'Clear to work'
  return (
    <div style={{ ...CARD, overflow: 'visible' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', padding: 'var(--size-160)' }}>
        <Avatar name={d.name} size={56} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', minWidth: 150, flexShrink: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minWidth: 0 }}>
            <span style={{ fontSize: 'var(--title-3-size)', lineHeight: 'var(--title-3-lh)', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {d.name}
            </span>
            <Pill
              label={el}
              bg={d.inactive ? 'var(--surface-subtle)' : d.blocked ? 'var(--danger-bg)' : 'var(--success-bg)'}
              fg={d.inactive ? 'var(--text-secondary)' : d.blocked ? 'var(--danger-fg)' : 'var(--success-fg)'}
              dot={d.inactive ? 'var(--neutral-400)' : d.blocked ? 'var(--danger-accent)' : 'var(--success-accent)'}
            />
            {tier === 'At Risk' && <Pill label="At Risk" bg="var(--danger-bg)" fg="var(--danger-fg)" dot="var(--danger-accent)" />}
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20,
                padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)',
                border: '1px solid var(--border-default)', color: 'var(--text-secondary)', ...caption1Strong,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <span style={{ display: 'flex' }}><Icon name="PgArrowTrending" size={12} /></span>
              Rank {rankOf(d.name)} of {s.stats.active.length}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
            <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{d.tid}</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 28, lineHeight: '36px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: d.net < 0 ? 'var(--danger-fg)' : 'var(--text-primary)', ...NUM }}>
            {signed(d.net)}
          </span>
          <span style={{ ...HEAD, color: 'var(--text-helper)' }}>Net Score</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-120) var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
        <WindowPicker s={s} />
        {s.winPreset === 'Custom' && (
          <>
            <DateBox value={s.winFrom} onChange={s.setWinFrom} />
            <span style={{ ...body1, color: 'var(--text-secondary)' }}>to</span>
            <DateBox value={s.winTo} onChange={s.setWinTo} />
          </>
        )}
        <div style={{ flex: 1 }} />
        <Button kind="primary" onClick={() => s.openDlg('event')}>+ Log Event</Button>
        <Button kind="primary" icon="PgBookOpen" onClick={() => s.openDlg('assign')}>Assign Coaching</Button>
        <Button kind="green" onClick={() => s.openDlg('kudo')}>Give Kudo</Button>
        <Button icon="SvExport" onClick={(e) => s.openMenu(e, 'export')}>
          Export
          <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={16} /></span>
        </Button>
        <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'headerMenu')} size={32} bordered />
      </div>
    </div>
  )
}

function DateBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      data-field=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        padding: '0 var(--size-120)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)',
      }}
    >
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} style={{ border: 'none', background: 'transparent', ...body1 }} />
    </div>
  )
}

function WindowPicker({ s }: { s: RosterState }) {
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        data-fx=""
        tabIndex={0}
        role="button"
        onClick={(e) => { e.stopPropagation(); s.setWinOpen(!s.winOpen); s.closeMenu() }}
        style={{
          boxSizing: 'border-box', height: 'var(--control-height)', minWidth: 170, display: 'flex',
          alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)',
          border: '1px solid var(--border-default)', ...body1, cursor: 'pointer',
        }}
      >
        <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{s.winPreset}</span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={16} /></span>
      </div>
      {s.winOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: 36, left: 0, right: 0, boxSizing: 'border-box', padding: 'var(--size-40)',
            background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)', zIndex: 30,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {WINDOW_PRESETS.map((p) => {
            const on = s.winPreset === p
            return (
              <div
                key={p}
                data-fx=""
                tabIndex={0}
                role="button"
                onClick={(e) => { e.stopPropagation(); s.setWinPreset(p); s.setWinOpen(false) }}
                style={{
                  boxSizing: 'border-box', minHeight: 'var(--row-height)', flexShrink: 0, display: 'flex',
                  alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-80)',
                  borderRadius: 'var(--radius-medium)', background: on ? 'var(--blue-50)' : 'transparent',
                  ...body1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  color: on ? 'var(--blue-700)' : 'var(--text-primary)', cursor: 'pointer',
                }}
              >
                <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>
                  {on && <Icon name="FnCheck" size={16} />}
                </span>
                <span>{p}</span>
              </div>
            )
          })}
        </div>
      )}
    </span>
  )
}

function PanelHead({ title, caption, right }: { title: string; caption?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160)' }}>
      <CardTitle>{title}</CardTitle>
      <div style={{ flex: 1 }} />
      {caption && <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{caption}</span>}
      {right}
    </div>
  )
}

function ScoreTrend({ trend, caption }: { trend: ReturnType<typeof buildTrend>; caption: string }) {
  return (
    <div style={CARD}>
      <PanelHead title="Score Trend" caption={caption} />
      <div style={{ display: 'flex', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-120) var(--size-160)' }}>
        <div style={{ position: 'relative', width: 40 }}>
          <span style={{ position: 'absolute', top: 20, right: 0, ...caption1, color: 'var(--text-secondary)', ...NUM }}>{signed(trend.yMax)}</span>
          {trend.showZero && (
            <span style={{ position: 'absolute', top: `calc(20px + (100% - 40px) * ${trend.zeroPct.toFixed(1)} / 100 - 8px)`, right: 0, ...caption1, color: 'var(--text-secondary)', ...NUM }}>0</span>
          )}
          <span style={{ position: 'absolute', bottom: 20, right: 0, ...caption1, color: 'var(--text-secondary)', ...NUM }}>{signed(trend.yMin)}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 20 }} />
          <div style={{ position: 'relative', flex: 1, minHeight: 150, borderLeft: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${trend.zeroPct.toFixed(1)}%`, borderTop: '1px dashed var(--border-strong)', pointerEvents: 'none' }} />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
              <polyline points={trend.points} fill="none" stroke={trend.color} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {trend.marks.map((m, i) => (
              <span
                key={i}
                title={m.title}
                style={{
                  position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, width: m.size, height: m.size,
                  margin: '-4px 0 0 -4px', borderRadius: m.radius, background: m.fill,
                  border: '1.5px solid var(--surface-card)', boxSizing: 'border-box', transform: `rotate(${m.rot})`,
                }}
              />
            ))}
            <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
              {trend.cols.map((w, i) => (
                <TrendCol key={i} val={w.val} title={w.title} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', paddingTop: 'var(--size-40)' }}>
            {trend.cols.map((w, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{w.label}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
        <LegendDot fill="var(--red-500)" round>Negative event</LegendDot>
        <LegendDot fill="var(--green-600)" round>Positive event</LegendDot>
        <LegendDot fill="var(--green-600)">Coaching completed</LegendDot>
      </div>
    </div>
  )
}

/** One hover column of the trend chart: reveals its value on hover. */
function TrendCol({ val, title }: { val: string; title: string }) {
  const [hover, hoverProps] = useHover()
  return (
    <div title={title} style={{ flex: 1, position: 'relative' }} {...hoverProps}>
      <span
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 2, ...caption1,
          color: 'var(--text-secondary)', opacity: hover ? 1 : 0, transition: 'opacity 100ms', ...NUM, whiteSpace: 'nowrap',
        }}
      >
        {val}
      </span>
    </div>
  )
}

function LegendDot({ fill, round, children }: { fill: string; round?: boolean; children: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--text-secondary)' }}>
      <span style={{ width: 8, height: 8, borderRadius: round ? '50%' : undefined, background: fill, transform: round ? undefined : 'rotate(45deg)' }} />
      {children}
    </span>
  )
}

function Donut({ segs, size, total, unit, big }: { segs: { fill: string; dash: string; off: string }[]; size: number; total: string; unit: string; big?: boolean }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 42 42" style={{ width: size, height: size, transform: 'rotate(-90deg)' }}>
        {segs.map((sg, i) => (
          <circle key={i} cx="21" cy="21" r="15.915" fill="none" stroke={sg.fill} strokeWidth="7" strokeDasharray={sg.dash} strokeDashoffset={sg.off} />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ ...(big ? subtitle1 : body1), fontWeight: 'var(--weight-semibold)', ...NUM }}>{total}</span>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{unit}</span>
      </div>
    </div>
  )
}

function MixHalf({ label, segs, total, unit }: { label: string; segs: DonutSeg[]; total: string; unit: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
      <span style={HEAD}>{label}</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-120)' }}>
        <Donut segs={segs} size={130} total={total} unit={unit} />
        <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
          {segs.map((sg) => (
            <div key={sg.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: sg.fill, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sg.label}</span>
              <span style={{ ...body1, color: sg.valColor, fontWeight: 'var(--weight-semibold)', ...NUM }}>{sg.count}</span>
            </div>
          ))}
          {segs.length === 0 && <span style={{ ...caption1, color: 'var(--text-secondary)' }}>Nothing in the window.</span>}
        </div>
      </div>
    </div>
  )
}

function PointsMix({ neg, pos, caption }: { neg: { segs: DonutSeg[]; total: number }; pos: { segs: DonutSeg[]; total: number }; caption: string }) {
  return (
    <div style={CARD}>
      <PanelHead title="Points Mix" caption={caption} />
      <div style={{ flex: 1, display: 'flex', gap: 'var(--size-200)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
        <MixHalf label="Deductions" segs={neg.segs} total={`-${neg.total}`} unit="lost" />
        <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border-subtle)' }} />
        <MixHalf label="Bonuses" segs={pos.segs} total={`+${pos.total}`} unit="gained" />
      </div>
    </div>
  )
}

function LossBars({ bars, caption }: { bars: { label: string; value: string; w: string; title: string }[]; caption: string }) {
  return (
    <div style={CARD}>
      <PanelHead title="Deductions by Standard" caption={caption} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
        {bars.map((b) => (
          <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 56px', columnGap: 'var(--size-100)', alignItems: 'center' }}>
            <span style={{ ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</span>
            <div style={{ height: 14, display: 'flex', alignItems: 'center' }}>
              <div title={b.title} style={{ width: b.w, height: 14, borderRadius: 2, background: 'var(--red-500)' }} />
            </div>
            <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--danger-fg)', ...NUM }}>{b.value}</span>
          </div>
        ))}
        {bars.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
            <span style={{ ...body1, color: 'var(--text-secondary)' }}>No deductions in the window.</span>
          </div>
        )}
      </div>
    </div>
  )
}

function EventMix({ segs, total, caption }: { segs: { label: string; count: string; fill: string; dash: string; off: string }[]; total: number; caption: string }) {
  return (
    <div style={CARD}>
      <PanelHead title="Event Mix by Category" caption={caption} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--size-200)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
        <Donut segs={segs} size={120} total={String(total)} unit="events" big />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          {segs.map((sg) => (
            <div key={sg.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: sg.fill }} />
              <span style={{ flex: 1, ...body1 }}>{sg.label}</span>
              <span style={{ ...body1, color: 'var(--text-secondary)', ...NUM }}>{sg.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Kudos({ s }: { s: RosterState }) {
  const list = s.detail.kudos
  return (
    <div style={CARD}>
      <PanelHead title="Kudos" right={<Button onClick={() => s.openDlg('kudo')}>+ Give Kudo</Button>} />
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-default)' }}>
        {list.map((k) => (
          <div key={k.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-100) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', minWidth: 0 }}>
              <span style={body1}>{k.text}</span>
              <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{k.meta}</span>
            </div>
            <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'kudoRow', k.text.slice(0, 30))} />
          </div>
        ))}
        {list.length === 0 && <EmptyRow>No kudos yet.</EmptyRow>}
      </div>
    </div>
  )
}

function Readiness({ s, crit }: { s: RosterState; crit: ReturnType<typeof criteria> }) {
  const full = crit.met === 4
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <CardTitle>Promotion Readiness</CardTitle>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 var(--size-80)',
            borderRadius: 'var(--radius-medium)',
            background: full ? 'var(--success-bg)' : 'var(--warning-bg)',
            color: full ? 'var(--success-fg)' : 'var(--warning-fg)', ...caption1Strong,
          }}
        >
          {crit.met}/4 - {full ? 'Ready' : 'Not Ready'}
        </span>
        <div style={{ flex: 1 }} />
        {full && <Button kind="primary" onClick={() => s.openDlg('promote')}>Mark Promoted</Button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-default)' }}>
        {crit.list.map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 44, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ display: 'flex', color: c.ok ? 'var(--success-fg)' : 'var(--text-disabled)' }}>
              <Icon name={c.ok ? 'FnCheck' : 'FnDismiss'} size={16} />
            </span>
            <span style={{ flex: 1, ...body1 }}>{c.label}</span>
            {c.assign && (
              <Button onClick={() => s.toastMsg(`${crit.missing} person-level assignments created - due in 30 days, non-blocking`)}>{c.assign}</Button>
            )}
            <span style={{ ...body1, color: 'var(--text-secondary)', ...NUM }}>{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Events({ s }: { s: RosterState }) {
  const d = s.current
  return (
    <div style={CARD}>
      <PanelHead
        title="Events"
        right={
          <a href="#" onClick={(e) => { e.preventDefault(); s.toastMsg(`Opening Events · ${d.name}`) }} style={body1}>All Events</a>
        }
      />
      <GridHead cols="90px 1fr 70px 130px">
        <span style={HEAD}>Date</span>
        <span style={HEAD}>Standard</span>
        <span style={{ ...HEAD, textAlign: 'right' }}>Points</span>
        <span style={HEAD}>Coaching</span>
      </GridHead>
      {s.detail.events.map((e, i) => {
        const c = catTone(e.cat)
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 70px 130px', columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 44, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{e.date}</span>
            <span><Pill label={e.standard} bg={c.bg} fg={c.fg} /></span>
            <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: e.pts < 0 ? 'var(--danger-fg)' : 'var(--success-fg)', ...NUM }}>{signed(e.pts)}</span>
            <span style={{ ...caption1, color: e.coachTone === 'danger' ? 'var(--danger-fg)' : e.coachTone === 'ok' ? 'var(--success-fg)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{e.coach}</span>
          </div>
        )
      })}
    </div>
  )
}

function Coaching({ s }: { s: RosterState }) {
  const d = s.current
  const list = s.detail.coaching
  return (
    <div style={CARD}>
      <PanelHead
        title="Coaching"
        right={<a href="#" onClick={(e) => { e.preventDefault(); s.toastMsg(`Opening Events · Open · ${d.name}`) }} style={body1}>History</a>}
      />
      <GridHead cols="1fr 140px 100px 44px">
        <span style={HEAD}>Module</span>
        <span style={HEAD}>Status</span>
        <span style={{ ...HEAD, textAlign: 'right' }}>Due</span>
        <span />
      </GridHead>
      {list.map((c) => {
        const t = coachTone(c.status)
        return (
          <div key={c.module} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 44px', columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 44, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.module}</span>
            <span><Pill label={c.status} bg={t.bg} fg={t.fg} border={t.bd} /></span>
            <span style={{ textAlign: 'right', ...body1, color: c.status === 'Overdue' ? 'var(--danger-fg)' : 'var(--text-secondary)', ...NUM, whiteSpace: 'nowrap' }}>{c.due}</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'coachRow', c.module)} />
            </div>
          </div>
        )
      })}
      {list.length === 0 && <EmptyRow>No coaching assigned.</EmptyRow>}
    </div>
  )
}

function Acknowledgements({ s }: { s: RosterState }) {
  const q = s.ackQ.trim().toLowerCase()
  const dir = s.ackSort.d === 'asc' ? 1 : -1
  const rows = s.detail.acks
    .filter((a) => !q || `${a.module} ${a.standard}`.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => {
      const k = s.ackSort.k
      const v = k === 'module'
        ? (a.module > b.module ? 1 : -1)
        : k === 'completed'
          ? ackDay(a.completed) - ackDay(b.completed)
          : ackScore(a.score) - ackScore(b.score)
      return v * dir
    })

  const heads: [('module' | 'completed' | 'score') | null, string, string][] = [
    ['module', 'Module', 'flex-start'],
    [null, 'Standard', 'flex-start'],
    ['completed', 'Completed', 'flex-start'],
    ['score', 'Score', 'flex-end'],
    [null, 'Acknowledged', 'flex-start'],
  ]

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
        <CardTitle>Coaching and Acknowledgements</CardTitle>
        <CountChip>{rows.length}</CountChip>
        <div style={{ flex: 1 }} />
        <SearchField value={s.ackQ} onChange={s.setAckQ} placeholder="Search module or standard" width={220} />
      </div>
      <GridHead cols={ACK_COLS}>
        {heads.map(([k, label, justify]) => (
          <SortHead
            key={label}
            label={label}
            justify={justify}
            active={k != null && s.ackSort.k === k}
            dir={s.ackSort.d}
            onClick={k ? () => s.sortAcksBy(k) : undefined}
          />
        ))}
      </GridHead>
      {rows.map((a, i) => {
        const open = s.expandAck === i
        return (
          <div key={a.module} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
            <HoverRow cols={ACK_COLS} onClick={() => s.setExpandAck(open ? null : i)} background={open ? 'var(--surface-subtle)' : 'transparent'}>
              <span style={{ ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.module}</span>
              <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{a.standard}</span>
              <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{a.completed}</span>
              <span style={{ textAlign: 'right', ...body1, ...NUM }}>{a.score}</span>
              <span style={{ ...body1, color: a.ack.includes('manually') ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{a.ack}</span>
            </HoverRow>
            {open && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: 'var(--size-120) var(--size-160)', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={body1}>{ACK_STATEMENT}</span>
                <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{ackMeta(a)}</span>
              </div>
            )}
          </div>
        )
      })}
      {rows.length === 0 && <EmptyRow>No completed coaching yet.</EmptyRow>}
    </div>
  )
}
