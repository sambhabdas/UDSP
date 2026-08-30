'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1Strong, caption1, caption1Strong, caption2 } from '../../ds/type'
import { Avatar, Button, Cell, DotPill, IconButton, Pill, SearchBox, SectionTitle } from './parts'
import { CARD, DIR_COLS, HEAD, LABEL, ROW } from './style'
import { initialsOf, netColor, signed, tierOf } from './calc'
import type { ToneName } from './calc'
import type { Da } from './data'
import type { GaState, SortKey, Tab } from './useGeneralAssociates'

/** [label, sort key]. A head with no key is a label, not a control. */
const HEADS: [string, SortKey | null][] = [
  ['DA', 'name'],
  ['Status', null],
  ['Qualifications', 'pos'],
  ['Vehicle Types', null],
  ['Hours PP', 'hours'],
  ['Net', 'net'],
  ['Attendance 30d', 'att'],
  ['Tenure', 'ten'],
  ['', null],
]

/**
 * The roster.
 *
 * One row per DA, sorted by name until a column head takes over. The status
 * column is the interesting one: it is not a single state but every flag that
 * applies at once, and each flag opens the profile on the tab that explains it.
 */
export function Directory({ s }: { s: GaState }) {
  return (
    <div style={CARD}>
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: 'var(--size-100) var(--size-160)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}
      >
        <SectionTitle>Associates</SectionTitle>
        <Pill title="Associates in the view">Total: {s.rows.length}</Pill>
        <div style={{ flex: 1 }} />
        <FiltersButton s={s} />
        <SearchBox value={s.q} onChange={s.setQ} placeholder="Name, ID, phone" />
        <Button pop onClick={(e) => s.openMenu(e, 'export')}>
          <span>Export</span>
          <span style={{ display: 'inline-flex', marginLeft: 'var(--size-40)', transform: 'rotate(90deg)' }}>
            <Icon name="FnChevronRight" size={16} />
          </span>
        </Button>
        <Button primary onClick={s.addDa}>
          + Add DA
        </Button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 1220 }}>
          <div style={{ ...HEAD, gridTemplateColumns: DIR_COLS, position: 'sticky', top: 0, zIndex: 2 }}>
            {HEADS.map(([label, k], i) => {
              const active = !!k && s.sort?.k === k
              return (
                <div
                  key={`${label}-${i}`}
                  role={k ? 'button' : undefined}
                  tabIndex={k ? 0 : undefined}
                  onClick={k ? () => s.onSort(k) : undefined}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-20)', cursor: 'pointer' }}
                >
                  <span style={LABEL}>{label}</span>
                  {k && (
                    <span style={{ display: 'flex', color: active ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
                      <Icon name={active ? (s.sort!.dir === 1 ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {s.rows.map((d) => (
            <DirRow key={d.id} s={s} d={d} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** The Filters control, with the applied-count badge. */
function FiltersButton({ s }: { s: GaState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={s.openFilters}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--blue-50)' : 'transparent',
        color: 'var(--blue-700)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="FnFilter" size={16} />
      <span>Filters</span>
      {!!s.filterCount && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 20,
            height: 20,
            padding: '0 var(--size-40)',
            borderRadius: 'var(--radius-circle)',
            background: 'var(--primary)',
            color: 'var(--text-inverse)',
            ...caption1Strong,
          }}
        >
          {s.filterCount}
        </span>
      )}
    </div>
  )
}

/** Every flag that applies, in the design file's order. Active is the fallback. */
function flagsOf(d: Da): { tone: ToneName; label: string; tab?: Tab; title?: string }[] {
  const chips: { tone: ToneName; label: string; tab?: Tab; title?: string }[] = []
  if (d.status === 'inactive') chips.push({ tone: 'mut', label: 'Inactive' })
  if (d.blocked) chips.push({ tone: 'danger', label: 'Blocked', tab: 'performance', title: 'An overdue blocking coaching assignment' })
  if (d.excluded) chips.push({ tone: 'mut', label: 'Excluded', tab: 'schedule', title: `${d.excluded.reason} · until ${d.excluded.until}` })
  if (d.onRoute) chips.push({ tone: 'ok', label: 'On Route', tab: 'dispatch', title: d.onRoute })
  if (d.awaitingAck) chips.push({ tone: 'warn', label: 'Awaiting Ack', tab: 'performance', title: 'Quiz passed, acknowledgement not in' })
  if (!chips.length) chips.push({ tone: 'ok', label: 'Active' })
  return chips
}

function DirRow({ s, d }: { s: GaState; d: Da }) {
  const [hover, hoverProps] = useHover()
  const tier = tierOf(d.net)
  return (
    <div
      style={{
        ...ROW,
        gridTemplateColumns: DIR_COLS,
        background: s.lastOpened === d.id ? 'var(--blue-50)' : 'var(--surface-card)',
        // An inactive record is still listed, just faded out of the way.
        opacity: d.status === 'inactive' ? 0.55 : 1,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        title="Open the profile"
        onClick={() => s.openProfile(d)}
        style={{
          boxSizing: 'border-box',
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          minWidth: 0,
          padding: '0 var(--size-60)',
          margin: '0 calc(var(--size-60) * -1)',
          borderRadius: 'var(--radius-small)',
          background: hover ? 'var(--surface-subtle)' : undefined,
          cursor: 'pointer',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <Avatar initials={initialsOf(d.name)} size={24} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ ...caption1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
          <span style={{ ...caption2, lineHeight: '12px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            {d.tr}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', minWidth: 0, flexWrap: 'wrap' }}>
        {flagsOf(d).map((c) => (
          <DotPill
            key={c.label}
            tone={c.tone}
            label={c.label}
            title={c.title}
            onClick={(e) => {
              e.stopPropagation()
              s.openProfile(d, c.tab ?? 'overview')
            }}
          />
        ))}
      </div>

      <Cell ellipsis>{d.quals.join(' · ')}</Cell>
      <Cell ellipsis color={d.veh.length ? 'var(--text-primary)' : 'var(--text-disabled)'}>
        {d.veh.length ? d.veh.join(', ') : 'None'}
      </Cell>
      <Cell body nums>{d.hoursPP} h</Cell>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', minWidth: 0 }}>
        <Cell body bold nums color={netColor(d.net)}>{signed(d.net)}</Cell>
        <DotPill tone="mut" dot={tier.dot} label={tier.label} height={18} padding="var(--size-60)" />
      </div>

      <Cell color={d.abs ? 'var(--danger-fg)' : 'var(--text-secondary)'}>
        {d.abs} abs · {d.pto} PTO
      </Cell>
      <Cell body nums color="var(--text-secondary)">{d.tenure} mo</Cell>

      <IconButton pop name="FnMore" title="Row actions" onClick={(e) => s.openMenu(e, 'row', d.id, 260)} />
    </div>
  )
}
