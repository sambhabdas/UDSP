'use client'

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption2, caption2Strong } from '../../ds/type'
import { Toast as BaseToast } from '../../ds/components/Toast'

/** The uppercase eyebrow over each band of the page. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span style={{ ...caption2Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-label)' }}>
      {children}
    </span>
  )
}

/** A control-height dropdown trigger. */
export function DropTrigger({
  children,
  onClick,
  width,
  strong,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
  width: number
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
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
        ...(strong ? body1Strong : body1),
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
      <div style={{ flex: 1 }} />
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </div>
  )
}

/** A combobox trigger - the input IS the search box. */
export function ComboBox({
  value,
  onChange,
  placeholder,
  onOpen,
  width,
  strong,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  onOpen: (e: React.MouseEvent) => void
  width: number
  strong?: boolean
}) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width,
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        cursor: 'text',
      }}
    >
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onClick={onOpen}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          ...(strong ? body1Strong : body1),
          color: 'var(--text-primary)',
          padding: 0,
        }}
      />
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </span>
  )
}

/** The floating list a trigger drops. */
export function Menu({
  children,
  width,
  align = 'left',
  top = 36,
  maxHeight,
}: {
  children: ReactNode
  width: number
  align?: 'left' | 'right'
  top?: number
  maxHeight?: number
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top,
        boxSizing: 'border-box',
        width,
        left: align === 'left' ? 0 : undefined,
        right: align === 'right' ? 0 : undefined,
        maxHeight,
        overflow: maxHeight ? 'hidden auto' : undefined,
        padding: 'var(--size-40)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

export function MenuRow({
  children,
  onClick,
  selected,
  height = 28,
  padding = 'var(--size-80)',
  small,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
  selected?: boolean
  height?: number
  padding?: string
  small?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: `0 ${padding}`,
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : selected ? 'var(--blue-50)' : 'transparent',
        ...(small ? caption1 : body1),
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

/** A 14px checkbox, square for multi-select and round for one-of. */
export function Tick({ on, radio }: { on: boolean; radio?: boolean }) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width: 14,
        height: 14,
        borderRadius: radio ? 'var(--radius-circle)' : 'var(--radius-small)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: on ? 'var(--primary)' : 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-inverse)',
        fontSize: 10,
        flexShrink: 0,
      }}
    >
      {on ? (radio ? '•' : '✓') : ''}
    </span>
  )
}

/** A card. */
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** A search field. Two sizes: the 28px in-card one and the toolbar's. */
export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  width,
  flex,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  width?: number
  flex?: boolean
}) {
  const [focus, setFocus] = useState(false)
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width,
        flex: flex ? 1 : undefined,
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
        <Icon name="SearchGlyph" size={14} />
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

/** A 24px outline button - the question header's View answers. */
export function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        ...caption1,
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

export function IconButton({
  name,
  onClick,
  title,
  size = 28,
  glyph = 16,
  color = 'var(--text-secondary)',
  bg = 'transparent',
  hoverBg = 'var(--surface-subtle)',
}: {
  name: string
  onClick: (e: React.MouseEvent) => void
  title?: string
  size?: number
  glyph?: number
  color?: string
  bg?: string
  hoverBg?: string
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        width: size,
        height: size,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: hover ? hoverBg : bg,
        border: '1px solid transparent',
        color,
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={glyph} />
    </div>
  )
}

/** A hover tooltip in the inverse plate. */
export function Tip({ label, value, style }: { label: string; value: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-60) var(--size-100)',
        background: 'var(--surface-inverse)',
        color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-small)',
        boxShadow: 'var(--elevation-callout)',
        ...caption2,
        whiteSpace: 'nowrap',
        zIndex: 20,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <span style={{ fontWeight: 'var(--weight-semibold)' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/** Caption-scale toast - this page's design file sets it one step down. */
export function Toast({ children }: { children: ReactNode }) {
  return <BaseToast size="caption">{children}</BaseToast>
}
