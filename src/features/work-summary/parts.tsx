'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong } from '../../ds/type'
export { Toast } from '../../ds/components/Toast'

/** The 1px rule that separates groups inside a toolbar. */
export function Divider() {
  return <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 var(--size-40)' }} />
}

/** A 28px bar button. `danger` is the Remove control's red label. */
export function BarButton({
  children,
  onClick,
  title,
  danger,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  title?: string
  danger?: boolean
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
        height: 28,
        minWidth: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        border: '1px solid var(--border-default)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        color: danger ? 'var(--danger-fg)' : 'var(--text-primary)',
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

/** A control-height button — the page's top bar and the dialog's footer. */
export function TallButton({
  children,
  onClick,
  primary,
  chevron,
  title,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  chevron?: boolean
  title?: string
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-pop={chevron ? '' : undefined}
      role="button"
      tabIndex={0}
      title={title}
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
      <span>{children}</span>
      {chevron && (
        <span style={{ display: 'inline-flex', marginLeft: 'var(--size-40)', transform: 'rotate(90deg)' }}>
          <Icon name="FnChevronRight" size={16} />
        </span>
      )}
    </div>
  )
}

/** The blue count pill. */
export function CountPill({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--blue-50)',
        border: '1px solid var(--blue-200)',
        color: 'var(--blue-700)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** The selection count, with the × that drops it. */
export function SelChip({ n, onClear }: { n: number; onClear: () => void }) {
  return (
    <>
      <Divider />
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          height: 24,
          padding: '0 var(--size-100)',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--blue-50)',
          border: '1px solid var(--blue-200)',
        }}
      >
        <span style={{ ...caption1Strong, color: 'var(--blue-700)' }}>{n} selected</span>
        <span
          role="button"
          tabIndex={0}
          title="Clear the selection"
          onClick={onClear}
          style={{ display: 'flex', color: 'var(--blue-700)', cursor: 'pointer' }}
        >
          <Icon name="FnDismiss" size={12} />
        </span>
      </div>
    </>
  )
}

/** A square icon hit target in the page's top bar. */
export function IconSquare({ name, title, onClick }: { name: string; title: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-small)',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={16} />
    </div>
  )
}

/** The table's search box. Its magnifier hides on focus or once there is text. */
export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      data-search=""
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
      style={{
        cursor: 'text',
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        width: 220,
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
        placeholder="Filter rows"
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
      />
    </div>
  )
}

/** A column head. Every column on this page sorts, so the glyph is never absent. */
export function Th({
  label,
  sortIcon,
  sortColor,
  onSort,
}: {
  label: string
  sortIcon: string
  sortColor: string
  onSort: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSort}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-20)', cursor: 'pointer' }}
    >
      <span
        style={{ ...caption1Strong, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
      >
        {label}
      </span>
      <span style={{ display: 'flex', color: sortColor }}>
        <Icon name={sortIcon} size={12} />
      </span>
    </div>
  )
}

/**
 * A cell you can type into. Both tables use the same 28px editor; the display
 * side varies, so it comes in as `children`.
 */
export function EditCell({
  editing,
  value,
  onChange,
  onCommit,
  onCancel,
  title,
  cursor,
  onStart,
  children,
  /** Notes hang their hover plate off both edges; number cells only the left. */
  inset,
  gap,
}: {
  editing: boolean
  value: string
  onChange: (v: string) => void
  onCommit: () => void
  onCancel: () => void
  title?: string
  cursor: CSSProperties['cursor']
  onStart: () => void
  children: ReactNode
  inset?: boolean
  gap?: boolean
}) {
  const [hover, hoverProps] = useHover()
  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onCommit()
          if (e.key === 'Escape') onCancel()
        }}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: 28,
          padding: '0 var(--size-60)',
          borderRadius: 'var(--radius-small)',
          border: '1px solid var(--primary)',
          background: 'var(--white)',
          outline: 'none',
          ...body1,
          color: 'var(--text-primary)',
        }}
      />
    )
  }
  return (
    <div
      tabIndex={0}
      title={title}
      onClick={onStart}
      style={{
        boxSizing: 'border-box',
        minHeight: 28,
        display: 'flex',
        alignItems: 'center',
        gap: gap ? 'var(--size-40)' : undefined,
        ...(inset
          ? { padding: '0 var(--size-60)', margin: '0 calc(var(--size-60) * -1)' }
          : { flex: 1, minWidth: 0, padding: '0 var(--size-60)', marginLeft: 'calc(-1 * var(--size-60))' }),
        borderRadius: 'var(--radius-small)',
        cursor,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

/** A row that adds another row to the table it sits under. */
export function AddRow({ label, onClick }: { label: string; onClick: (e: React.MouseEvent<HTMLDivElement>) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-pop=""
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        minHeight: 40,
        padding: 'var(--size-40) var(--size-160)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <span style={{ ...caption1Strong, color: 'var(--blue-700)' }}>{label}</span>
    </div>
  )
}

/** A small state or tag chip. */
export function TagChip({
  children,
  bg,
  border,
  fg,
  height = 18,
  dashed,
  title,
  justifySelf,
}: {
  children: ReactNode
  bg: string
  border: string
  fg: string
  height?: number
  dashed?: boolean
  title?: string
  justifySelf?: CSSProperties['justifySelf']
}) {
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        justifySelf,
        alignItems: 'center',
        height,
        padding: `0 var(--size-${height === 18 ? '60' : '80'})`,
        borderRadius: height === 18 ? 'var(--radius-small)' : 'var(--radius-medium)',
        background: bg,
        border: `1px ${dashed ? 'dashed' : 'solid'} ${border}`,
        color: fg,
        ...caption1Strong,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}


/** The plain body-1 number a table cell shows. */
export function Num({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span style={{ ...body1, color, fontVariantNumeric: 'tabular-nums' }}>{children}</span>
  )
}

/** The caption-1 text a name or note cell shows. */
export function Label({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span style={{ ...caption1, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {children}
    </span>
  )
}
