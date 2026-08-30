'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong } from '../../ds/type'
import { HEAD } from './style'
export { Toast } from '../../ds/components/Toast'

export function Pill({ label, bg, fg, border, onClick }: { label: string; bg: string; fg: string; border?: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <span
      data-fx={onClick ? '' : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)', background: bg, color: fg,
        border: border ? `1px solid ${border}` : undefined,
        ...caption1Strong, whiteSpace: 'nowrap', cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {label}
    </span>
  )
}

export function Checkbox({ on, onClick }: { on: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <div data-fx="" tabIndex={0} role="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <span
        style={{
          boxSizing: 'border-box', width: 16, height: 16, borderRadius: 'var(--radius-small)',
          border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: on ? 'var(--primary)' : 'var(--surface-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse)',
        }}
      >
        {on && <Icon name="FnCheck" size={12} />}
      </span>
    </div>
  )
}

export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', width: 36, height: 20, borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--primary)' : 'var(--neutral-400)',
        display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer', transition: 'background 120ms',
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--surface-card)', boxShadow: 'var(--elevation-card)', transform: `translateX(${on ? 16 : 0}px)`, transition: 'transform 120ms' }} />
    </div>
  )
}

export function SortHead({ label, justify, active, dir, onClick }: { label: string; justify: string; active?: boolean; dir?: 'asc' | 'desc'; onClick?: () => void }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', justifyContent: justify, ...HEAD, cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
    >
      <span>{label}</span>
      {onClick && (
        <span style={{ display: 'flex', color: active ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
          <Icon name={active ? (dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
        </span>
      )}
    </div>
  )
}

export function Button({ children, onClick, kind = 'plain', icon, small }: { children: ReactNode; onClick: (e: React.MouseEvent) => void; kind?: 'plain' | 'primary' | 'link'; icon?: string; small?: boolean }) {
  const [hover, hoverProps] = useHover()
  const style: CSSProperties = {
    boxSizing: 'border-box', height: small ? 28 : 'var(--control-height)', display: 'flex', alignItems: 'center',
    gap: 'var(--size-60)', padding: small ? '0 var(--size-100)' : '0 var(--size-120)',
    borderRadius: small ? 'var(--radius-small)' : 'var(--radius-medium)',
    ...(small ? caption1Strong : { ...body1, fontWeight: 'var(--weight-semibold)' }),
    whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)',
  }
  if (kind === 'primary') Object.assign(style, { background: hover ? 'var(--primary-hover)' : 'var(--primary)', border: '1px solid var(--primary)', color: 'var(--text-inverse)' })
  else if (kind === 'link') Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'transparent', color: 'var(--text-link)', padding: '0 var(--size-100)' })
  else Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)', border: '1px solid var(--border-default)' })
  return (
    <div data-fx="" tabIndex={0} role="button" onClick={onClick} style={style} {...hoverProps}>
      {icon && <span style={{ display: 'flex', color: kind === 'plain' ? 'var(--text-secondary)' : undefined }}><Icon name={icon} size={16} /></span>}
      {children}
    </div>
  )
}

export function IconButton({ icon, onClick, title, color = 'var(--text-secondary)', size = 28, bordered }: { icon: string; onClick: (e: React.MouseEvent) => void; title?: string; color?: string; size?: number; bordered?: boolean }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size,
        borderRadius: bordered ? 'var(--radius-small)' : 'var(--radius-small)',
        border: bordered ? '1px solid var(--border-default)' : undefined,
        background: hover ? 'var(--surface-subtle)' : bordered ? 'var(--surface-card)' : 'transparent',
        cursor: 'pointer', color,
      }}
      {...hoverProps}
    >
      <Icon name={icon} size={size >= 32 ? 20 : 16} />
    </div>
  )
}

export function SearchField({ value, onChange, placeholder, width }: { value: string; onChange: (v: string) => void; placeholder: string; width: number }) {
  return (
    <div
      data-search=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', width, display: 'flex', alignItems: 'center',
        gap: 'var(--size-80)', padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="FnSearch" size={16} /></span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1 }} />
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={{ ...caption1Strong, color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  )
}

export function Input({ value, onChange, type, suffix, numeric }: { value: string; onChange: (v: string) => void; type?: string; suffix?: string; numeric?: boolean }) {
  return (
    <div
      data-field=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        padding: '0 var(--size-120)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)',
      }}
    >
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, fontVariantNumeric: numeric ? 'tabular-nums' : undefined }} />
      {suffix && <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{suffix}</span>}
    </div>
  )
}

export function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div data-field="" style={{ boxSizing: 'border-box', display: 'flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
      <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, height: 64, resize: 'none', border: 'none', background: 'transparent', padding: 'var(--size-80) var(--size-120)', ...body1 }} />
    </div>
  )
}

/**
 * A combo field. Focusing it opens the shared floating menu; typing filters
 * that menu rather than editing the value directly.
 */
export function Combo({ value, placeholder, onChange, onOpen, card }: { value: string; placeholder: string; onChange: (v: string) => void; onOpen: (e: React.FocusEvent<HTMLInputElement>) => void; card?: boolean }) {
  return (
    <div
      data-field=""
      data-combo=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-120)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', background: card ? 'var(--surface-card)' : 'var(--surface-subtle)',
      }}
    >
      <input
        value={value}
        placeholder={placeholder}
        onFocus={onOpen}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
      />
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={16} /></span>
    </div>
  )
}

export function GridHead({ cols, children }: { cols: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--size-100)', alignItems: 'center',
        background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)',
      }}
    >
      {children}
    </div>
  )
}

export function GridRow({ cols, opacity, children }: { cols: string; opacity?: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--size-100)', alignItems: 'center',
        minHeight: 48, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)', opacity,
      }}
    >
      {children}
    </div>
  )
}

export function Empty({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
      <span style={{ ...body1, color: 'var(--text-secondary)' }}>{children}</span>
    </div>
  )
}

/** A row link that opens an associate. */
export function DaLink({ name, strike, onClick }: { name: string; strike?: boolean; onClick: () => void }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick() }}
      style={{
        ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)',
        textDecoration: strike ? 'line-through' : 'none',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}
    >
      {name}
    </a>
  )
}
