'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { FIELD_LABEL, HEAD } from './style'
import { avatarTone, initials as initialsOf, tierTone } from './data'
export { Toast } from '../../ds/components/Toast'

export function Avatar({ name, size }: { name: string; size: number }) {
  const [bg, fg] = avatarTone(name)
  return (
    <span
      style={{
        flexShrink: 0, width: size, height: size, borderRadius: '50%', background: bg, color: fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size >= 56 ? 'var(--subtitle-1-size)' : 'var(--caption-1-size)',
        fontWeight: 'var(--weight-semibold)',
      }}
    >
      {initialsOf(name)}
    </span>
  )
}

/** A dotted pill - tier, eligibility, anything with a status colour. */
export function Pill({
  label, bg, fg, dot, border,
}: {
  label: string
  bg: string
  fg: string
  dot?: string
  border?: string
}) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20,
        padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: bg, color: fg, border: border ? `1px solid ${border}` : undefined,
        ...caption1Strong, whiteSpace: 'nowrap',
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
      {label}
    </span>
  )
}

export function TierPill({ tier }: { tier: string }) {
  const t = tierTone(tier)
  return <Pill label={tier} bg={t.bg} fg={t.fg} dot={t.dot} />
}

/** The count chip beside a panel title. */
export function CountChip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)',
        border: '1px solid var(--border-default)', color: 'var(--text-secondary)', ...caption1Strong,
      }}
    >
      {children}
    </span>
  )
}

export function Checkbox({ on, onClick, size = 16 }: { on: boolean; onClick: (e: React.MouseEvent) => void; size?: number }) {
  return (
    <div data-fx="" tabIndex={0} role="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <span
        style={{
          boxSizing: 'border-box', width: size, height: size, borderRadius: 'var(--radius-small)',
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
      <span
        style={{
          width: 16, height: 16, borderRadius: '50%', background: 'var(--surface-card)',
          boxShadow: 'var(--elevation-card)', transform: `translateX(${on ? 16 : 0}px)`, transition: 'transform 120ms',
        }}
      />
    </div>
  )
}

/** A grid header cell; sortable when `sortKey` is given. */
export function SortHead({
  label, justify, active, dir, onClick,
}: {
  label: string
  justify: string
  active?: boolean
  dir?: 'asc' | 'desc'
  onClick?: () => void
}) {
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

/** The page's button, in its four weights. */
export function Button({
  children, onClick, kind = 'plain', icon,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
  kind?: 'plain' | 'primary' | 'green' | 'soft' | 'link'
  icon?: string
}) {
  const [hover, hoverProps] = useHover()
  const style: CSSProperties = { boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center', gap: 'var(--size-60)', padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)', ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)' }
  if (kind === 'primary') Object.assign(style, { background: hover ? 'var(--primary-hover)' : 'var(--primary)', border: '1px solid var(--primary)', color: 'var(--text-inverse)' })
  else if (kind === 'green') Object.assign(style, { background: hover ? 'var(--green-700)' : 'var(--green-600)', border: '1px solid var(--green-600)', color: 'var(--text-inverse)' })
  else if (kind === 'soft') Object.assign(style, { background: hover ? 'var(--blue-100)' : 'var(--blue-50)', border: '1px solid var(--blue-200)', color: 'var(--blue-700)' })
  else if (kind === 'link') Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'transparent', color: 'var(--text-link)', padding: '0 var(--size-100)' })
  else Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)', border: '1px solid var(--border-default)' })
  return (
    <div data-fx="" tabIndex={0} role="button" onClick={onClick} style={style} {...hoverProps}>
      {icon && <span style={{ display: 'flex' }}><Icon name={icon} size={16} /></span>}
      {children}
    </div>
  )
}

/** A square icon button - the kebabs and the close buttons. */
export function IconButton({
  icon, onClick, size = 28, color = 'var(--text-secondary)', bordered,
}: {
  icon: string
  onClick: (e: React.MouseEvent) => void
  size?: number
  color?: string
  bordered?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size,
        borderRadius: bordered ? 'var(--radius-medium)' : 'var(--radius-small)',
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

export function SearchField({
  value, onChange, placeholder, width,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  width: number
}) {
  return (
    <div
      data-search=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', width,
        display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="FnSearch" size={16} />
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1 }}
      />
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={FIELD_LABEL}>{label}</span>
      {children}
    </div>
  )
}

/** A form input in a dialog - subtle fill, no visible focus jump. */
export function Input({
  value, onChange, type, placeholder, suffix, numeric,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  suffix?: string
  numeric?: boolean
}) {
  return (
    <div
      data-field=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        padding: '0 var(--size-120)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)',
      }}
    >
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, fontVariantNumeric: numeric ? 'tabular-nums' : undefined }}
      />
      {suffix && <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{suffix}</span>}
    </div>
  )
}

export function TextArea({
  value, onChange, placeholder, height,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  height: number
}) {
  return (
    <div
      data-field=""
      style={{ boxSizing: 'border-box', display: 'flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}
    >
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, height, resize: 'none', border: 'none', background: 'transparent', padding: 'var(--size-80) var(--size-120)', ...body1 }}
      />
    </div>
  )
}

/**
 * A combo field: it looks like an input, but clicking it opens the shared
 * floating menu, and typing in it filters that menu.
 */
export function Combo({
  value, onChange, placeholder, onOpen,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  onOpen: (e: React.MouseEvent) => void
}) {
  return (
    <div
      data-field=""
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onOpen}
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        gap: 'var(--size-80)', padding: '0 var(--size-120)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)', cursor: 'pointer',
      }}
    >
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, cursor: 'pointer' }}
      />
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="SvChevron" size={16} />
      </span>
    </div>
  )
}

/** A section rule: an uppercase word and a hairline across the rest. */
export function SectionRule({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', margin: 'var(--size-40) 0' }}>
      <span style={{ ...HEAD, whiteSpace: 'nowrap' }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>{children}</span>
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <span style={subtitle1}>{children}</span>
}


/** A table row that highlights on hover. */
export function HoverRow({
  cols, onClick, background, opacity, minHeight = 44, children,
}: {
  cols: string
  onClick?: (e: React.MouseEvent) => void
  background?: string
  opacity?: string
  minHeight?: number
  children: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--size-100)', alignItems: 'center',
        minHeight, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : background ?? 'transparent',
        opacity, cursor: onClick ? 'pointer' : undefined,
      }}
      {...hoverProps}
    >
      {children}
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

export function EmptyRow({ children, minHeight = 80 }: { children: string; minHeight?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight }}>
      <span style={{ ...body1, color: 'var(--text-secondary)' }}>{children}</span>
    </div>
  )
}
