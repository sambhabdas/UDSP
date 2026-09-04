'use client'

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, caption2Strong, subtitle1, subtitle2 } from '../../ds/type'
import { TONES } from './calc'
import type { Tone, ToneName } from './calc'
import { CARD_HEAD, FIELD_LABEL, TILE_LABEL, TILE_VALUE } from './style'
export { Toast } from '../../ds/components/Toast'

export function SectionTitle({ children, flex }: { children: ReactNode; flex?: boolean }) {
  return <span style={{ ...subtitle2, flex: flex ? 1 : undefined }}>{children}</span>
}

export function CardHead({ children }: { children: ReactNode }) {
  return <div style={CARD_HEAD}>{children}</div>
}

/** A control-height button - the page's Export and the dialogs' footers. */
export function Button({
  children,
  onClick,
  primary,
  pop,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  /** Marks the button as the thing a menu hangs off, so its own click keeps it. */
  pop?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      data-pop={pop ? '' : undefined}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1Strong,
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

/**
 * The 28px button the profile and its tabs use everywhere.
 *
 * Three recipes: plain, `primary` blue-filled, and `link` - an outlined button
 * whose text is blue and whose hover plate is blue-50 rather than the subtle
 * grey. The link recipe is what Reinstate and Open In Dispatch wear.
 */
export function SmallButton({
  children,
  onClick,
  primary,
  link,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  link?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        minWidth: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? (link ? 'var(--blue-50)' : 'var(--surface-subtle)') : 'var(--surface-card)',
        color: primary ? 'var(--text-inverse)' : link ? 'var(--blue-700)' : 'var(--text-primary)',
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

/** A square glyph button - row ⋯, the call handset, a dialog's ✕. */
export function IconButton({
  name,
  onClick,
  title,
  size = 28,
  glyph = 16,
  color = 'var(--primary)',
  cursor = 'pointer',
  pop,
}: {
  name: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  title?: string
  size?: number
  glyph?: number
  color?: string
  cursor?: CSSProperties['cursor']
  pop?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      data-pop={pop ? '' : undefined}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color,
        cursor,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={glyph} />
    </div>
  )
}

/** The page's one text field. It hides its own magnifier once it has text. */
export function SearchBox({
  value,
  onChange,
  placeholder,
  width = 220,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  width?: number
}) {
  return (
    <div
      data-search=""
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
      />
    </div>
  )
}

/** A dialog / drawer input. */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  nums,
  width,
  align,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  nums?: boolean
  width?: number | string
  align?: CSSProperties['textAlign']
}) {
  const [focus, setFocus] = useState(false)
  const input = (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        boxSizing: 'border-box',
        width: width ?? '100%',
        height: 'var(--control-height)',
        padding: `0 var(--size-${width ? '80' : '120'})`,
        borderRadius: 'var(--radius-medium)',
        border: `1px solid ${focus ? 'var(--primary)' : 'var(--border-default)'}`,
        outline: 'none',
        ...body1,
        textAlign: align,
        // A locked field greys both its text and its plate, so it reads as
        // read-only rather than merely empty.
        color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
        background: disabled ? 'var(--surface-subtle)' : 'var(--surface-card)',
        fontVariantNumeric: nums ? 'tabular-nums' : undefined,
      }}
    />
  )
  if (!label) return input
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', minWidth: 0 }}>
      <span style={FIELD_LABEL}>{label}</span>
      {input}
    </div>
  )
}

/** A dotted status chip - the roster's flags, a coaching state, a strip pill. */
export function DotPill({
  tone,
  label,
  title,
  onClick,
  height = 20,
  padding = 'var(--size-80)',
  radius = 'var(--radius-medium)',
  dot,
}: {
  tone: ToneName | Tone
  label: ReactNode
  title?: string
  onClick?: (e: React.MouseEvent) => void
  height?: number
  padding?: string
  radius?: string
  /** Overrides the tone's own dot - the tier pills colour by band. */
  dot?: string
}) {
  const t = typeof tone === 'string' ? TONES[tone] : tone
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={title}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        height,
        padding: `0 ${padding}`,
        borderRadius: radius,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
        ...(height <= 18 ? { ...caption2Strong, lineHeight: '12px' } : caption1Strong),
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dot ?? t.dot, flexShrink: 0 }} />
      {label}
    </span>
  )
}

/** A dotless chip - the header's count, the qualification tags, a feed tag. */
export function Pill({
  children,
  tone = 'blue',
  title,
  height = 24,
  radius = 'var(--radius-pill)',
  padding = 'var(--size-80)',
}: {
  children: ReactNode
  tone?: ToneName | Tone
  title?: string
  height?: number
  radius?: string
  padding?: string
}) {
  const t = typeof tone === 'string' ? TONES[tone] : tone
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height,
        padding: `0 ${padding}`,
        borderRadius: radius,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
        ...(height <= 18 ? { ...caption2Strong, lineHeight: '12px' } : caption1Strong),
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** The circular initials badge - 24px on a row, 56px on the profile. */
export function Avatar({ initials, size }: { initials: string; size: 24 | 56 }) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 'var(--radius-circle)',
        background: 'var(--blue-50)',
        border: '1px solid var(--blue-200)',
        color: 'var(--blue-700)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(size === 24
          ? { fontSize: 10, fontWeight: 'var(--weight-semibold)' }
          : { fontSize: subtitle1.fontSize, fontWeight: 'var(--weight-semibold)' }),
      }}
    >
      {initials}
    </span>
  )
}

/** The 12px table cell most columns use. */
export function Cell({
  children,
  color,
  body,
  bold,
  mono,
  nums,
  ellipsis,
  width,
  flex,
}: {
  children?: ReactNode
  color?: string
  /** Body 1 rather than Caption 1 - the design mixes both down a row. */
  body?: boolean
  bold?: boolean
  mono?: boolean
  nums?: boolean
  ellipsis?: boolean
  width?: number
  flex?: boolean
}) {
  return (
    <span
      style={{
        ...(body ? body1 : caption1),
        fontWeight: bold ? 'var(--weight-semibold)' : undefined,
        fontFamily: mono ? 'Consolas, ui-monospace, monospace' : undefined,
        color,
        width,
        flex: flex ? 1 : undefined,
        minWidth: flex ? 0 : undefined,
        fontVariantNumeric: nums ? 'tabular-nums' : undefined,
        whiteSpace: 'nowrap',
        overflow: ellipsis ? 'hidden' : undefined,
        textOverflow: ellipsis ? 'ellipsis' : undefined,
      }}
    >
      {children}
    </span>
  )
}

/** A KPI tile. Clickable ones jump to the tab that explains the number. */
export function Tile({
  label,
  value,
  color,
  sub,
  title,
  onClick,
}: {
  label: string
  value: string
  color?: string
  sub?: string
  title?: string
  onClick?: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        background: onClick && hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        padding: 'var(--size-120) var(--size-160)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-60)',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'background var(--motion-hover)',
      }}
      {...(onClick ? hoverProps : {})}
    >
      <span style={TILE_LABEL}>{label}</span>
      <span style={{ ...TILE_VALUE, color }}>{value}</span>
      {sub && (
        <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

/** The inline blue link the page uses for its back arrow and card jumps. */
export function Link({ children, onClick }: { children: ReactNode; onClick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <a
      href="#"
      onClick={onClick}
      style={{ color: 'var(--blue-700)', textDecoration: hover ? 'underline' : 'none', ...body1 }}
      {...hoverProps}
    >
      {children}
    </a>
  )
}

/** The 1px rule that separates groups of controls inside a card head. */
export function Divider() {
  return <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 var(--size-40)' }} />
}
