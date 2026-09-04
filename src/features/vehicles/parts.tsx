'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, subtitle2 } from '../../ds/type'
import type { Sort } from './useVehicles'
import { LABEL } from './style'
export { Toast } from '../../ds/components/Toast'

export function SectionTitle({ children }: { children: ReactNode }) {
  return <span style={subtitle2}>{children}</span>
}

/** A control-height button. `primary` is the blue one, `danger` the red text. */
export function Button({
  children,
  onClick,
  primary,
  danger,
  icon,
  title,
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  danger?: boolean
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
          : danger && hover ? 'var(--danger-bg)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: primary ? 'var(--text-inverse)' : danger ? 'var(--danger-fg)' : 'var(--text-primary)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {icon && (
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
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
        borderRadius: bordered ? 'var(--radius-medium)' : 'var(--radius-small)',
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

/** A bordered search box. Every one on this page is the same shape. */
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
      data-keep-icon=""
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        width,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="FnSearch" size={16} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
      />
    </div>
  )
}

export interface HeadDef {
  label: string
  k?: string
  justify?: CSSProperties['justifyContent']
  pad?: string
}

/** A sortable head row. A head with no key is a label, not a control. */
export function SortHead({
  defs,
  sort,
  onSort,
  cols,
  topBorder,
  columnGap,
}: {
  defs: HeadDef[]
  sort: Sort<string>
  onSort: (s: Sort<string>) => void
  cols: string
  topBorder?: boolean
  columnGap?: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        columnGap,
        alignItems: 'center',
        background: 'var(--surface-subtle)',
        borderTop: topBorder ? '1px solid var(--border-default)' : undefined,
        borderBottom: '1px solid var(--border-default)',
        padding: 'var(--size-60) var(--size-160)',
      }}
    >
      {/* Keyed by position, not label: the checkbox and actions columns both
          have a blank label, and two `key=""` siblings make React drop one.
          A column list is fixed and never reordered, so the index is stable. */}
      {defs.map((d, di) => {
        const active = !!d.k && sort.k === d.k
        return (
          <div
            key={di}
            role={d.k ? 'button' : undefined}
            tabIndex={d.k ? 0 : undefined}
            onClick={d.k ? () => onSort({ k: d.k!, d: active && sort.d === 'asc' ? 'desc' : 'asc' }) : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-40)',
              justifyContent: d.justify ?? 'flex-start',
              paddingLeft: d.pad,
              ...LABEL,
              cursor: d.k ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{d.label}</span>
            <span style={{ display: 'flex', color: active ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
              {d.k && <Icon name={active ? (sort.d === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** A table row. `onClick` makes it hoverable. */
export function Row({
  cols,
  minHeight = 48,
  onClick,
  bg,
  opacity,
  children,
}: {
  cols: string
  minHeight?: number
  onClick?: () => void
  bg?: string
  opacity?: number
  children: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        alignItems: 'center',
        minHeight,
        padding: 'var(--size-60) var(--size-160)',
        borderBottom: '1px solid var(--border-subtle)',
        background: hover && onClick ? 'var(--surface-subtle)' : bg,
        opacity,
        cursor: onClick ? 'pointer' : undefined,
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

/** A pill with a leading status dot. */
export function DotPill({
  bg,
  fg,
  dot,
  onClick,
  alignSelf,
  children,
}: {
  bg: string
  fg: string
  dot: string
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void
  alignSelf?: CSSProperties['alignSelf']
  children: ReactNode
}) {
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      style={{
        alignSelf,
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
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
      {children}
    </span>
  )
}

/** A plain pill - no dot. */
export function Pill({
  bg = 'var(--surface-subtle)',
  fg = 'var(--text-secondary)',
  border = 'var(--border-default)',
  children,
}: {
  bg?: string
  fg?: string
  border?: string | null
  children: ReactNode
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: bg,
        border: border ? `1px solid ${border}` : undefined,
        color: fg,
        ...caption1Strong,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** A removable blue tag. */
export function Tag({ label, onRemove }: { label: string; onRemove: (e: React.MouseEvent) => void }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        height: 24,
        padding: '0 var(--size-40) 0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--blue-100)',
        border: '1px solid var(--blue-200)',
        color: 'var(--blue-700)',
        ...caption1Strong,
      }}
    >
      {label}
      <span
        role="button"
        tabIndex={0}
        onClick={onRemove}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 'var(--radius-small)', cursor: 'pointer' }}
      >
        <Icon name="FnDismiss" size={16} />
      </span>
    </span>
  )
}

export function Checkbox({ on, onClick }: { on: boolean; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width: 16,
        height: 16,
        borderRadius: 'var(--radius-small)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: on ? 'var(--primary)' : 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-inverse)',
      }}
      onClick={onClick}
    >
      {on && <Icon name="FnCheck" size={12} />}
    </span>
  )
}

/** A row of exclusive choices. */
export function Segmented({
  options,
  value,
  onPick,
}: {
  options: string[]
  value: string
  onPick: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--size-40)' }}>
      {options.map((o) => {
        const on = value === o
        return (
          <div
            key={o}
            role="button"
            tabIndex={0}
            onClick={() => onPick(o)}
            style={{
              boxSizing: 'border-box',
              height: 'var(--control-height)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--size-120)',
              borderRadius: 'var(--radius-medium)',
              background: on ? 'var(--blue-50)' : 'var(--surface-card)',
              border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
              color: on ? 'var(--blue-700)' : 'var(--text-primary)',
              ...body1,
              fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {o}
          </div>
        )
      })}
    </div>
  )
}

/** A floating list of choices. Used by the row menus and the profile menu. */
export function Menu({
  items,
  top = 30,
  width = 210,
}: {
  items: { label: string; run: (e: React.MouseEvent) => void }[]
  top?: number
  width?: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        right: 0,
        boxSizing: 'border-box',
        width,
        padding: 'var(--size-40)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {items.map((m) => (
        <MenuItem key={m.label} label={m.label} onClick={m.run} />
      ))}
    </div>
  )
}

export function MenuItem({
  label,
  meta,
  onClick,
  onMouseDown,
}: {
  label: ReactNode
  meta?: string
  onClick?: (e: React.MouseEvent) => void
  onMouseDown?: (e: React.MouseEvent) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        boxSizing: 'border-box',
        minHeight: 'var(--row-height)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        ...body1,
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ flex: meta ? 1 : undefined }}>{label}</span>
      {meta && (
        <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{meta}</span>
      )}
    </div>
  )
}

/** The tab strip both the two views and the profile use. */
export function Tabs({
  items,
  current,
  onPick,
  big,
  padding,
}: {
  items: [string, string][]
  current: string
  onPick: (id: string) => void
  big?: boolean
  padding?: string
}) {
  return (
    <>
      {items.map(([id, label]) => {
        const on = current === id
        return (
          <div
            key={id}
            role="button"
            tabIndex={0}
            onClick={() => onPick(id)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-40)',
              cursor: 'pointer',
              padding: padding ?? 'var(--size-100) 0 var(--size-120) 0',
              paddingBottom: big ? 'var(--size-40)' : undefined,
            }}
          >
            <span
              style={{
                ...(big ? subtitle2 : body1),
                fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {label}
            </span>
            {on && (
              <span
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, borderRadius: 'var(--radius-pill)', background: 'var(--primary)' }}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

/** The empty state a filtered table falls back to, with the way out. */
export function EmptyState({
  message,
  action,
  onAction,
  padding = 'var(--size-480) var(--size-240)',
}: {
  message: string
  action?: string
  onAction?: () => void
  padding?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding }}>
      <span style={{ ...subtitle2, fontWeight: 'var(--weight-regular)', color: 'var(--text-secondary)' }}>
        {message}
      </span>
      {action && (
        <div style={{ marginTop: 'var(--size-40)' }}>
          <Button onClick={onAction}>{action}</Button>
        </div>
      )}
    </div>
  )
}


/** Cell helpers - the four shapes the tables repeat. */
export function Cell({ children, color, mono, bold, align, ellipsis, nums }: {
  children?: ReactNode
  color?: string
  mono?: boolean
  bold?: boolean
  align?: CSSProperties['textAlign']
  ellipsis?: boolean
  nums?: boolean
}) {
  return (
    <span
      style={{
        ...(mono ? caption1 : body1),
        fontFamily: mono ? 'var(--font-mono)' : undefined,
        fontWeight: bold ? 'var(--weight-semibold)' : undefined,
        color,
        textAlign: align,
        fontVariantNumeric: nums ? 'tabular-nums' : undefined,
        whiteSpace: 'nowrap',
        overflow: ellipsis ? 'hidden' : undefined,
        textOverflow: ellipsis ? 'ellipsis' : undefined,
        paddingRight: ellipsis ? 'var(--size-80)' : undefined,
      }}
    >
      {children}
    </span>
  )
}
