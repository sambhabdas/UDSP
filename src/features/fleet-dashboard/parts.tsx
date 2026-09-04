'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { TILE_LABEL } from './style'
import type { SortState } from './useFleetDashboard'
export { Toast } from '../../ds/components/Toast'

export function SectionTitle({ children }: { children: ReactNode }) {
  return <span style={subtitle2}>{children}</span>
}

/** A KPI tile. `size` is the number's type - 28px on the fleet row, 24 in spend. */
export function Tile({
  label,
  value,
  color,
  size,
  dim,
  onClick,
  children,
}: {
  label: string
  value: string
  color: string
  size: 28 | 24
  dim?: boolean
  onClick: () => void
  children?: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        padding: 'var(--size-160)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        opacity: dim ? 0.65 : 1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--size-40)' }}>
        <span style={TILE_LABEL}>{label}</span>
      </div>
      <span
        style={{
          fontSize: size,
          lineHeight: `${size === 28 ? 36 : 32}px`,
          fontWeight: 'var(--weight-semibold)',
          letterSpacing: '-0.3px',
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      {children}
    </div>
  )
}

/** The ±% chip under a spend tile. Down is good, so down is green. */
export function DeltaBadge({ text, good }: { text: string; good: boolean }) {
  return (
    <span
      style={{
        flexShrink: 0,
        boxSizing: 'border-box',
        height: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: good ? 'var(--success-bg)' : 'var(--danger-bg)',
        border: `1px solid ${good ? 'var(--success-border)' : 'var(--danger-border)'}`,
        color: good ? 'var(--success-fg)' : 'var(--danger-fg)',
        ...caption1Strong,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {text}
    </span>
  )
}

/** The period picker. Both instances on the page are this. */
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
  items: string[]
  current: string
  onToggle: (e: React.MouseEvent) => void
  onPick: (e: React.MouseEvent, p: string) => void
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
            right: 0,
            boxSizing: 'border-box',
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
          }}
        >
          {items.map((p) => (
            <PeriodItem key={p} label={p} on={current === p} onPick={(e) => onPick(e, p)} />
          ))}
        </div>
      )}
    </span>
  )
}

function PeriodItem({ label, on, onPick }: { label: string; on: boolean; onPick: (e: React.MouseEvent) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
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
        color: on ? 'var(--blue-700)' : 'var(--text-primary)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {/* The tick column is always there, so labels line up either way. */}
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>
        {on && <Icon name="FnCheck" size={16} />}
      </span>
      <span>{label}</span>
    </div>
  )
}

/** A bordered search box. */
export function SearchBox({
  value,
  onChange,
  width,
}: {
  value: string
  onChange: (v: string) => void
  width: number
}) {
  return (
    <div
      data-search=""
      // Fleet Dashboard keeps its magnifier when the box has focus or text.
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
        placeholder="Search van"
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, color: 'var(--text-primary)' }}
      />
    </div>
  )
}

export interface HeadDef<K extends string> {
  label: string
  /** A head with no key is a label, not a control. */
  key?: K
  justify?: CSSProperties['justifyContent']
}

/**
 * A sortable head row. Clicking the sorted column flips it; clicking another
 * takes it ascending.
 */
export function SortHead<K extends string>({
  defs,
  sort,
  onSort,
  cols,
  columnGap,
  topBorder,
}: {
  defs: HeadDef<K>[]
  sort: SortState<K>
  onSort: (s: SortState<K>) => void
  cols: string
  columnGap: string
  topBorder?: boolean
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
      {defs.map((d) => {
        const active = !!d.key && sort.k === d.key
        return (
          <div
            key={d.label}
            role={d.key ? 'button' : undefined}
            tabIndex={d.key ? 0 : undefined}
            onClick={
              d.key
                ? () => onSort({ k: d.key!, d: active && sort.d === 'asc' ? 'desc' : 'asc' })
                : undefined
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-40)',
              justifyContent: d.justify ?? 'flex-start',
              ...caption1Strong,
              letterSpacing: '.6px',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              cursor: d.key ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{d.label}</span>
            <span style={{ display: 'flex', color: active ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
              {d.key && <Icon name={active ? (sort.d === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** A clickable table row. */
export function DataRow({
  cols,
  columnGap,
  onClick,
  children,
}: {
  cols: string
  columnGap?: string
  onClick?: () => void
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
        columnGap,
        alignItems: 'center',
        minHeight: 48,
        padding: 'var(--size-60) var(--size-160)',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: onClick ? 'pointer' : undefined,
        background: hover && onClick ? 'var(--surface-subtle)' : undefined,
      }}
      {...hoverProps}
    >
      {children}
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

/** A plain pill - no dot. */
export function Pill({
  bg,
  fg,
  border,
  children,
}: {
  bg: string
  fg: string
  border?: string
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

/** The empty line a filtered table falls back to. */
export function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <span style={{ padding: 'var(--size-160)', ...body1, color: 'var(--text-secondary)' }}>{children}</span>
  )
}

/** A chart's y-axis labels, top to bottom. */
export function AxisLabels({ width, labels }: { width: number; labels: string[] }) {
  return (
    <div
      style={{
        width,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 20,
        paddingBottom: 1,
      }}
    >
      {labels.map((l) => (
        <span key={l} style={{ ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {l}
        </span>
      ))}
    </div>
  )
}
