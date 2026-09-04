'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption2, caption2Strong } from '../../ds/type'

/**
 * The small square hit targets in the card's chrome - close, back, backspace.
 * They tint on hover and carry no border of their own.
 */
export function GhostButton({
  size = 24,
  title,
  color = 'var(--text-secondary)',
  onClick,
  onMouseDown,
  children,
}: {
  size?: number
  title?: string
  color?: string
  onClick?: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  children: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        cursor: 'pointer',
        flexShrink: 0,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}

/** A round monogram. `dot` marks somebody who is out on a route right now. */
export function Avatar({
  text,
  bg,
  fg,
  size = 32,
  dot,
  font,
}: {
  text: string
  bg: string
  fg: string
  size?: number
  dot?: boolean
  font?: number
}) {
  return (
    <span
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        width: size,
        height: size,
        borderRadius: 'var(--radius-circle)',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(font ? { fontSize: font } : caption2Strong),
        fontWeight: 'var(--weight-semibold)',
        flexShrink: 0,
      }}
    >
      {text}
      {dot && (
        <span
          title="On route now"
          style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: size >= 32 ? 9 : 8,
            height: size >= 32 ? 9 : 8,
            borderRadius: 'var(--radius-circle)',
            background: 'var(--success-accent)',
            border: '2px solid var(--surface-card)',
          }}
        />
      )}
    </span>
  )
}

/** A tappable list row - history, contacts and message threads share it. */
export function ListRow({
  height,
  title,
  onClick,
  children,
}: {
  height: number
  title?: string
  onClick?: () => void
  children: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        height,
        flexShrink: 0,
        padding: height >= 56 ? 'var(--size-80)' : '0 var(--size-80)',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

/** The one-line helper text the card uses under a list or a control. */
export function Helper({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <span style={{ ...caption2, color: 'var(--text-helper)', textAlign: center ? 'center' : undefined }}>
      {children}
    </span>
  )
}

/** A key on the pad. `sub` is the letter group; DTMF keys drop it. */
export function PadKey({
  digit,
  sub,
  height,
  onPress,
}: {
  digit: string
  sub?: string
  height: number
  onPress: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height,
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--neutral-200)' : 'var(--surface-subtle)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span
        style={{
          fontSize: 'var(--body-1-size)',
          lineHeight: sub === undefined ? undefined : '16px',
          fontWeight: 'var(--weight-semibold)',
        }}
      >
        {digit}
      </span>
      {sub !== undefined && (
        <span style={{ fontSize: 9, lineHeight: '10px', color: 'var(--text-helper)', letterSpacing: '.5px' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

/** One of the four round in-call toggles. */
export function CallControl({
  label,
  icon,
  on,
  onPress,
}: {
  label: string
  icon: string
  on: boolean
  onPress: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-20)', cursor: 'pointer' }}
    >
      <span
        style={{
          boxSizing: 'border-box',
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-circle)',
          background: on ? 'var(--blue-100)' : 'var(--surface-subtle)',
          border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-subtle)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
          transition: 'background var(--motion-hover)',
        }}
      >
        <Icon name={icon} size={16} />
      </span>
      <Helper>{label}</Helper>
    </div>
  )
}
