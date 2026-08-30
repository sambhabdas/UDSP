import type { ReactNode } from 'react'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2, caption2Strong, subtitle1 } from '../../ds/type'
import { labelEyebrow as EYEBROW } from '../../ds/type'
import { FOCUS_RING, useFocusRing } from '../../ds/focus'
import type { StatusTone } from './data'

export function Section({
  label,
  info,
  children,
}: {
  label: string
  info?: string
  children?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        <span style={{ ...EYEBROW, whiteSpace: 'nowrap' }}>{label}</span>
        {info && <InfoDot title={info} />}
      </span>
      {children}
    </div>
  )
}

// The explanation lives on the number it qualifies, not in a footnote.
export function InfoDot({ title }: { title: string }) {
  return (
    <span
      title={title}
      style={{
        boxSizing: 'border-box',
        width: 14,
        height: 14,
        borderRadius: 'var(--radius-circle)',
        border: '1px solid var(--border-strong)',
        color: 'var(--text-secondary)',
        ...caption2Strong,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'help',
        flexShrink: 0,
      }}
    >
      i
    </span>
  )
}

// A card split into equal cells by a hairline. The negative margin lets each
// cell own one edge, so wrapping never doubles a rule or leaves one dangling.
export function CellGrid({ min, children }: { min: number; children?: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

export function Cell({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--size-160)',
        borderLeft: '1px solid var(--border-subtle)',
        borderTop: '1px solid var(--border-subtle)',
        margin: '-1px 0 0 -1px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-60)',
      }}
    >
      {children}
    </div>
  )
}

export function CellLabel({ children, info }: { children?: ReactNode; info?: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
      <span style={{ ...EYEBROW, whiteSpace: 'nowrap' }}>{children}</span>
      {info && <InfoDot title={info} />}
    </span>
  )
}

export function BigNumber({ children, color }: { children?: ReactNode; color?: string }) {
  return (
    <span style={{ ...subtitle1, fontVariantNumeric: 'tabular-nums', color, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

export function Meter({ pct, fill }: { pct: string; fill: string }) {
  return (
    <div style={{ height: 6, borderRadius: 'var(--radius-small)', background: 'var(--surface-subtle)', overflow: 'hidden' }}>
      <div style={{ width: pct, height: '100%', background: fill }} />
    </div>
  )
}

export function TinyButton({
  children,
  onClick,
  inline,
}: {
  children?: ReactNode
  onClick?: () => void
  inline?: boolean
}) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        display: inline ? 'inline-flex' : 'flex',
        height: 24,
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      {children}
    </div>
  )
}

export function StatusPill({ tone, children }: { tone: StatusTone; children?: ReactNode }) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        ...caption1Strong,
        color: tone.fg,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: tone.dot, flexShrink: 0 }} />
      {children}
    </span>
  )
}

export function Sub({
  children,
  color = 'var(--text-secondary)',
}: {
  children?: ReactNode
  color?: string
}) {
  return (
    <span style={{ ...caption1, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {children}
    </span>
  )
}

export function Helper({ children }: { children?: ReactNode }) {
  return <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{children}</span>
}
