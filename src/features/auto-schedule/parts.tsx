'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { LABEL } from './style'
import { Toast as BaseToast } from '../../ds/components/Toast'

/** A collapsible section card - every panel on both tabs is one of these. */
export function Section({
  title,
  open,
  onToggle,
  lead,
  action,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  /** Sits immediately after the title, before the spacer. */
  lead?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div
        onClick={onToggle}
        onMouseDown={(e) => e.preventDefault()}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-100) var(--size-160)', cursor: 'pointer', userSelect: 'none', flexWrap: 'wrap' }}
      >
        <span style={subtitle2}>{title}</span>
        {lead}
        <span style={{ flex: 1 }} />
        {action}
        <span style={{ display: 'flex', color: 'var(--text-secondary)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform var(--motion-move)' }}>
          <Icon name="SvChevron" size={12} />
        </span>
      </div>
      {open && children}
    </div>
  )
}

export function Button({
  children,
  onClick,
  primary,
  danger,
  title,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  primary?: boolean
  danger?: boolean
  title?: string
}) {
  const [hover, hoverProps] = useHover()
  const fill = danger ? 'var(--danger-accent)' : 'var(--primary)'
  const fillHover = danger ? 'var(--danger-fg)' : 'var(--primary-hover)'
  const filled = primary || danger
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: `0 var(--size-${filled ? '120' : '100'})`,
        borderRadius: 'var(--radius-small)',
        background: filled ? (hover ? fillHover : fill) : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: filled ? undefined : '1px solid var(--border-default)',
        color: filled ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...caption1Strong,
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

export function DropTrigger({
  children,
  onClick,
  width,
  strong,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
  width?: number
  strong?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        width,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
        ...(strong ? caption1Strong : caption1),
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>{children}</span>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </div>
  )
}

export function Menu({ children, width, top = 31, z = 40 }: { children: ReactNode; width: number; top?: number; z?: number }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top,
        left: 0,
        boxSizing: 'border-box',
        width,
        padding: 'var(--size-40)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        zIndex: z,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

export function MenuRow({ children, onClick, selected }: { children: ReactNode; onClick: (e: React.MouseEvent) => void; selected?: boolean }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : selected ? 'var(--blue-50)' : 'transparent',
        ...caption1,
        fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: selected ? 'var(--blue-700)' : 'var(--text-primary)',
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

/** A 14px tick. A rule's tick can be switched; a fixed policy's cannot. */
export function Tick({
  on,
  fixed,
  title,
  onClick,
}: {
  on: boolean
  fixed?: boolean
  title?: string
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <span
      onClick={onClick}
      title={title}
      style={{
        boxSizing: 'border-box',
        width: 14,
        height: 14,
        flexShrink: 0,
        borderRadius: 'var(--radius-small)',
        border: `1px solid ${fixed ? 'var(--border-default)' : on ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: fixed ? 'var(--surface-subtle)' : on ? 'var(--primary)' : 'var(--surface-card)',
        color: fixed ? 'var(--text-secondary)' : 'var(--text-inverse)',
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: fixed ? 'default' : 'pointer',
      }}
    >
      {on || fixed ? '✓' : ''}
    </span>
  )
}

/** A 24px pick-one chip. */
export function Seg({ children, on, onClick, fixed }: { children: ReactNode; on: boolean; onClick?: () => void; fixed?: boolean }) {
  return (
    <span
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: fixed ? (on ? 'var(--neutral-100)' : 'var(--surface-card)') : on ? 'var(--primary-soft)' : 'var(--surface-card)',
        border: `1px solid ${fixed ? (on ? 'var(--border-default)' : 'var(--border-subtle)') : on ? 'var(--primary)' : 'var(--border-default)'}`,
        ...caption1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: fixed ? (on ? 'var(--text-secondary)' : 'var(--text-disabled)') : on ? 'var(--primary)' : 'var(--text-primary)',
        cursor: fixed ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export function Input({
  value,
  onChange,
  placeholder,
  center,
  color,
  border,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  center?: boolean
  color?: string
  border?: string
}) {
  const [focus, setFocus] = useState(false)
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: center ? 26 : 28,
        display: 'flex',
        alignItems: 'center',
        padding: center ? 0 : '0 var(--size-100)',
        border: `1px solid ${focus ? 'var(--border-focus)' : border ?? 'var(--border-default)'}`,
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
        transition: 'border-color var(--duration-ultra-fast) var(--curve-linear)',
      }}
    >
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          ...caption1,
          color: color ?? 'var(--text-primary)',
          padding: 0,
          textAlign: center ? 'center' : undefined,
          fontVariantNumeric: center ? 'tabular-nums' : undefined,
        }}
      />
    </span>
  )
}

export function Field({ label, children, flex }: { label: string; children: ReactNode; flex?: number }) {
  return (
    <div style={{ flex: flex ?? 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
      <span style={caption1Strong}>{label}</span>
      {children}
    </div>
  )
}

export function SearchField({ value, onChange, placeholder, width }: { value: string; onChange: (v: string) => void; placeholder?: string; width?: number }) {
  const [focus, setFocus] = useState(false)
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-100)',
        border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
        transition: 'border-color var(--duration-ultra-fast) var(--curve-linear)',
      }}
    >
      <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-disabled)' }}>
        <Icon name="SearchGlyph" size={16} />
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...caption1, color: 'var(--text-primary)', padding: 0 }}
      />
    </span>
  )
}

/** A grid head cell. */
export function HeadCell({ children, align, style }: { children: ReactNode; align?: 'center' | 'right'; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--size-60) var(--size-80)',
        borderLeft: '1px solid var(--border-subtle)',
        textAlign: align,
        ...LABEL,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Caption-scale toast - this page's design file sets it one step down. */
export function Toast({ children }: { children: ReactNode }) {
  return <BaseToast size="caption">{children}</BaseToast>
}
