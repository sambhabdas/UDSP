import { Icon } from '../../ds/icons/Icon.jsx'
import { StatusPill } from '../../ds/components/Button.jsx'
import { Menu, MenuItem } from '../../ds/components/Overlay.jsx'
import { useHover } from '../../ds/useHover.js'
import { body1, body1Strong } from '../../ds/type.js'
import { DAYS, GRAINS, WEEK_LABEL } from './data.js'
import { badge, statusOf } from './calc.js'

const control = (hover) => ({
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

function Dropdown({ label, width, open, onToggle, children, leading, strong }) {
  const [hover, hoverProps] = useHover()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div onClick={onToggle} style={{ ...control(hover), width }} {...hoverProps}>
        {leading}
        <span style={{ flex: 1, ...(strong ? body1Strong : body1) }}>{label}</span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={12} />
        </span>
      </div>
      {open && children}
    </span>
  )
}

// Prev / next stepper — one control, disabled ends greyed rather than hidden.
function Stepper({ label, onPrev, onNext, canPrev, canNext }) {
  const arrow = (dir, enabled, onClick) => (
    <StepArrow dir={dir} enabled={enabled} onClick={enabled ? onClick : undefined} />
  )
  return (
    <div
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
      }}
    >
      {arrow('prev', canPrev, onPrev)}
      <span
        style={{
          padding: '0 var(--size-160)',
          ...body1Strong,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {label}
      </span>
      {arrow('next', canNext, onNext)}
    </div>
  )
}

function StepArrow({ dir, enabled, onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        width: 32,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: enabled ? 'var(--text-secondary)' : 'var(--text-disabled)',
        cursor: enabled ? 'pointer' : 'default',
        background: hover && enabled ? 'var(--surface-subtle)' : 'transparent',
        [dir === 'prev' ? 'borderRight' : 'borderLeft']: '1px solid var(--border-subtle)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', transform: `rotate(${dir === 'prev' ? 90 : -90}deg)` }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </span>
  )
}

function PlainButton({ children, onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div onClick={onClick} style={{ ...control(hover), ...body1Strong }} {...hoverProps}>
      {children}
    </div>
  )
}

const dateInput = {
  boxSizing: 'border-box',
  height: 'var(--control-height)',
  padding: '0 var(--size-100)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  background: 'var(--surface-card)',
  fontFamily: 'var(--font-family)',
  ...body1Strong,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--text-primary)',
  outline: 'none',
}

// Sticky above the page so the grain, the range and Export stay reachable
// however far down the reader scrolls.
export function Toolbar({ s }) {
  const { isDay, dayIdx } = s
  const day = DAYS[dayIdx]
  const grainLabel = isDay ? 'Day' : s.grain
  const isCustom = s.isWeek && s.grain === 'Custom'
  const dayStatus = statusOf(dayIdx, s.locked)
  const b = badge(dayStatus)

  const navLabel = isDay
    ? day.long
    : s.weekOffset === 0
      ? WEEK_LABEL
      : s.weekOffset < 0
        ? 'Sun Jul 19 - Sat Jul 25'
        : 'Sun Aug 2 - Sat Aug 8'

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
      <Dropdown
        label={grainLabel}
        width={180}
        strong
        open={s.menu === 'grain'}
        onToggle={s.toggleMenu('grain')}
      >
        <Menu top={36} width={180} left={0}>
          {GRAINS.map((g) => (
            <MenuItem
              key={g}
              selected={g === grainLabel}
              onClick={s.pickGrain(g)}
              trailing={g === grainLabel ? <Icon name="FnCheck" size={12} color="var(--primary)" /> : null}
            >
              {g}
            </MenuItem>
          ))}
        </Menu>
      </Dropdown>

      {isCustom ? (
        <>
          <input
            type="date"
            value={s.custom.from}
            onChange={(e) => s.setCustom((c) => ({ ...c, from: e.target.value }))}
            style={dateInput}
          />
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>-</span>
          <input
            type="date"
            value={s.custom.to}
            onChange={(e) => s.setCustom((c) => ({ ...c, to: e.target.value }))}
            style={dateInput}
          />
        </>
      ) : (
        <Stepper
          label={navLabel}
          canPrev={isDay ? dayIdx > 0 : s.weekOffset > -1}
          canNext={isDay ? dayIdx < DAYS.length - 1 : s.weekOffset < 1}
          onPrev={() => {
            if (isDay) {
              s.setDayIdx(dayIdx - 1)
              s.setTip(null)
            } else s.setWeekOffset(s.weekOffset - 1)
          }}
          onNext={() => {
            if (isDay) {
              s.setDayIdx(dayIdx + 1)
              s.setTip(null)
            } else s.setWeekOffset(s.weekOffset + 1)
          }}
        />
      )}

      {isDay && (
        <StatusPill tone={[b.bg, b.border, b.fg, b.dot]}>{b.label}</StatusPill>
      )}

      <div style={{ flex: 1 }} />

      {isDay && (
        <PlainButton
          onClick={() => {
            const wasLocked = dayStatus === 'locked'
            s.toggleLock()
            s.toast(
              wasLocked
                ? `Day unlocked · ${day.full} · logged`
                : dayIdx === 3
                  ? 'Day locked · 1 code still unlinked'
                  : `Day locked · ${day.full}`,
            )
          }}
        >
          {dayStatus === 'locked' ? 'Unlock day' : 'Lock day'}
        </PlainButton>
      )}

      <Dropdown
        label="Export"
        width={124}
        strong
        open={s.menu === 'export'}
        onToggle={s.toggleMenu('export')}
        leading={
          <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
            <Icon name="SvExport" size={16} />
          </span>
        }
      >
        <Menu top={36} width={124}>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation()
              s.closeMenus()
              s.toast(
                `Export started · Profit Projection · ${isDay ? day.full : WEEK_LABEL} (pdf)`,
              )
            }}
          >
            PDF
          </MenuItem>
        </Menu>
      </Dropdown>
    </div>
  )
}
