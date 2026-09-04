import type { ChangeEventHandler, CSSProperties, MouseEvent, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption2, subtitle1 } from '../../ds/type'
import { FOCUS_RING, useFocusRing } from '../../ds/focus'
import { EYEBROW, segTone } from './ui'
import type { Kpi } from './data'

export function SearchField({
  value,
  onChange,
  placeholder,
  width = 220,
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
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-120)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-page)',
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

export function Button({
  children,
  onClick,
  primary,
  trailing,
}: {
  children?: ReactNode
  onClick?: () => void
  primary?: boolean
  trailing?: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: `0 var(--size-${primary ? '160' : '120'})`,
        borderRadius: 'var(--radius-medium)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: primary ? '1px solid var(--primary)' : '1px solid var(--border-default)',
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1,
        fontWeight: primary ? 'var(--weight-semibold)' : 'var(--weight-regular)',
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
      {trailing}
    </div>
  )
}

// A segmented pick - used for audience, timing, answer type and attribution.
export function Seg({
  label,
  on,
  onPick,
  height = 32,
  grow,
}: {
  label: ReactNode
  on: boolean
  onPick: () => void
  height?: number
  grow?: boolean
}) {
  const t = segTone(on)
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        flex: grow ? 1 : undefined,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: grow ? 'center' : 'flex-start',
        padding: `0 var(--size-${height <= 26 ? '100' : '120'})`,
        borderRadius: `var(--radius-${height <= 26 ? 'small' : 'medium'})`,
        background: t.bg,
        border: `1px solid ${t.border}`,
        ...caption1,
        fontWeight: t.weight,
        color: t.fg,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
    >
      {label}
    </div>
  )
}

export function KpiGrid({ items }: { items: readonly Kpi[] }) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(170px, 100%), 1fr))',
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
            gap: 'var(--size-40)',
          }}
        >
          <span style={{ ...EYEBROW, whiteSpace: 'nowrap' }}>{k.label}</span>
          <span style={{ ...subtitle1, color: k.color }}>{k.value}</span>
          <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {k.sub}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Card({
  children,
  overflow = 'visible',
}: {
  children?: ReactNode
  overflow?: CSSProperties['overflow']
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        overflow,
      }}
    >
      {children}
    </div>
  )
}

// A row action that is unavailable keeps its place and explains itself on hover
// rather than disappearing.
/** A tinted ramp plus the plate it takes on hover. */
export interface ActionTone {
  bg: string
  border: string
  fg: string
  hoverBg: string
  strong?: boolean
}

export function RowAction({
  label,
  enabled,
  tone,
  title,
  onClick,
}: {
  label: string
  enabled: boolean
  tone: ActionTone
  title: string
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  const off = !enabled
  const bg = off ? 'var(--surface-subtle)' : hover ? tone.hoverBg : tone.bg
  return (
    <span
      title={title}
      onClick={off ? undefined : onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: bg,
        border: `1px solid ${off ? 'var(--border-subtle)' : tone.border}`,
        ...caption1,
        fontWeight: tone.strong ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: off ? 'var(--text-disabled)' : tone.fg,
        whiteSpace: 'nowrap',
        cursor: off ? 'default' : 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </span>
  )
}

/** A row action. `why` present means it is unavailable, and says why. */
export interface MenuItemSpec {
  label: string
  act?: () => void
  danger?: boolean
  why?: string
}

export function RowMenu({
  open,
  onToggle,
  items,
  flip,
  width = 28,
}: {
  open: boolean
  onToggle: (e: MouseEvent<HTMLSpanElement>) => void
  items: MenuItemSpec[]
  flip?: boolean
  width?: number
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div style={{ width, flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
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
            ...(flip ? { bottom: 26 } : { top: 26 }),
            right: 0,
            boxSizing: 'border-box',
            minWidth: 200,
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
            <MenuRow key={m.label} item={m} />
          ))}
        </div>
      )}
    </div>
  )
}

function MenuRow({ item }: { item: MenuItemSpec }) {
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

export function CheckBox({ on, dim }: { on: boolean; dim?: boolean }) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        width: 14,
        height: 14,
        borderRadius: 'var(--radius-small)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        background: on ? 'var(--primary)' : dim ? 'var(--surface-subtle)' : 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-inverse)',
        ...caption2,
        flexShrink: 0,
      }}
    >
      {on ? '✓' : ''}
    </span>
  )
}

// ---- overlay ---------------------------------------------------------------

export function Modal({
  title,
  width = 640,
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
        background: 'rgba(17,24,39,.75)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--size-160)',
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
          maxHeight: 'calc(100vh - 64px)',
          overflow: 'hidden auto',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xlarge)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHead({
  title,
  onClose,
  big,
}: {
  title: string
  onClose: () => void
  big?: boolean
}) {
  const [hover, hoverProps] = useHover()
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', padding: big ? 'var(--size-200) var(--size-240) var(--size-120) var(--size-240)' : 'var(--size-160) var(--size-200) var(--size-100) var(--size-200)' }}>
        <span style={big ? subtitle1 : { ...body1, fontWeight: 'var(--weight-semibold)' }}>{title}</span>
        <div style={{ flex: 1 }} />
        <span
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-medium)',
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
          <Icon name="DismissSize16ThemeRegular" size={16} />
        </span>
      </div>
      <Rule />
    </>
  )
}

export function Rule() {
  return <div style={{ height: 1, background: 'var(--border-default)', flexShrink: 0 }} />
}

export function FieldLabel({ children }: { children?: ReactNode }) {
  return <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{children}</span>
}

export function Helper({
  children,
  color = 'var(--text-helper)',
}: {
  children?: ReactNode
  color?: string
}) {
  return <span style={{ ...caption2, color, textWrap: 'pretty' }}>{children}</span>
}
