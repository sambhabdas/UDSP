import { body1Strong, caption1Strong } from '../type.js'
import { useHover } from '../useHover.js'

// Fills for the three tones the console uses. Ghost is the default rectangle:
// white plate, hairline, subtle hover — never a colour change.
const TONES = {
  primary: {
    bg: 'var(--primary)',
    hover: 'var(--primary-hover)',
    border: 'var(--primary)',
    fg: 'var(--text-inverse)',
  },
  danger: {
    bg: 'var(--red-600)',
    hover: 'var(--red-700)',
    border: 'var(--red-600)',
    fg: 'var(--text-inverse)',
  },
  ghost: {
    bg: 'var(--surface-card)',
    hover: 'var(--surface-subtle)',
    border: 'var(--border-default)',
    fg: 'var(--text-primary)',
  },
}

// Disabled is neutral-400 text on a subtle plate, never reduced opacity.
const DISABLED = {
  bg: 'var(--surface-subtle)',
  hover: 'var(--surface-subtle)',
  border: 'var(--border-default)',
  fg: 'var(--text-disabled)',
}

// `small` is the 24px in-card control; the default is the 32px --control-height.
// Radius follows the shape: Small under 32px, Medium at it.
export function Button({
  children,
  onClick,
  tone = 'ghost',
  small = false,
  disabled = false,
  title,
  style,
}) {
  const [hover, hoverProps] = useHover()
  const t = disabled ? DISABLED : TONES[tone]
  return (
    <div
      onClick={disabled ? undefined : onClick}
      title={title}
      style={{
        boxSizing: 'border-box',
        height: small ? 24 : 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: small ? '0 var(--size-80)' : '0 var(--size-120)',
        borderRadius: small ? 'var(--radius-small)' : 'var(--radius-medium)',
        background: hover && !disabled ? t.hover : t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
        ...(small ? caption1Strong : body1Strong),
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
        ...style,
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

// Status pill — a coloured dot plus a word, so meaning survives greyscale.
// Medium radius is the named badge exception at 20px tall.
export function StatusPill({ tone, children, title }) {
  const [bg, border, fg, dot] = tone
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
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 'var(--radius-circle)',
          background: dot,
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  )
}

// Icon-only square control — the 24/28px affordances inside rows and toolbars.
export function IconButton({ children, onClick, title, size = 24, color = 'var(--text-secondary)' }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      title={title}
      style={{
        boxSizing: 'border-box',
        width: size,
        height: size,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        color,
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}
