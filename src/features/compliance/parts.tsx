'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1Strong } from '../../ds/type'
export { Toast } from '../../ds/components/Toast'

/** The uppercase label that titles a block above the board. */
export function BlockLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{ ...caption1Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
      {children}
    </span>
  )
}

/** A 28px bar button. `chevron` adds the rotated caret the pickers carry. */
export function BarButton({
  children,
  onClick,
  chevron,
  title,
  minWidth = 96,
  tone,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  chevron?: boolean
  title?: string
  minWidth?: number
  tone?: 'amber'
}) {
  const [hover, hoverProps] = useHover()
  const amber = tone === 'amber'
  return (
    <div
      data-pop={chevron ? '' : undefined}
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        minWidth,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        border: `1px solid ${amber ? 'var(--warning-border)' : 'var(--border-default)'}`,
        background: amber ? 'var(--warning-bg)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        color: amber ? 'var(--warning-fg)' : 'var(--text-primary)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        // The amber button tints rather than swapping colour, so it darkens.
        filter: amber && hover ? 'brightness(.97)' : undefined,
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

/** A full-height control-height button - the page's top bar and dialog footers. */
export function TallButton({
  children,
  onClick,
  primary,
  chevron,
  title,
  disabled,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  chevron?: boolean
  title?: string
  disabled?: boolean
}) {
  const [hover, hoverProps] = useHover()
  const bg = disabled
    ? 'var(--surface-subtle)'
    : primary
      ? hover ? 'var(--primary-hover)' : 'var(--primary)'
      : hover ? 'var(--surface-subtle)' : 'var(--surface-card)'
  return (
    <div
      data-pop={chevron ? '' : undefined}
      role="button"
      tabIndex={0}
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: bg,
        border: `1px solid ${disabled ? 'var(--border-default)' : primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: disabled ? 'var(--text-disabled)' : primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span>{children}</span>
      {chevron && (
        <span style={{ display: 'inline-flex', marginLeft: 'var(--size-40)', transform: 'rotate(90deg)' }}>
          <Icon name="FnChevronRight" size={16} />
        </span>
      )}
    </div>
  )
}

/** The 1px rule that separates groups inside a toolbar. */
export function Divider() {
  return <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 var(--size-40)' }} />
}

/** The blue count pill. */
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

/** A square icon hit target in the page's top bar. */
export function IconSquare({ name, title, onClick }: { name: string; title: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-small)',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={16} />
    </div>
  )
}

/** The board's search box. Its magnifier hides once there is focus or text. */
export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div
      data-search=""
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
      style={{
        cursor: 'text',
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        width: 220,
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
      />
    </div>
  )
}

/** The 36×20 pill switch Auto-Remind uses on both tabs. */
export function Toggle({ on, onClick, title }: { on: boolean; onClick: () => void; title?: string }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: 36,
        height: 20,
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--primary)' : 'var(--neutral-400)',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 'var(--radius-circle)',
          background: 'var(--white)',
          boxShadow: 'var(--shadow-2)',
          transform: `translateX(${on ? 16 : 0}px)`,
          transition: 'transform var(--duration-faster) var(--curve-easy-ease)',
        }}
      />
    </div>
  )
}

/** A numeric text field. Non-digits never make it into the value. */
export function NumField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
      style={{
        boxSizing: 'border-box',
        width: 64,
        height: 'var(--control-height)',
        padding: '0 var(--size-60)',
        borderRadius: 'var(--radius-medium)',
        border: '1px solid var(--border-default)',
        outline: 'none',
        ...body1,
        textAlign: 'center',
        color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}
    />
  )
}

/** A sortable column head. `align` pushes Actions to the right edge. */
export function Th({
  label,
  align = 'flex-start',
  sortable,
  sortIcon,
  sortColor,
  onSort,
}: {
  label: string
  align?: CSSProperties['alignItems']
  sortable: boolean
  sortIcon: string
  sortColor: string
  onSort: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: align }}>
      <div
        role={sortable ? 'button' : undefined}
        tabIndex={sortable ? 0 : undefined}
        onClick={onSort}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-20)', cursor: 'pointer' }}
      >
        <span
          style={{ ...caption1Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
        >
          {label}
        </span>
        {sortable && (
          <span style={{ display: 'flex', color: sortColor }}>
            <Icon name={sortIcon} size={12} />
          </span>
        )}
      </div>
    </div>
  )
}

/** A round icon action at the end of a row. */
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
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={enabled ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-small)',
        cursor: enabled ? 'pointer' : 'default',
        color,
        background: hover && enabled ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={16} />
    </div>
  )
}
