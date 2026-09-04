import type { ReactNode } from 'react'
import { caption1, caption1Strong, caption2Strong } from '../type'
import { useHover } from '../useHover'

// Selectable pill - the Recents filter row and the timeline channel row.
// Selected is two channels so it survives greyscale: tinted plate + weight.
export function FilterChip({
  label,
  selected,
  onSelect,
}: {
  label: ReactNode
  selected?: boolean
  onSelect?: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onSelect}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-pill)',
        background: selected
          ? 'var(--blue-100)'
          : hover
            ? 'var(--surface-subtle)'
            : 'var(--white)',
        border: `1px solid ${selected ? 'var(--blue-200)' : 'var(--border-default)'}`,
        ...(selected ? caption1Strong : caption1),
        color: selected ? 'var(--blue-700)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

// Read-only status pill - 20px tall, Caption 2 semibold on a tinted plate.
export function StatusChip({
  children,
  bg,
  border,
  fg,
  title,
}: {
  children?: ReactNode
  bg: string
  border: string
  fg: string
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
        whiteSpace: 'nowrap',
        flexShrink: 0,
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-pill)',
        background: bg,
        border: `1px solid ${border}`,
        ...caption2Strong,
        color: fg,
      }}
    >
      {children}
    </span>
  )
}
