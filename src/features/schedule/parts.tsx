'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2Strong } from '../../ds/type'
import { Toast as BaseToast } from '../../ds/components/Toast'

/** The page runs on 28px controls, not the 32px default. */
export function Button({
  children,
  onClick,
  primary,
  title,
  gap,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  primary?: boolean
  title?: string
  gap?: boolean
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
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: gap ? 'var(--size-60)' : undefined,
        padding: `0 var(--size-${primary ? '120' : '100'})`,
        borderRadius: 'var(--radius-small)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: primary ? undefined : '1px solid var(--border-default)',
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
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

/** A dropdown trigger. */
export function DropTrigger({
  children,
  onClick,
  width,
  leadIcon,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
  width?: number
  leadIcon?: string
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
        ...caption1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {leadIcon && (
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name={leadIcon} size={12} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="SvChevron" size={12} />
      </span>
    </div>
  )
}

export function Menu({
  children,
  width,
  align = 'left',
  top = 31,
  z = 40,
  centered,
}: {
  children: ReactNode
  width: number
  align?: 'left' | 'right'
  top?: number | string
  z?: number
  centered?: boolean
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top,
        left: centered ? '50%' : align === 'left' ? 0 : undefined,
        right: !centered && align === 'right' ? 0 : undefined,
        transform: centered ? 'translateX(-50%)' : undefined,
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
        cursor: 'default',
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
  danger,
  height = 28,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
  selected?: boolean
  danger?: boolean
  height?: number
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        height,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: hover ? (danger ? 'var(--danger-bg)' : 'var(--surface-subtle)') : selected ? 'var(--blue-50)' : 'transparent',
        ...caption1,
        color: danger ? 'var(--danger-fg)' : 'var(--text-primary)',
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

/** The 28px search field the card header carries. */
export function SearchField({
  value,
  onChange,
  placeholder,
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
        gap: 'var(--size-80)',
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

/** A dialog field - label over control. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
      <span style={caption1Strong}>{label}</span>
      {children}
    </div>
  )
}

export function Input({
  value,
  onChange,
  placeholder,
  mono,
  onFocus,
  onBlur,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
  onFocus?: () => void
  onBlur?: () => void
}) {
  const [focus, setFocus] = useState(false)
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
        transition: 'border-color var(--duration-ultra-fast) var(--curve-linear)',
      }}
    >
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { setFocus(true); onFocus?.() }}
        onBlur={() => { setFocus(false); onBlur?.() }}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          ...caption1,
          fontFamily: mono ? 'ui-monospace, monospace' : undefined,
          color: 'var(--text-primary)',
          padding: 0,
        }}
      />
    </span>
  )
}

/** A small filled action chip - the dialogs' inline buttons. */
export function ChipButton({
  children,
  onClick,
  tone = 'plain',
}: {
  children: ReactNode
  onClick: () => void
  tone?: 'plain' | 'blue' | 'danger' | 'warn'
}) {
  const tones = {
    blue: ['var(--blue-100)', 'var(--blue-200)', 'var(--blue-700)'],
    danger: ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger-fg)'],
    warn: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)'],
    plain: ['var(--surface-card)', 'var(--border-default)', 'var(--text-primary)'],
  }[tone]
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: tones[0],
        border: `1px solid ${tones[1]}`,
        color: tones[2],
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      {children}
    </div>
  )
}

/** A 24px segmented option - the dialogs' pick-one rows. */
export function Seg({ children, on, onClick }: { children: ReactNode; on: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--primary-soft)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        ...caption1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--primary)' : 'var(--text-primary)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** A 14px tick. Round for one-of, square for any-of. */
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
        color: 'var(--text-inverse)',
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {on ? (radio ? '•' : '✓') : ''}
    </span>
  )
}

export function CheckRow({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', cursor: 'pointer', ...caption1 }}>
      <Tick on={on} />
      {label}
    </div>
  )
}

/** A tone plate - the dialogs' warning and refusal boxes. */
export function Note({ tone, children }: { tone: 'danger' | 'warn'; children: ReactNode }) {
  const t = tone === 'danger'
    ? { bg: 'var(--danger-bg)', bd: 'var(--danger-border)', fg: 'var(--danger-fg)' }
    : { bg: 'var(--warning-bg)', bd: 'var(--warning-border)', fg: 'var(--warning-fg)' }
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--size-60) var(--size-100)',
        background: t.bg,
        border: `1px solid ${t.bd}`,
        borderRadius: 'var(--radius-small)',
        ...caption1,
        color: t.fg,
      }}
    >
      {children}
    </div>
  )
}

/** The ✓ / ⚠ / ✕ that leads a rule line. */
export function RuleIcon({ status }: { status: 'ok' | 'soft' | 'hard' }) {
  const color = status === 'ok' ? 'var(--success-fg)' : status === 'soft' ? 'var(--warning-fg)' : 'var(--danger-fg)'
  return (
    <span style={{ width: 14, flexShrink: 0, textAlign: 'center', color, ...caption1, fontWeight: 'var(--weight-semibold)' }}>
      {status === 'ok' ? '✓' : status === 'soft' ? '⚠' : '✕'}
    </span>
  )
}

/** A tier badge - dot plus label, in the tier's own tone. */
export function TierChip({ tier, palette }: { tier: string; palette: { bg: string; bd: string; fg: string; dot: string } }) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height: 18,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 var(--size-40)',
        borderRadius: 'var(--radius-medium)',
        background: palette.bg,
        border: `1px solid ${palette.bd}`,
        ...caption2Strong,
        lineHeight: '1',
        color: palette.fg,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: palette.dot }} />
      {tier}
    </span>
  )
}

/** Caption-scale toast - this page's design file sets it one step down. */
export function Toast({ children, onUndo }: { children: ReactNode; onUndo?: () => void }) {
  return <BaseToast size="caption" onUndo={onUndo}>{children}</BaseToast>
}
