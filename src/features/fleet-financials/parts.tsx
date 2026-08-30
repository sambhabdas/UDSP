'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { LABEL } from './style'
export { Toast } from '../../ds/components/Toast'

export function SectionTitle({ children }: { children: ReactNode }) {
  return <span style={subtitle2}>{children}</span>
}

/** A control-height button. */
export function Button({
  children,
  onClick,
  primary,
  icon,
  title,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  icon?: string
  title?: string
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
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: icon ? 'var(--size-60)' : undefined,
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
      {icon && (
        <span style={{ display: 'flex', color: primary ? undefined : 'var(--text-secondary)' }}>
          <Icon name={icon} size={16} />
        </span>
      )}
      {children}
    </div>
  )
}

/** A square icon hit target. */
export function IconButton({
  name,
  size = 16,
  box = 28,
  bordered,
  title,
  onClick,
}: {
  name: string
  size?: number
  box?: number
  bordered?: boolean
  title?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
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
        justifyContent: 'center',
        width: box,
        height: box,
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : bordered ? 'var(--surface-card)' : 'transparent',
        border: bordered ? '1px solid var(--border-default)' : undefined,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={size} />
    </div>
  )
}

/** The search box. Its border turns primary while it holds text. */
export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      data-search=""
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        width: 220,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        border: `1px solid ${value.trim() ? 'var(--primary)' : 'var(--border-default)'}`,
      }}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="FnSearch" size={16} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search vehicle or VIN"
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
      />
    </div>
  )
}

/** The Filters button, with a count badge once anything is on. */
export function FilterButton({ count, onClick }: { count: number; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: count ? 'var(--blue-700)' : 'var(--text-primary)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}>
        <Icon name="FnFilter" size={16} />
      </span>
      Filters
      {count > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 18,
            height: 18,
            padding: '0 var(--size-40)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--primary)',
            color: 'var(--text-inverse)',
            ...caption1Strong,
          }}
        >
          {count}
        </span>
      )}
    </div>
  )
}

/** The period picker, and the only dropdown on the page's top bar. */
export function PeriodPicker({
  label,
  open,
  items,
  current,
  onToggle,
  onPick,
}: {
  label: string
  open: boolean
  items: { key: string | number; label: string }[]
  current: string | number
  onToggle: (e: React.MouseEvent) => void
  onPick: (key: string | number) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        style={{
          boxSizing: 'border-box',
          height: 'var(--control-height)',
          minWidth: 150,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)',
          background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          ...body1,
          cursor: 'pointer',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={16} />
        </span>
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 0,
            boxSizing: 'border-box',
            width: 220,
            maxHeight: 320,
            overflow: 'hidden auto',
            padding: 'var(--size-40)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-20)',
          }}
        >
          {items.map((it) => (
            <PeriodItem key={it.key} label={it.label} on={it.key === current} onPick={() => onPick(it.key)} />
          ))}
        </div>
      )}
    </span>
  )
}

function PeriodItem({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onPick() }}
      style={{
        boxSizing: 'border-box',
        minHeight: 'var(--row-height)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : on ? 'var(--blue-50)' : 'transparent',
        ...body1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {/* The tick column is always there, so labels line up either way. */}
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>
        {on && <Icon name="FnCheck" size={16} />}
      </span>
      <span style={{ color: on ? 'var(--blue-700)' : 'var(--text-primary)' }}>{label}</span>
    </div>
  )
}

/** A pill with a leading status dot. */
export function DotPill({ bg, fg, dot, children }: { bg: string; fg: string; dot: string; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        height: 20,
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: bg,
        color: fg,
        ...caption1Strong,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
      {children}
    </span>
  )
}

/** A sortable head cell. Every column on this page sorts. */
export function SortHeadCell({
  label,
  justify,
  active,
  dir,
  onSort,
}: {
  label: string
  justify: CSSProperties['justifyContent']
  active: boolean
  dir: 'asc' | 'desc'
  onSort: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSort}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', justifyContent: justify, ...LABEL, cursor: 'pointer' }}
    >
      <span>{label}</span>
      <span style={{ display: 'flex', color: active ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
        <Icon name={active ? (dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
      </span>
    </div>
  )
}


/** The selection read-out, docked bottom-right while a range is held. */
export function SelSummary({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 32,
        bottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        padding: 'var(--size-100) var(--size-160)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--neutral-900)',
        color: 'var(--text-inverse)',
        ...body1,
        fontVariantNumeric: 'tabular-nums',
        boxShadow: 'var(--elevation-callout)',
        zIndex: 70,
      }}
    >
      {children}
      <span style={{ ...caption1, color: 'var(--neutral-400)' }}>
        Ctrl+C copy · Ctrl+V paste · Ctrl+D fill · Ctrl+Z undo
      </span>
    </div>
  )
}

/** The modal shell the three dialogs share. */
export function Scrim({
  onClose,
  align = 'center',
  children,
}: {
  onClose: () => void
  align?: 'center' | 'right'
  children: ReactNode
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        display: 'flex',
        alignItems: align === 'center' ? 'center' : undefined,
        justifyContent: align === 'center' ? 'center' : 'flex-end',
        zIndex: 60,
      }}
    >
      {children}
    </div>
  )
}
