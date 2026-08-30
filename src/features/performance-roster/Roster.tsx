'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { sparkFor } from './calc'
import { coachTone, signed, tierOf } from './data'
import { Avatar, Button, Checkbox, CountChip, GridHead, HoverRow, IconButton, Pill, SearchField, SortHead, TierPill } from './parts'
import { CARD, NUM, ROSTER_COLS, TILE_LABEL } from './style'
import type { RosterState, SortKey } from './useRoster'

/** The five headline figures, each a shortcut into a filtered view. */
function Tiles({ s }: { s: RosterState }) {
  const st = s.stats
  const tiles = [
    { label: 'Active Associates', value: String(st.active.length), color: 'var(--blue-700)', click: () => { s.setStatus('Active'); s.setRiskOnly(false) } },
    { label: 'At Risk', value: String(st.atRisk), color: 'var(--danger-fg)', click: () => s.setRiskOnly(true) },
    { label: 'Shift Blocked', value: String(st.blocked), color: 'var(--danger-fg)', click: s.go('Events · Open · Blocked only') },
    { label: 'Average Net', value: signed(st.average), color: st.average < 0 ? 'var(--danger-fg)' : 'var(--success-fg)', click: s.go('Events') },
    { label: 'Coaching Pending', value: String(st.pending), color: 'var(--warning-fg)', click: s.go('Events · Open') },
  ]
  return (
    <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-120)' }}>
      {tiles.map((t) => (
        <div
          key={t.label}
          data-fx=""
          tabIndex={0}
          role="button"
          onClick={t.click}
          style={{
            boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)',
            display: 'flex', flexDirection: 'column', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--size-40)' }}>
            <span style={{ flex: 1, minWidth: 0, ...TILE_LABEL, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
          </div>
          <span style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>
            {t.value}
          </span>
        </div>
      ))}
    </div>
  )
}

const HEADS: [SortKey | null, string, string][] = [
  ['name', 'Associate', 'flex-start'],
  ['net', 'Net', 'flex-end'],
  ['net2', 'Tier', 'flex-start'],
  [null, '60-Day Trend', 'flex-start'],
  ['openEv', 'Open Events', 'flex-end'],
  ['coach', 'Coaching', 'flex-start'],
  ['el', 'Eligibility', 'flex-start'],
  ['tenure', 'Tenure', 'flex-end'],
  [null, 'Actions', 'center'],
]

export function Roster({ s }: { s: RosterState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <Tiles s={s} />
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
          <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Roster</span>
          <CountChip>{s.list.length}</CountChip>
          {s.selCount > 0 && (
            <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--blue-700)' }}>{s.selCount} selected</span>
          )}
          <div style={{ flex: 1 }} />
          {s.selCount > 0 && (
            <>
              <Button kind="soft" onClick={() => s.openDlg('assign', `${s.selCount} Associates`)}>Assign Coaching</Button>
              <Button onClick={() => s.setSel({})}>Clear</Button>
              <span style={{ width: 1, alignSelf: 'stretch', margin: 'var(--size-40) var(--size-40)', background: 'var(--border-subtle)' }} />
            </>
          )}
          <FiltersButton s={s} />
          <SearchField value={s.search} onChange={s.setSearch} placeholder="Search name or ID" width={220} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 1180 }}>
            <GridHead cols={ROSTER_COLS}>
              <Checkbox on={s.allSelected} onClick={(e) => { e.stopPropagation(); s.selectAll() }} />
              {HEADS.map(([k, label, justify]) => (
                <SortHead
                  key={label}
                  label={label}
                  justify={justify}
                  active={k != null && s.sort.k === k}
                  dir={s.sort.d}
                  onClick={k ? () => s.sortBy(k) : undefined}
                />
              ))}
            </GridHead>

            {s.list.map((d) => {
              const tier = tierOf(d.net)
              const sp = sparkFor(d)
              const ct = coachTone(d.coach)
              const el = d.inactive ? 'Inactive' : d.blocked ? 'Blocked' : 'Clear'
              return (
                <HoverRow
                  key={d.tid}
                  cols={ROSTER_COLS}
                  minHeight={52}
                  background={d.inactive ? 'var(--surface-subtle)' : s.lastDa === d.name ? 'var(--blue-50)' : 'transparent'}
                  opacity={d.inactive ? '.62' : '1'}
                >
                  <Checkbox on={!!s.sel[d.tid]} onClick={(e) => { e.stopPropagation(); s.toggleSel(d.tid) }} />
                  <div
                    data-fx=""
                    tabIndex={0}
                    role="button"
                    onClick={() => s.openDetail(d.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minWidth: 0, cursor: 'pointer' }}
                  >
                    <Avatar name={d.name} size={28} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
                      <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{d.tid}</span>
                    </div>
                  </div>
                  <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: d.net < 0 ? 'var(--danger-fg)' : 'var(--text-primary)', ...NUM }}>
                    {signed(d.net)}
                  </span>
                  <span><TierPill tier={tier} /></span>
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <svg viewBox="0 0 100 28" preserveAspectRatio="none" style={{ width: 110, height: 28, overflow: 'visible' }}>
                      <line x1="0" y1={sp.zero} x2="100" y2={sp.zero} stroke="var(--border-default)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      <polyline points={sp.points} fill="none" stroke={d.net < 0 ? 'var(--red-500)' : 'var(--blue-500)'} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </div>
                  <span style={{ textAlign: 'right', ...body1, ...NUM }}>{d.openEv}</span>
                  <span>
                    {d.coach
                      ? <Pill label={d.coach} bg={ct.bg} fg={ct.fg} border={ct.bd} />
                      : <span style={{ ...body1, color: 'var(--text-secondary)' }}>-</span>}
                  </span>
                  <span>
                    <Pill
                      label={el}
                      bg={d.inactive ? 'var(--surface-subtle)' : d.blocked ? 'var(--danger-bg)' : 'var(--success-bg)'}
                      fg={d.inactive ? 'var(--text-secondary)' : d.blocked ? 'var(--danger-fg)' : 'var(--success-fg)'}
                      dot={d.inactive ? 'var(--neutral-400)' : d.blocked ? 'var(--danger-accent)' : 'var(--success-accent)'}
                    />
                  </span>
                  <span style={{ textAlign: 'right', ...body1, color: 'var(--text-secondary)', ...NUM }}>{d.tenure}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--size-40)' }}>
                    <OpenButton onClick={() => s.openDetail(d.name)} />
                    <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'kebab', d.name)} color="var(--primary)" />
                  </div>
                </HoverRow>
              )
            })}

            {s.list.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                <span style={{ ...body1, color: 'var(--text-secondary)' }}>No associates match.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function OpenButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)', border: '1px solid var(--border-default)',
        background: hover ? 'var(--blue-50)' : 'var(--surface-card)', color: 'var(--blue-700)',
        ...caption1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', cursor: 'pointer',
      }}
      {...hoverProps}
    >
      Open
    </div>
  )
}

function FiltersButton({ s }: { s: RosterState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={s.openFilters}
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: s.filterCount ? 'var(--blue-700)' : 'var(--text-primary)',
        ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}><Icon name="FnFilter" size={16} /></span>
      Filters
      {s.filterCount > 0 && (
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18,
            padding: '0 var(--size-40)', borderRadius: 'var(--radius-pill)', background: 'var(--primary)',
            color: 'var(--text-inverse)', ...caption1, fontWeight: 'var(--weight-semibold)',
          }}
        >
          {s.filterCount}
        </span>
      )}
    </div>
  )
}
