'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, subtitle1 } from '../../ds/type'
import type { Filters, RateCardsState } from './useRateCards'

const GROUPS: { key: keyof Filters; label: string; options: (s: RateCardsState) => string[] }[] = [
  { key: 'hours', label: 'Hours', options: (s) => s.hoursOptions },
  { key: 'paidBy', label: 'Paid by', options: () => ['Amazon', 'DSP'] },
  { key: 'to', label: 'To', options: () => ['Open', 'Bounded', 'Locked'] },
]

/** A right-hand drawer. Nothing it changes reaches the table until Apply, so a
 *  half-built filter never churns the list underneath you. */
export function FilterPanel({ s }: { s: RateCardsState }) {
  return (
    <div
      onClick={() => s.setFpOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 60,
      }}
    >
      <div
        data-dialog-drawer=""
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Filters"
        style={{
          boxSizing: 'border-box',
          width: 360,
          height: '100%',
          background: 'var(--surface-raised)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-120)',
            padding: '0 var(--size-160)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span style={subtitle1}>Filters</span>
          <div style={{ flex: 1 }} />
          <CloseX onClick={() => s.setFpOpen(false)} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {GROUPS.map((g) => (
            <Group key={g.key} group={g} s={s} />
          ))}
        </div>

        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-160)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <TextButton onClick={s.clearDraft}>Clear All</TextButton>
          <div style={{ flex: 1 }} />
          <PanelButton onClick={() => s.setFpOpen(false)}>Cancel</PanelButton>
          <PanelButton primary onClick={s.applyFilters}>
            Apply
          </PanelButton>
        </div>
      </div>
    </div>
  )
}

function Group({ group, s }: { group: (typeof GROUPS)[number]; s: RateCardsState }) {
  const [hover, hoverProps] = useHover()
  const open = !!s.fpSec[group.key]
  const picked = s.pf[group.key]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => s.toggleSection(group.key)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          minHeight: 48,
          padding: '0 var(--size-160)',
          background: hover ? 'var(--surface-subtle)' : 'transparent',
          cursor: 'pointer',
        }}
        {...hoverProps}
      >
        <span style={body1Strong}>{group.label}</span>
        {picked && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 18,
              padding: '0 var(--size-60)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--blue-50)',
              color: 'var(--blue-700)',
              ...caption1,
              fontWeight: 'var(--weight-semibold)',
            }}
          >
            1
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span
          style={{
            display: 'flex',
            color: 'var(--text-secondary)',
            transform: `rotate(${open ? '180deg' : '0deg'})`,
            transition: 'transform 120ms',
          }}
        >
          <Icon name="SvChevron" size={16} />
        </span>
      </div>
      {open && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-80)',
            padding: '0 var(--size-160) var(--size-160) var(--size-160)',
          }}
        >
          {group.options(s).map((o) => (
            <Option
              key={o}
              label={o}
              count={s.countFor(group.key, o)}
              on={picked === o}
              onPick={() => s.toggleDraft(group.key, o)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Option({
  label,
  count,
  on,
  onPick,
}: {
  label: string
  count: number
  on: boolean
  onPick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        minHeight: 28,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          boxSizing: 'border-box',
          width: 16,
          height: 16,
          borderRadius: 'var(--radius-small)',
          border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: on ? 'var(--primary)' : 'var(--surface-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-inverse)',
        }}
      >
        {on && <Icon name="FnCheck" size={12} />}
      </span>
      <span style={{ flex: 1, ...body1 }}>{label}</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </span>
    </div>
  )
}

function CloseX({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
      }}
      {...hoverProps}
    >
      <Icon name="FnDismiss" size={20} />
    </div>
  )
}

function TextButton({ children, onClick }: { children?: React.ReactNode; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 'var(--control-height)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: 'var(--text-link)',
        ...body1Strong,
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function PanelButton({
  children,
  onClick,
  primary,
}: {
  children?: React.ReactNode
  onClick: () => void
  primary?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-160)',
        borderRadius: 'var(--radius-medium)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        background: primary
          ? hover
            ? 'var(--primary-hover)'
            : 'var(--primary)'
          : hover
            ? 'var(--surface-subtle)'
            : 'var(--surface-card)',
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1Strong,
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}
