'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { FIELD_LABEL } from './style'
import { Toast as BaseToast } from '../../ds/components/Toast'

export function Button({
  children, onClick, kind = 'plain', title, disabled, icon,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
  kind?: 'plain' | 'primary' | 'danger'
  title?: string
  disabled?: boolean
  icon?: string
}) {
  const [hover, hoverProps] = useHover()
  const style: CSSProperties = {
    boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
    gap: 'var(--size-60)', padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)',
    ...caption1Strong, whiteSpace: 'nowrap', cursor: disabled ? 'default' : 'pointer',
    transition: 'background var(--motion-hover)',
  }
  if (disabled) Object.assign(style, { background: 'var(--surface-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-disabled)' })
  else if (kind === 'primary') Object.assign(style, { background: hover ? 'var(--primary-hover)' : 'var(--primary)', border: '1px solid var(--primary)', color: 'var(--text-inverse)' })
  else if (kind === 'danger') Object.assign(style, { background: hover ? 'var(--danger-fg)' : 'var(--danger-accent)', border: '1px solid var(--danger-accent)', color: 'var(--text-inverse)' })
  else Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)', border: '1px solid var(--border-default)' })
  return (
    <div data-fx="" tabIndex={0} role="button" title={title} onClick={onClick} onMouseDown={(e) => e.preventDefault()} style={style} {...hoverProps}>
      {icon && <span style={{ display: 'flex' }}><Icon name={icon} size={12} /></span>}
      {children}
    </div>
  )
}

/** A 28px control-bar button - the toolbar's own height. */
export function SmallButton({ children, onClick, title, icon }: { children: ReactNode; onClick: (e: React.MouseEvent) => void; title?: string; icon?: string }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', gap: 'var(--size-60)',
        padding: '0 var(--size-100)', borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)', ...caption1Strong,
        whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {icon && <span style={{ display: 'flex' }}><Icon name={icon} size={12} /></span>}
      {children}
    </div>
  )
}

export function IconButton({ icon, onClick, title, size = 28, color = 'var(--text-secondary)', rotate, bordered }: { icon: string; onClick: (e: React.MouseEvent) => void; title?: string; size?: number; color?: string; rotate?: number; bordered?: boolean }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', width: size, height: size, display: 'flex', alignItems: 'center',
        justifyContent: 'center', borderRadius: 'var(--radius-small)',
        border: bordered ? '1px solid var(--border-default)' : undefined,
        background: hover ? 'var(--surface-subtle)' : bordered ? 'var(--surface-card)' : 'transparent',
        cursor: 'pointer', color, flexShrink: 0, transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex', transform: rotate ? `rotate(${rotate}deg)` : undefined }}>
        <Icon name={icon} size={size >= 32 ? 16 : icon === 'SvChevron' ? 12 : 16} />
      </span>
    </div>
  )
}

export function DropTrigger({ children, onClick, width, icon }: { children: ReactNode; onClick: (e: React.MouseEvent) => void; width?: number; icon?: string }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', width, height: 28, display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-100)', borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
        ...caption1, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {icon && <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name={icon} size={12} /></span>}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>{children}</span>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={12} /></span>
    </div>
  )
}

export function Menu({ children, width, top = 31, left = 0, z = 40 }: { children: ReactNode; width: number | string; top?: number; left?: number | string; z?: number }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top, left, boxSizing: 'border-box', width,
        padding: 'var(--size-40)', background: 'var(--surface-card)',
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)', zIndex: z, display: 'flex', flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

export function MenuRow({ children, onClick, selected, danger }: { children: ReactNode; onClick: (e: React.MouseEvent) => void; selected?: boolean; danger?: boolean }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', minHeight: 28, flexShrink: 0, display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : selected ? 'var(--blue-50)' : 'transparent',
        ...caption1,
        fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: danger ? 'var(--danger-fg)' : selected ? 'var(--blue-700)' : 'var(--text-primary)',
        whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

export function SearchField({ value, onChange, placeholder, width }: { value: string; onChange: (v: string) => void; placeholder: string; width?: number | string }) {
  return (
    <span
      data-field=""
      style={{
        boxSizing: 'border-box', width, height: 28, display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
      }}
    >
      <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-disabled)' }}>
        <Icon name="SearchGlyph" size={14} />
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...caption1, color: 'var(--text-primary)', padding: 0 }}
      />
    </span>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
      <span style={caption1Strong}>{label}</span>
      {children}
    </div>
  )
}

export function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <span
      data-field=""
      style={{ boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', padding: '0 var(--size-100)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-small)', background: 'var(--surface-card)' }}
    >
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...caption1, color: 'var(--text-primary)', padding: 0 }}
      />
    </span>
  )
}

/** A pick-one chip. */
export function Seg({ children, on, onClick }: { children: ReactNode; on: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', height: 28, display: 'inline-flex', alignItems: 'center',
        padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)',
        background: on ? 'var(--primary-soft)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        ...caption1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--primary)' : 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export function Chip({ label, bg, fg, border, dot }: { label: string; bg: string; fg: string; border?: string; dot?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20, padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: bg, color: fg, border: border ? `1px solid ${border}` : undefined, ...caption1Strong, whiteSpace: 'nowrap' }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dot }} />}
      {label}
    </span>
  )
}

/** A field that opens the shared menu. */
export function PickerField({ label, color, onClick, flex, bg, border }: { label: string; color?: string; onClick: (e: React.MouseEvent) => void; flex?: boolean; bg?: string; border?: string }) {
  return (
    <div
      data-field=""
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', flex: flex ? 1 : undefined, minWidth: flex ? 0 : undefined, height: 28,
        display: 'flex', alignItems: 'center', gap: 'var(--size-60)', padding: '0 var(--size-100)',
        border: `1px solid ${border ?? 'var(--border-default)'}`, borderRadius: 'var(--radius-small)',
        background: bg ?? 'var(--surface-card)', cursor: 'pointer',
      }}
    >
      <span style={{ flex: 1, minWidth: 0, ...caption1, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={12} /></span>
    </div>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <span style={subtitle2}>{children}</span>
}

/** The dialog shell every modal on the page shares. */
export function DialogShell({
  title, width = 560, onClose, children, footer,
}: {
  title: string
  width?: number
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto', padding: 'var(--size-320) var(--size-160)' }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        style={{ boxSizing: 'border-box', width, marginBlock: 'auto', flexShrink: 0, background: 'var(--surface-raised)', borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', gap: 'var(--size-160)', padding: 'var(--size-240)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
          <span style={{ flex: 1, minWidth: 0, ...subtitle2 }}>{title}</span>
          <IconButton icon="DismissSize16ThemeRegular" onClick={onClose} />
        </div>
        {children}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', paddingTop: 'var(--size-120)', borderTop: '1px solid var(--border-subtle)' }}>
          {footer}
        </div>
      </div>
    </div>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span style={FIELD_LABEL}>{children}</span>
}

/** Caption-scale toast - this page's design file sets it one step down. */
export function Toast({ children }: { children: ReactNode }) {
  return <BaseToast size="caption">{children}</BaseToast>
}
