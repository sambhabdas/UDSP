'use client'

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, subtitle2, title3 } from '../../ds/type'
import { CARD } from './style'
export { Toast } from '../../ds/components/Toast'

export function SectionTitle({ children }: { children: ReactNode }) {
  return <span style={subtitle2}>{children}</span>
}

/** A control-height button. `primary` fills blue; `icon` sits before the label. */
export function Button({
  children,
  onClick,
  primary,
  icon,
  title,
  disabled,
  wide,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  icon?: string
  title?: string
  disabled?: boolean
  /** The decision pair is one notch taller and wider than a toolbar button. */
  wide?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{
        boxSizing: 'border-box',
        height: wide ? 40 : 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: icon ? 'var(--size-60)' : undefined,
        padding: `0 var(--size-${primary || wide ? '160' : '120'})`,
        borderRadius: 'var(--radius-medium)',
        background: primary
          ? hover && !disabled ? 'var(--primary-hover)' : 'var(--primary)'
          : hover && !disabled ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: primary ? 'var(--text-inverse)' : disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
        ...(wide ? subtitle2 : body1Strong),
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {icon && (
        <span style={{ display: 'flex', color: primary ? 'inherit' : 'var(--text-secondary)' }}>
          <Icon name={icon} size={16} />
        </span>
      )}
      {children}
    </div>
  )
}

/** The decision pair - only the recommended half is saturated. */
export function DecisionButton({
  children,
  onClick,
  recommended,
  tone,
}: {
  children: ReactNode
  onClick: () => void
  recommended: boolean
  tone: 'green' | 'red'
}) {
  const [hover, hoverProps] = useHover()
  const fill = tone === 'green' ? 'var(--green-600)' : 'var(--red-600)'
  const fillHover = tone === 'green' ? 'var(--green-700)' : 'var(--red-700)'
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-160)',
        borderRadius: 'var(--radius-medium)',
        background: recommended ? (hover ? fillHover : fill) : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${recommended ? fill : 'var(--border-default)'}`,
        color: recommended ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...subtitle2,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

/** A square glyph button - the row ⋯ and a dialog's ✕. */
export function IconButton({
  name,
  onClick,
  title,
  size = 24,
  glyph = 16,
  color = 'var(--text-secondary)',
}: {
  name: string
  onClick?: (e: React.MouseEvent) => void
  title?: string
  size?: number
  glyph?: number
  color?: string
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: size,
        height: size,
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={glyph} />
    </span>
  )
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  width = 260,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  width?: number
}) {
  const [focus, setFocus] = useState(false)
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width,
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
        transition: 'border-color var(--duration-ultra-fast) var(--curve-linear)',
      }}
    >
      {/* Drawn inline rather than pulled from the glyph table - the design file
          hand-rolls this one magnifier, thinner than the icon set's. */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-disabled)" strokeWidth="1.6" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="4.6" />
        <line x1="10.4" y1="10.4" x2="14" y2="14" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)', padding: 0 }}
      />
      {!!value.trim() && (
        <span
          role="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          style={{ display: 'inline-flex', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14 }}
        >
          ×
        </span>
      )}
    </span>
  )
}

/** A dialog / editor field. */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  width,
  align,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  prefix?: string
  width?: number
  align?: CSSProperties['textAlign']
}) {
  const [focus, setFocus] = useState(false)
  const box = (
    <span
      style={{
        boxSizing: 'border-box',
        width: width ?? '100%',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-120)',
        border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        transition: 'border-color var(--duration-ultra-fast) var(--curve-linear)',
      }}
    >
      {prefix && <span style={{ ...body1, color: 'var(--text-helper)' }}>{prefix}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          ...body1,
          fontWeight: align === 'right' ? 'var(--weight-semibold)' : undefined,
          textAlign: align,
          color: 'var(--text-primary)',
          padding: 0,
        }}
      />
    </span>
  )
  if (!label) return box
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
      <span style={caption1Strong}>{label}</span>
      {box}
    </div>
  )
}

/** A status badge. */
export function Badge({
  children,
  bg,
  border,
  fg,
  height = 24,
}: {
  children: ReactNode
  bg: string
  border: string
  fg: string
  height?: number
}) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height,
        display: 'inline-flex',
        alignItems: 'center',
        padding: `0 var(--size-${height <= 20 ? '80' : '100'})`,
        borderRadius: 'var(--radius-medium)',
        background: bg,
        border: `1px solid ${border}`,
        ...caption1Strong,
        color: fg,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** A KPI tile - glyph and label on one line, the number under it. */
export function Kpi({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div
      style={{
        ...CARD,
        padding: 'var(--size-160)',
        gap: 'var(--size-60)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name={icon} size={16} />
        </span>
        <span style={{ ...subtitle2, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <span style={{ ...title3, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

/** A sortable column head. */
export function SortHead({
  label,
  active,
  dir,
  onClick,
  style,
  align,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
  style?: CSSProperties
  align?: 'right'
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={`Sort by ${label.toLowerCase()}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        gap: align === 'right' ? 'var(--size-40)' : 'var(--size-80)',
        borderRadius: 'var(--radius-small)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        userSelect: 'none',
        color: active || hover ? 'var(--text-primary)' : 'var(--text-secondary)',
        ...style,
      }}
      {...hoverProps}
    >
      {label}
      <span style={{ display: 'flex', color: active ? undefined : 'var(--text-disabled)' }}>
        <Icon name={active ? (dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
      </span>
    </div>
  )
}

/** The inline blue link. */
export function Link({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{ ...body1, color: 'var(--text-link)', cursor: 'pointer', textDecoration: hover ? 'underline' : 'none' }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}


/** The one-line caption the tables use for a secondary cell. */
export function Muted({ children }: { children: ReactNode }) {
  return <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{children}</span>
}
