import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { Menu, MenuItem } from '../../ds/components/Overlay'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, caption2Strong } from '../../ds/type'
import { ALL, COMPARE_MODES, INPUT_ROWS, RANGES } from './data'
import { badge, fmtRangeNum } from './calc'
import type { ProfitabilityState } from './useProfitability'

// The picker is 340px by design; `maxWidth` keeps it inside a narrow pane.
const PICKER_W = 340

const control = (hover: boolean): CSSProperties => ({
  boxSizing: 'border-box',
  height: 'var(--control-height)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-80)',
  padding: '0 var(--size-120)',
  borderRadius: 'var(--radius-medium)',
  background: 'var(--surface-card)',
  border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
  ...body1,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transition: 'border-color var(--motion-hover)',
})

function Control({
  children,
  width,
  maxWidth,
  onClick,
}: {
  children?: ReactNode
  width?: number | string
  maxWidth?: number | string
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div onClick={onClick} style={{ ...control(hover), width, maxWidth }} {...hoverProps}>
      {children}
    </div>
  )
}

const chevron = (
  <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
    <Icon name="SvChevron" size={12} />
  </span>
)

// Sixteen periods is enough that the picker searches rather than scrolls.
// Each row states its id, its dates, and a dot for anything not simply closed.
function PeriodPicker({ s }: { s: ProfitabilityState }) {
  const open = s.menu === 'period'
  const q = s.periodQ.trim().toLowerCase()
  const items = ALL.slice()
    .reverse()
    .filter((p) => !q || `${p.id} ${p.year} ${fmtRangeNum(p.start)}`.toLowerCase().includes(q))

  const label = `${s.selected.year} · ${s.selected.id} · ${fmtRangeNum(s.selected.start)}`

  return (
    <span style={{ position: 'relative', display: 'flex', minWidth: 0, maxWidth: '100%' }}>
      {open ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            boxSizing: 'border-box',
            height: 'var(--control-height)',
            width: PICKER_W,
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: '0 var(--size-120)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-card)',
            border: '1px solid var(--primary)',
            ...body1,
          }}
        >
          <span style={{ display: 'flex', color: 'var(--text-secondary)', flexShrink: 0 }}>
            <Icon name="SearchGlyph" size={16} />
          </span>
          <input
            autoFocus
            value={s.periodQ}
            onChange={(e) => s.setPeriodQ(e.target.value)}
            placeholder={label}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-family)',
              ...body1,
              color: 'var(--text-primary)',
              padding: 0,
            }}
          />
          <span
            onClick={s.toggleMenu('period')}
            style={{ display: 'flex', color: 'var(--text-secondary)', cursor: 'pointer', transform: 'rotate(180deg)' }}
          >
            <Icon name="SvChevron" size={12} />
          </span>
        </div>
      ) : (
        <Control width={PICKER_W} maxWidth="100%" onClick={s.toggleMenu('period')}>
          <span style={{ color: 'var(--text-secondary)' }}>Period</span>
          <span style={{ flex: 1, ...body1Strong, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
          {chevron}
        </Control>
      )}

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 36,
            left: 0,
            boxSizing: 'border-box',
            width: PICKER_W,
            maxWidth: '100%',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              maxHeight: 320,
              overflow: 'auto',
              padding: 'var(--size-40)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-20)',
            }}
          >
            {items.map((p) => {
              const tone = p.projected ? badge('projected') : p.prov ? badge('provisional') : null
              const selected = p.id === s.sel
              return (
                <PeriodRow
                  key={p.id}
                  pid={`${p.year} · ${p.id}`}
                  dates={fmtRangeNum(p.start)}
                  dot={tone ? tone.dot : 'transparent'}
                  tag={p.projected ? 'Current' : p.prov ? 'Provisional' : ''}
                  selected={selected}
                  onClick={(e) => {
                    e.stopPropagation()
                    s.pickPeriod(p.id)
                  }}
                />
              )
            })}
            {items.length === 0 && (
              <div
                style={{
                  boxSizing: 'border-box',
                  padding: 'var(--size-120)',
                  textAlign: 'center',
                  ...caption1,
                  color: 'var(--text-helper)',
                }}
              >
                No pay periods match
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  )
}

function PeriodRow({
  pid,
  dates,
  dot,
  tag,
  selected,
  onClick,
}: {
  pid: string
  dates: string
  dot: string
  tag: string
  selected: boolean
  onClick: (e: MouseEvent<HTMLDivElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--row-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        ...body1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ width: 76, flexShrink: 0, ...body1Strong, fontVariantNumeric: 'tabular-nums' }}>
        {pid}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        }}
      >
        {dates}
      </span>
      <span
        title={tag}
        style={{ width: 8, height: 8, flexShrink: 0, borderRadius: 'var(--radius-circle)', background: dot }}
      />
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', justifyContent: 'flex-end', color: 'var(--primary)' }}>
        {selected && <Icon name="FnCheck" size={12} />}
      </span>
    </div>
  )
}

// Which of the current period's inputs are real and which are still standing
// in — the reason the headline reads "projected".
function InputsPopover({ s }: { s: ProfitabilityState }) {
  const open = s.menu === 'inputs'
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <Control width={240} onClick={s.toggleMenu('inputs')}>
        <span style={{ flex: 1, ...body1Strong }}>Inputs</span>
        <span
          style={{
            boxSizing: 'border-box',
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-circle)',
            border: '1px solid var(--border-strong)',
            ...caption2Strong,
            color: 'var(--text-secondary)',
          }}
        >
          ?
        </span>
      </Control>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 36,
            left: 0,
            boxSizing: 'border-box',
            width: 240,
            padding: 'var(--size-120)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-callout)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-80)',
          }}
        >
          <span style={{ ...caption1Strong }}>
            P14 · {fmtRangeNum(ALL[ALL.length - 1].start)}
          </span>
          {INPUT_ROWS.map((r) => {
            const tone = badge(r.kind)
            return (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--size-80)',
                  paddingTop: 'var(--size-80)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ flex: 1, minWidth: 0, ...caption1Strong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.name}
                </span>
                <span
                  style={{
                    boxSizing: 'border-box',
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-60)',
                    padding: '0 var(--size-80)',
                    borderRadius: 'var(--radius-medium)',
                    background: tone.bg,
                    border: `1px solid ${tone.border}`,
                    ...caption1Strong,
                    color: tone.fg,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: tone.dot, flexShrink: 0 }} />
                  {r.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </span>
  )
}

export function Toolbar({ s }: { s: ProfitabilityState }) {
  const compareLabel = Object.fromEntries(COMPARE_MODES)[s.compare]

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 45,
        background: 'var(--surface-page)',
        padding: 'var(--size-40) var(--size-40) var(--size-80)',
        margin: '0 calc(-1 * var(--size-40))',
        boxShadow: 'var(--shadow-2)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--size-60) var(--size-80)',
      }}
    >
      <PeriodPicker s={s} />

      <span style={{ position: 'relative', display: 'flex' }}>
        <Control onClick={s.toggleMenu('range')}>
          <span style={{ ...body1Strong }}>Last {s.range} periods</span>
          {chevron}
        </Control>
        {s.menu === 'range' && (
          <Menu top={36} left={0} minWidth={180}>
            {RANGES.map(([value, label]) => (
              <MenuItem
                key={value}
                selected={s.range === value}
                onClick={(e) => {
                  e.stopPropagation()
                  s.setRange(value)
                  s.setMenu(null)
                }}
                trailing={s.range === value ? <Icon name="FnCheck" size={12} color="var(--primary)" /> : null}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
        )}
      </span>

      <InputsPopover s={s} />

      <div style={{ flex: 1 }} />

      <span style={{ position: 'relative', display: 'flex' }}>
        <Control onClick={s.toggleMenu('compare')}>
          <span style={{ color: 'var(--text-secondary)' }}>Compare</span>
          <span style={{ ...body1Strong }}>{compareLabel}</span>
          {chevron}
        </Control>
        {s.menu === 'compare' && (
          <Menu top={36} minWidth={210}>
            {COMPARE_MODES.map(([value, label]) => (
              <MenuItem
                key={value}
                selected={s.compare === value}
                onClick={(e) => {
                  e.stopPropagation()
                  s.setCompare(value)
                  s.setMenu(null)
                }}
                trailing={s.compare === value ? <Icon name="FnCheck" size={12} color="var(--primary)" /> : null}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
        )}
      </span>

      <span style={{ position: 'relative', display: 'flex' }}>
        <Control width={104} onClick={s.toggleMenu('export')}>
          <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
            <Icon name="SvExport" size={16} />
          </span>
          <span style={{ ...body1Strong }}>Export</span>
        </Control>
        {s.menu === 'export' && (
          <Menu top={36} width={104}>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation()
                s.setMenu(null)
                s.toast('Export started · Profitability · PDF')
              }}
            >
              PDF
            </MenuItem>
          </Menu>
        )}
      </span>
    </div>
  )
}
