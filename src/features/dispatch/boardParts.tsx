'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1Strong, subtitle2 } from '../../ds/type'
import { BARE_INPUT } from './ui'

/** The uppercase label above each block: Caption 1 semibold, .6px, secondary. */
export function BlockLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        ...caption1Strong,
        letterSpacing: '.6px',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </span>
  )
}

/** The 28px control every board toolbar is made of. Primary is filled blue;
 *  the default is a hairline on card. */
/**
 * Every bar button in the design file is one of six colour recipes. Filled
 * variants darken on hover the way the primary does; outlined ones tint their
 * own background instead of falling back to the neutral hover.
 */
type Tone = 'default' | 'green' | 'green-solid' | 'amber' | 'blue'

const TONES: Record<Tone | 'primary' | 'disabled', { bg: string; hoverBg: string; border: string; fg: string }> = {
  default: {
    bg: 'var(--surface-card)', hoverBg: 'var(--surface-subtle)',
    border: 'var(--border-default)', fg: 'var(--text-primary)',
  },
  primary: {
    bg: 'var(--primary)', hoverBg: 'var(--primary-hover)',
    border: 'var(--primary)', fg: 'var(--text-inverse)',
  },
  green: {
    bg: 'var(--surface-card)', hoverBg: 'var(--success-bg)',
    border: 'var(--success-border)', fg: 'var(--success-fg)',
  },
  'green-solid': {
    bg: 'var(--success-fg)', hoverBg: 'var(--success-fg)',
    border: 'var(--success-fg)', fg: 'var(--text-inverse)',
  },
  amber: {
    bg: 'var(--surface-card)', hoverBg: 'var(--warning-bg)',
    border: 'var(--warning-border)', fg: 'var(--warning-fg)',
  },
  blue: {
    bg: 'var(--surface-card)', hoverBg: 'var(--blue-50)',
    border: 'var(--blue-200)', fg: 'var(--blue-700)',
  },
  disabled: {
    bg: 'var(--surface-subtle)', hoverBg: 'var(--surface-subtle)',
    border: 'var(--border-default)', fg: 'var(--text-disabled)',
  },
}

export function BarButton({
  children,
  onClick,
  primary,
  tone,
  chevron,
  title,
  disabled,
}: {
  children?: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  tone?: Tone
  chevron?: boolean
  title?: string
  disabled?: boolean
}) {
  const [hover, hoverProps] = useHover()
  const t = disabled ? TONES.disabled : primary ? TONES.primary : TONES[tone ?? 'default']
  const bg = hover && !disabled ? t.hoverBg : t.bg
  const border = t.border
  const fg = t.fg

  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        minWidth: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        background: bg,
        border: `1px solid ${border}`,
        color: fg,
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span>{children}</span>
      {chevron && (
        <span style={{ display: 'inline-flex', marginLeft: 'var(--size-40)', transform: 'rotate(90deg)' }}>
          <Icon name="FnChevronRight" size={12} />
        </span>
      )}
    </div>
  )
}

/** A blue count pill - "Total: 31". */
export function CountPill({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--blue-50)',
        border: '1px solid var(--blue-200)',
        color: 'var(--blue-700)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** An amber count chip that also filters - "Issues: 4". */
export function IssueChip({
  children,
  on,
  onClick,
}: {
  children: ReactNode
  on?: boolean
  onClick?: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--blue-100)' : 'var(--warning-bg)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--warning-border)'}`,
        color: on ? 'var(--blue-700)' : 'var(--warning-fg)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  )
}

export function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: 'var(--border-subtle)',
        margin: '0 var(--size-40)',
        flexShrink: 0,
      }}
    />
  )
}

export function BarSearch({
  value,
  onChange,
  placeholder,
  width = 220,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  width?: number | string
}) {
  return (
    <div
      data-search=""
      style={{
        cursor: 'text',
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        width,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        border: '1px solid var(--border-default)',
        background: 'var(--surface-card)',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--text-disabled)' }}>
        <Icon name="FnSearch" size={16} />
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={BARE_INPUT}
      />
    </div>
  )
}

/** A control-height square holding one glyph - the group and columns pickers. */
export function IconButton({
  name,
  onClick,
  title,
}: {
  name: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  title?: string
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        width: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={16} />
    </div>
  )
}

/** The 20px chevron that opens and shuts a section. */
export function SectionChevron({ open, onClick }: { open: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title="Collapse or expand"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        flexShrink: 0,
        transform: `rotate(${open ? '90deg' : '0deg'})`,
        transition: 'transform .12s ease',
      }}
      {...hoverProps}
    >
      <Icon name="FnChevronRight" size={16} />
    </div>
  )
}

/**
 * A board section: a card whose header carries the chevron, the title, its own
 * buttons, its counts, a filter and a primary action - the shape every block on
 * Load Out repeats.
 */
export function SectionCard({
  title,
  open,
  onToggle,
  buttons,
  pills,
  search,
  primary,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  buttons?: ReactNode
  pills?: ReactNode
  search?: ReactNode
  primary?: ReactNode
  children?: ReactNode
}) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        flexShrink: 0,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: 'var(--size-100) var(--size-160)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          rowGap: 'var(--size-60)',
        }}
      >
        <SectionChevron open={open} onClick={onToggle} />
        <span style={subtitle2}>{title}</span>
        {buttons && (
          <>
            <Divider />
            {buttons}
          </>
        )}
        {pills && (
          <>
            <Divider />
            {pills}
          </>
        )}
        <div style={{ flex: 1 }} />
        {search}
        {primary}
      </div>
      {open && children}
    </div>
  )
}

/** A column heading: uppercase Caption 1 semibold with an optional sort glyph. */
export function Th({
  label,
  align,
  sortable,
  active,
  dir,
  onSort,
}: {
  label: string
  align?: 'flex-start' | 'flex-end' | 'center'
  sortable?: boolean
  active?: boolean
  dir?: 'asc' | 'desc'
  onSort?: () => void
}) {
  return (
    <div
      role={sortable ? 'button' : undefined}
      tabIndex={sortable ? 0 : undefined}
      onClick={sortable ? onSort : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-20)',
        justifyContent: align ?? 'flex-start',
        cursor: sortable ? 'pointer' : 'default',
      }}
    >
      <span
        style={{
          ...caption1Strong,
          letterSpacing: '.6px',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      {sortable && (
        <span style={{ display: 'flex', color: active ? 'var(--primary)' : 'var(--text-disabled)' }}>
          <Icon name={active ? (dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
        </span>
      )}
    </div>
  )
}

/** A status pill with a dot - never colour alone. */
export function StatusPill({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'green' | 'grey' | 'amber' | 'red'
}) {
  const map = {
    green: ['var(--success-bg)', 'var(--success-border)', 'var(--success-fg)', 'var(--success-accent)'],
    grey: ['var(--surface-subtle)', 'var(--border-default)', 'var(--text-secondary)', 'var(--neutral-400)'],
    amber: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)', 'var(--warning-accent)'],
    red: ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger-fg)', 'var(--danger-accent)'],
  }[tone]
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-pill)',
        background: map[0],
        border: `1px solid ${map[1]}`,
        color: map[2],
        ...caption1Strong,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: map[3], flexShrink: 0 }} />
      {children}
    </span>
  )
}

/** The small round action glyphs at the end of a row. */
export function RowIcon({
  name,
  title,
  color,
  enabled = true,
  onClick,
}: {
  name: string
  title: string
  color: string
  enabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        if (enabled) onClick?.(e)
      }}
      style={{
        width: 24,
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: hover && enabled ? 'var(--surface-subtle)' : 'transparent',
        color: enabled ? color : 'var(--text-disabled)',
        cursor: enabled ? 'pointer' : 'default',
        flexShrink: 0,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={16} />
    </span>
  )
}
