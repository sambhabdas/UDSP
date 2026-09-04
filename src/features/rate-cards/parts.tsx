'use client'

import type { MouseEvent, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1Strong, subtitle2 } from '../../ds/type'
import { Toast as BaseToast } from '../../ds/components/Toast'

export function CardTitle({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-100) var(--size-160)',
      }}
    >
      <span style={subtitle2}>{children}</span>
      {trailing !== undefined && (
        <>
          <div style={{ flex: 1 }} />
          {trailing}
        </>
      )}
    </div>
  )
}

export function PrimaryButton({
  children,
  onClick,
  enabled = true,
}: {
  children?: ReactNode
  onClick?: () => void
  enabled?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={enabled ? onClick : undefined}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: enabled
          ? hover
            ? 'var(--primary-hover)'
            : 'var(--primary)'
          : 'var(--surface-subtle)',
        border: `1px solid ${enabled ? 'var(--primary)' : 'var(--border-default)'}`,
        color: enabled ? 'var(--text-inverse)' : 'var(--text-disabled)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: enabled ? 'pointer' : 'default',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

export function GhostButton({ children, onClick }: { children?: ReactNode; onClick?: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
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

/** The 24px square controls the timeline header uses. */
export function TinySquare({
  children,
  onClick,
  title,
  color = 'var(--text-secondary)',
  cursor = 'pointer',
}: {
  children?: ReactNode
  onClick?: () => void
  title?: string
  color?: string
  cursor?: string
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: 24,
        height: 24,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        border: '1px solid var(--border-default)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        ...body1Strong,
        color,
        cursor,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}

/** A tinted badge: 100 fill, 200 hairline, 700 text. Used for Amazon/DSP. */
export function Badge({
  children,
  bg,
  border,
  fg,
  dot,
  title,
}: {
  children?: ReactNode
  bg: string
  border: string
  fg: string
  dot?: string
  title?: string
}) {
  return (
    <span
      title={title}
      style={{
        boxSizing: 'border-box',
        height: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: bg,
        border: `1px solid ${border}`,
        ...caption1Strong,
        color: fg,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 'var(--radius-circle)',
            background: dot,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}

/** The 36×18 switch the Others rows and the carry-forward control share. */
export function Switch({ on, onClick, title }: { on: boolean; onClick?: () => void; title?: string }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: 36,
        height: 18,
        flexShrink: 0,
        borderRadius: 9,
        padding: 2,
        background: on ? 'var(--primary)' : 'var(--neutral-400)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
    >
      <span
        style={{ width: 14, height: 14, borderRadius: 'var(--radius-circle)', background: 'var(--white)' }}
      />
    </span>
  )
}

/** The editable rate cell - a control, not a label, wherever it can be changed. */
export function RateCell({
  children,
  onClick,
  title,
  bg = 'var(--surface-card)',
  border = 'var(--border-default)',
  hoverBorder = 'var(--border-focus)',
  fg = 'var(--text-primary)',
  cursor = 'pointer',
}: {
  children?: ReactNode
  onClick?: () => void
  title?: string
  bg?: string
  border?: string
  hoverBorder?: string
  fg?: string
  cursor?: string
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      // Always wired, even when the cell is not editable: a locked rate has to
      // be able to say why it is locked, and `openEditor` is what says it.
      onClick={onClick}
      title={title}
      style={{
        boxSizing: 'border-box',
        height: 28,
        minWidth: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: bg,
        border: `1px solid ${hover && cursor === 'pointer' ? hoverBorder : border}`,
        ...body1,
        fontWeight: 'var(--weight-semibold)',
        color: fg,
        fontVariantNumeric: 'tabular-nums',
        cursor,
        transition: 'background var(--motion-hover), border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

export function Labelled({ label, children, width }: { label: ReactNode; children?: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', width }}>
      <span style={caption1Strong}>{label}</span>
      {children}
    </div>
  )
}

export function Field({
  children,
  width,
  border = 'var(--border-default)',
  onClick,
}: {
  children?: ReactNode
  width?: number | string
  border?: string
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
}) {
  return (
    <span
      data-field=""
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width,
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-120)',
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
      }}
    >
      {children}
    </span>
  )
}

/** The full-screen scrim both dialogs sit on. */
export function Scrim({ onClose, children }: { onClose: () => void; children?: ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto',
        padding: 'var(--size-320) var(--size-160)',
      }}
    >
      {children}
    </div>
  )
}

export function Dialog({
  width,
  label,
  children,
}: {
  width: number
  label: string
  children?: ReactNode
}) {
  return (
    <div
      data-dialog-card=""
      data-dialog-loose=""
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={label}
      style={{
        boxSizing: 'border-box',
        width,
        marginBlock: 'auto',
        flexShrink: 0,
        // Visible, not hidden: the date pickers hang outside the dialog box.
        overflow: 'visible',
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-dialog)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-160)',
        padding: 'var(--size-240)',
      }}
    >
      {children}
    </div>
  )
}

export function DialogFoot({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        paddingTop: 'var(--size-120)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ flex: 1 }} />
      {children}
    </div>
  )
}

export function SortGlyph({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span style={{ display: 'flex' }}>
      <Icon
        name={active ? (dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'}
        size={12}
        color={active ? 'currentColor' : 'var(--text-disabled)'}
      />
    </span>
  )
}

/** Caption-scale toast - this page's design file sets it one step down. */
export function Toast({ children, onUndo }: { children: ReactNode; onUndo?: () => void }) {
  return <BaseToast size="caption" onUndo={onUndo}>{children}</BaseToast>
}
