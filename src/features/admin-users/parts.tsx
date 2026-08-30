import type { ChangeEventHandler, MouseEvent, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, caption2, subtitle1, subtitle2 } from '../../ds/type'
import { labelEyebrow as EYEBROW } from '../../ds/type'
import { FOCUS_RING, useFocusRing } from '../../ds/focus'
import { TONES } from './ui'
import type { Tone } from './ui'
import type { Head, StatusTone } from './data'

/** A KPI tile: a label, a figure, and the colour the figure carries. */
export interface KpiTile {
  label: string
  value: string
  color?: string
}

/** A row action. `why` present means it is unavailable, and says why. */
export interface MenuItemSpec {
  label: string
  act?: () => void
  danger?: boolean
  why?: string
}

export { TONES }
export type { Tone }

export function CheckBox({
  on,
  onClick,
  dim,
}: {
  on: boolean
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
  dim?: boolean
}) {
  return (
    <span
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: 14,
        height: 14,
        borderRadius: 'var(--radius-small)',
        border: `1px solid ${on ? 'var(--primary)' : dim ? 'var(--border-subtle)' : 'var(--border-strong)'}`,
        background: on ? 'var(--primary)' : 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-inverse)',
        ...caption2,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {on ? '✓' : ''}
    </span>
  )
}

// Status is a dot and a word, never a colour on its own.
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

export function SearchField({
  value,
  onChange,
  placeholder,
  width = 240,
}: {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  width?: number | string
}) {
  return (
    <span
      data-field=""
      onClick={(e) => e.stopPropagation()}
      style={{
        boxSizing: 'border-box',
        width,
        maxWidth: '100%',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-100)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
      }}
    >
      <Icon name="SearchGlyph" size={16} color="var(--text-disabled)" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-family)',
          ...caption1,
          color: 'var(--text-primary)',
          padding: 0,
        }}
      />
    </span>
  )
}

export function FilterButton({ applied, onClick }: { applied: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onClick}
      title="Filters"
      style={{
        boxSizing: 'border-box',
        width: 28,
        height: 28,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-small)',
        background: applied ? 'var(--blue-100)' : hover ? 'var(--surface-subtle)' : 'transparent',
        border: '1px solid transparent',
        color: applied ? 'var(--blue-700)' : 'var(--text-secondary)',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      <Icon name="FnFilter" size={16} />
    </div>
  )
}

export function SmallButton({
  children,
  onClick,
  primary,
  icon,
}: {
  children?: ReactNode
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  icon?: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: primary ? '1px solid var(--primary)' : '1px solid var(--border-default)',
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
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
      {icon && <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>{icon}</span>}
      {children}
    </div>
  )
}

// A bulk action carries the colour of what it does.
export function ToneButton({
  children,
  onClick,
  tone,
  trailing,
}: {
  children?: ReactNode
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  tone: Tone
  trailing?: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: hover ? tone.hoverBg : tone.bg,
        border: `1px solid ${tone.border}`,
        color: tone.fg,
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
      {trailing}
    </div>
  )
}

export function HeadRow({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--size-160)',
        padding: 'var(--size-80) var(--space-cell-x)',
        background: 'var(--surface-subtle)',
        borderBottom: '1px solid var(--border-default)',
        ...EYEBROW,
      }}
    >
      <div style={{ width: 24, flexShrink: 0 }} />
      {children}
    </div>
  )
}

export function HeadCell<K extends string>({
  h,
  sort,
  onSort,
}: {
  h: Head<K>
  sort: { col: K; dir: 'asc' | 'desc' }
  onSort: () => void
}) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  const active = sort.col === h.k
  return (
    <div
      onClick={h.k ? onSort : undefined}
      style={{
        boxSizing: 'border-box',
        width: h.w || 'auto',
        flex: h.flex || 'none',
        minWidth: h.min || 0,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        justifyContent: h.center ? 'center' : 'flex-start',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        cursor: h.k ? 'pointer' : 'default',
        userSelect: 'none',
        borderRadius: 'var(--radius-small)',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        color: active || (hover && h.k) ? 'var(--text-primary)' : 'var(--text-label)',
      }}
      {...hoverProps}
      {...(h.k ? focusProps : {})}
    >
      {h.label}
      {h.k && (
        <span style={{ display: 'flex' }}>
          <Icon
            name={active ? (sort.dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'}
            size={12}
            color={active ? 'currentColor' : 'var(--text-disabled)'}
          />
        </span>
      )}
    </div>
  )
}

export function Row({ children, fg }: { children?: ReactNode; fg?: string }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        ...caption1,
        color: fg,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

export function RowMenu({
  open,
  onToggle,
  items,
  minWidth = 210,
  flip,
}: {
  open: boolean
  onToggle: (e: MouseEvent<HTMLSpanElement>) => void
  items: MenuItemSpec[]
  minWidth?: number
  flip?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div style={{ width: 72, flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <span
        onClick={onToggle}
        style={{
          width: 24,
          height: 24,
          borderRadius: 'var(--radius-small)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          background: hover ? 'var(--surface-subtle)' : 'transparent',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <Icon name="SvMore" size={16} />
      </span>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            // Opening upward keeps the menu inside the scroller's box; a
            // downward menu on the last rows would be clipped by it.
            ...(flip ? { bottom: 26 } : { top: 26 }),
            right: 0,
            boxSizing: 'border-box',
            minWidth,
            padding: 'var(--size-40)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-callout)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {items.map((m) => (
            <MenuItem key={m.label} item={m} />
          ))}
        </div>
      )}
    </div>
  )
}

// A dark item keeps its place and says why, rather than vanishing and leaving
// you to wonder whether you missed it.
function MenuItem({ item }: { item: MenuItemSpec }) {
  const [hover, hoverProps] = useHover()
  const off = !!item.why
  return (
    <div
      title={item.why || ''}
      onClick={off ? (e) => e.stopPropagation() : item.act}
      style={{
        boxSizing: 'border-box',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        ...body1,
        color: off ? 'var(--text-disabled)' : item.danger ? 'var(--danger-fg)' : 'var(--text-primary)',
        whiteSpace: 'nowrap',
        cursor: off ? 'default' : 'pointer',
        background: !off && hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {item.label}
    </div>
  )
}

export function ZeroState({ text, onClear }: { text: string; onClear: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-240)' }}>
      <span style={{ ...caption1, color: 'var(--text-secondary)', textAlign: 'center' }}>{text}</span>
      <span onClick={onClear} style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}>
        Clear filters
      </span>
    </div>
  )
}

export function KpiGrid({ items }: { items: readonly KpiTile[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
        gap: 'var(--grid-gutter)',
      }}
    >
      {items.map((k) => (
        <div
          key={k.label}
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--size-120) var(--size-160)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-20)',
          }}
        >
          <span style={{ ...EYEBROW, whiteSpace: 'nowrap' }}>{k.label}</span>
          <span style={{ ...subtitle1, color: k.color }}>{k.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TableCard({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        overflow: 'visible',
      }}
    >
      {children}
    </div>
  )
}

// The columns are fixed-width because they are compared down the page, so the
// table scrolls sideways inside its own box rather than dragging the whole page
// (and its sticky tab bar) with it. The toolbar stays outside the scroller.
export function TableScroll({ minWidth, children }: { minWidth: number; children?: ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  )
}

export function Toolbar({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--size-80) var(--size-120)',
        padding: 'var(--size-100) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {children}
    </div>
  )
}

// ---- dialogs --------------------------------------------------------------

export function Modal({
  title,
  width = 560,
  onClose,
  children,
}: {
  title: string
  width?: number
  onClose: () => void
  children?: ReactNode
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
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto',
        padding: 'var(--size-320) var(--size-160)',
      }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
        style={{
          boxSizing: 'border-box',
          width,
          marginBlock: 'auto',
          flexShrink: 0,
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
    </div>
  )
}

export function ModalHead({ title, onClose }: { title: string; onClose: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
      <span style={{ flex: 1, minWidth: 0, ...subtitle2 }}>{title}</span>
      <span
        onClick={onClose}
        aria-label="Close"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-small)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          background: hover ? 'var(--surface-subtle)' : 'transparent',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <Icon name="DismissSize16ThemeRegular" size={16} />
      </span>
    </div>
  )
}

export function ModalFoot({ children }: { children?: ReactNode }) {
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

export function Btn({
  children,
  onClick,
  tone,
  disabled,
}: {
  children?: ReactNode
  onClick?: () => void
  tone?: 'primary' | 'danger'
  disabled?: boolean
}) {
  const [hover, hoverProps] = useHover()
  const primary = tone === 'primary'
  const danger = tone === 'danger'
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: disabled
          ? 'var(--surface-subtle)'
          : danger
            ? 'var(--danger-accent)'
            : primary
              ? hover ? 'var(--primary-hover)' : 'var(--primary)'
              : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${
          disabled ? 'var(--border-default)' : danger ? 'var(--danger-accent)' : primary ? 'var(--primary)' : 'var(--border-default)'
        }`,
        color: disabled ? 'var(--text-disabled)' : primary || danger ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1,
        fontWeight: 'var(--weight-semibold)',
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

export function Labelled({
  label,
  children,
  width,
  flex,
  min,
}: {
  label: string
  children?: ReactNode
  width?: number | string
  flex?: number
  min?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', width, flex, minWidth: min }}>
      <span style={caption1Strong}>{label}</span>
      {children}
    </div>
  )
}

export function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
}) {
  return (
    <span
      data-field=""
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)',
      }}
    >
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-family)',
          ...body1,
          color: 'var(--text-primary)',
          padding: 0,
        }}
      />
    </span>
  )
}
