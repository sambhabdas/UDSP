'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1Strong, subtitle1 } from '../../ds/type'
import { FIELD_LABEL, HEAD } from './style'
export { Toast } from '../../ds/components/Toast'

export function Chip({ label, bg, fg, border, title }: { label: string; bg: string; fg: string; border?: string; title?: string }) {
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)', background: bg, color: fg,
        border: border ? `1px solid ${border}` : undefined, ...caption1Strong, whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

export function Checkbox({ on, onClick }: { on: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <span
      style={{
        boxSizing: 'border-box', width: 16, height: 16, borderRadius: 'var(--radius-small)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: on ? 'var(--primary)' : 'var(--surface-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse)',
      }}
      onClick={onClick}
    >
      {on && <Icon name="FnCheck" size={12} />}
    </span>
  )
}

/**
 * A switch. `tone` is red for at-risk flags — the one place a switch means
 * "this counts as a problem" rather than "this is on".
 */
export function Toggle({
  on, onClick, tone = 'primary', disabled, title,
}: {
  on: boolean
  onClick: () => void
  tone?: 'primary' | 'risk'
  disabled?: boolean
  title?: string
}) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box', width: 36, height: 20, borderRadius: 'var(--radius-pill)',
        background: on ? (tone === 'risk' ? 'var(--red-600)' : 'var(--primary)') : 'var(--neutral-400)',
        display: 'flex', alignItems: 'center', padding: 2,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transition: 'background 120ms',
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

export function Button({ children, onClick, kind = 'plain', icon, small }: { children: ReactNode; onClick: (e: React.MouseEvent) => void; kind?: 'plain' | 'primary' | 'danger' | 'link'; icon?: string; small?: boolean }) {
  const [hover, hoverProps] = useHover()
  const style: CSSProperties = {
    boxSizing: 'border-box', height: small ? 28 : 'var(--control-height)', display: 'flex', alignItems: 'center',
    gap: 'var(--size-40)', padding: small ? '0 var(--size-100)' : '0 var(--size-120)',
    borderRadius: small ? 'var(--radius-small)' : 'var(--radius-medium)',
    ...(small ? caption1Strong : { ...body1, fontWeight: 'var(--weight-semibold)' }),
    whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)',
  }
  if (kind === 'primary') Object.assign(style, { background: hover ? 'var(--primary-hover)' : 'var(--primary)', border: '1px solid var(--primary)', color: 'var(--text-inverse)' })
  else if (kind === 'danger') Object.assign(style, { background: 'var(--red-600)', border: '1px solid var(--red-600)', color: 'var(--text-inverse)' })
  else if (kind === 'link') Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'transparent', color: 'var(--text-link)', padding: '0 var(--size-100)' })
  else Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)', border: '1px solid var(--border-default)' })
  return (
    <div data-fx="" tabIndex={0} role="button" onClick={onClick} style={style} {...hoverProps}>
      {icon && <span style={{ display: 'flex' }}><Icon name={icon} size={16} /></span>}
      {children}
    </div>
  )
}

export function IconButton({ icon, onClick, size = 28, color = 'var(--text-secondary)' }: { icon: string; onClick: (e: React.MouseEvent) => void; size?: number; color?: string }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size,
        borderRadius: 'var(--radius-small)', background: hover ? 'var(--surface-subtle)' : 'transparent',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', minWidth: 0 }}>
      <span style={FIELD_LABEL}>{label}</span>
      {children}
    </div>
  )
}

export function Input({
  value, onChange, placeholder, disabled, color, background, numeric,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  color?: string
  background?: string
  numeric?: boolean
}) {
  return (
    <div
      data-field=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        padding: '0 var(--size-120)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', background: background ?? 'var(--surface-subtle)',
      }}
    >
      <input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, color, fontVariantNumeric: numeric ? 'tabular-nums' : undefined }}
      />
    </div>
  )
}

export function TextArea({ value, onChange, placeholder, height = 56 }: { value: string; onChange: (v: string) => void; placeholder: string; height?: number }) {
  return (
    <div data-field="" style={{ boxSizing: 'border-box', display: 'flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
      <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, height, resize: 'none', border: 'none', background: 'transparent', padding: 'var(--size-80) var(--size-120)', ...body1 }} />
    </div>
  )
}

/** A field that opens the shared menu instead of accepting typing. */
export function PickerField({ children, onClick }: { children: ReactNode; onClick: (e: React.MouseEvent) => void }) {
  return (
    <div
      data-field=""
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        gap: 'var(--size-80)', padding: '0 var(--size-120)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)', cursor: 'pointer',
      }}
    >
      {children}
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={16} /></span>
    </div>
  )
}

/** A colour circle; the picked one carries a dark ring. */
export function Swatch({ fill, picked, onClick }: { fill: string; picked: boolean; onClick: () => void }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', width: 28, height: 28, borderRadius: '50%', background: fill,
        border: `2px solid ${picked ? 'var(--neutral-900)' : 'transparent'}`, cursor: 'pointer',
      }}
    />
  )
}

export function DialogShell({
  title, width, chip, onClose, children, footer,
}: {
  title: string
  width: number
  chip?: ReactNode
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width, maxHeight: '84vh', background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-large)', boxShadow: 'var(--elevation-dialog)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-200)' }}>
          <span style={subtitle1}>{title}</span>
          {chip}
          <div style={{ flex: 1 }} />
          <IconButton icon="FnDismiss" onClick={onClose} size={32} />
        </div>
        {children}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200)', borderTop: '1px solid var(--border-subtle)' }}>
          {footer}
        </div>
      </div>
    </div>
  )
}
