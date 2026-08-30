import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { body1, caption1, caption1Strong, subtitle2 } from '../type'
import { useHover } from '../useHover'

// Floating layers get a shadow; resting surfaces get the hairline instead.
// Menus and dropdowns are $shadow8, callouts and toasts $shadow16, dialogs
// $shadow64.

export function Menu({
  children,
  width,
  minWidth,
  top = 36,
  left,
  right = 0,
  elevation = 'menu',
}: {
  children?: ReactNode
  width?: number | string
  minWidth?: number | string
  top?: number | string
  left?: number | string
  right?: number | string
  elevation?: 'menu' | 'callout' | 'dialog'
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        // Anchor to whichever edge of the control the menu hangs from.
        ...(left === undefined ? { right } : { left }),
        boxSizing: 'border-box',
        width,
        minWidth,
        padding: 'var(--size-40)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: `var(--elevation-${elevation})`,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

export function MenuItem({
  children,
  onClick,
  selected = false,
  trailing,
}: {
  children?: ReactNode
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  selected?: boolean
  trailing?: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: selected
          ? 'var(--primary-soft)'
          : hover
            ? 'var(--surface-subtle)'
            : 'transparent',
        ...body1,
        fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
      {trailing !== undefined && (
        <>
          <div style={{ flex: 1 }} />
          {trailing}
        </>
      )}
    </div>
  )
}

// X-Large radius and the dialog shadow, over a neutral-900 scrim at 32%.
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string
  children?: ReactNode
  onClose?: () => void
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.32)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
        style={{
          boxSizing: 'border-box',
          width: 440,
          maxHeight: 'calc(100vh - 64px)',
          overflow: 'hidden auto',
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-xlarge)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-120)',
          padding: 'var(--size-240)',
        }}
      >
        <span style={{ ...subtitle2, color: 'var(--text-primary)' }}>{title}</span>
        {children}
      </div>
    </div>
  )
}

// Key/value line inside a dialog body.
export function DialogRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--size-120)', ...body1 }}>
      <span style={{ width: 120, flexShrink: 0, color: 'var(--text-secondary)' }}>{label}</span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          color: 'var(--text-primary)',
          textWrap: 'pretty',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export type NoteTone = 'warning' | 'danger' | 'info'

const NOTE_TONES: Record<NoteTone, readonly [string, string, string, string]> = {
  warning: ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)', 'var(--yellow-800)'],
  danger: ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger-fg)', 'var(--red-800)'],
  info: ['var(--info-bg)', 'var(--info-border)', 'var(--info-fg)', 'var(--blue-900)'],
}

// Tinted fills always pair a 100 fill with a 200 border and 700 text; titles on
// tints take the 800 step.
export function Note({
  tone = 'info',
  title,
  children,
}: {
  tone?: NoteTone
  title?: ReactNode
  children?: ReactNode
}) {
  const [bg, border, fg, titleColor] = NOTE_TONES[tone]
  return (
    <div
      role="status"
      style={{
        boxSizing: 'border-box',
        padding: 'var(--size-120) var(--size-160)',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-20)',
      }}
    >
      {title && <span style={{ ...caption1Strong, color: titleColor }}>{title}</span>}
      <span style={{ ...caption1, color: fg, textWrap: 'pretty' }}>{children}</span>
    </div>
  )
}

// Toasts are past tense: "Route assigned", "P13 is posted".
export function Toast({ children }: { children?: ReactNode }) {
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'var(--size-200)',
        transform: 'translateX(-50%)',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--size-100) var(--size-160)',
        background: 'var(--surface-inverse)',
        color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-callout)',
        ...caption1,
        maxWidth: 'min(560px, 92vw)',
        textWrap: 'pretty',
        zIndex: 60,
      }}
    >
      {children}
    </div>
  )
}

// Inline field wrapper — the focus border lands here, not as a ring on the input.
export function Field({
  children,
  height = 'var(--control-height)',
  small = false,
  style,
}: {
  children?: ReactNode
  height?: number | string
  small?: boolean
  style?: CSSProperties
}) {
  return (
    <span
      data-field=""
      style={{
        boxSizing: 'border-box',
        height: small ? 24 : height,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: small ? '0 var(--size-60)' : '0 var(--size-120)',
        border: '1px solid var(--border-default)',
        borderRadius: small ? 'var(--radius-small)' : 'var(--radius-medium)',
        background: 'var(--surface-card)',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
