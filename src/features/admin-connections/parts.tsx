import type { ChangeEventHandler, CSSProperties, MouseEvent, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, caption2, caption2Strong, subtitle2 } from '../../ds/type'
import { labelEyebrow as EYEBROW } from '../../ds/type'
import { FOCUS_RING, useFocusRing } from '../../ds/focus'
import type { Head } from './data'

/** A row action. `why` present means it is unavailable, and says why. */
export interface MenuItemSpec {
  label: string
  act?: () => void
  danger?: boolean
  why?: string
}

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

export function Card({
  children,
  pad = 'var(--size-200)',
  gap = 'var(--size-160)',
  overflow,
}: {
  children?: ReactNode
  pad?: string
  gap?: string
  overflow?: CSSProperties['overflow']
}) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        padding: pad,
        display: 'flex',
        flexDirection: 'column',
        gap,
        overflow,
      }}
    >
      {children}
    </div>
  )
}

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

export function Labelled({
  label,
  info,
  children,
  width,
  flex,
  min,
}: {
  label: string
  info?: string
  children?: ReactNode
  width?: number | string
  flex?: number
  min?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', width, flex, minWidth: min }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        <span style={caption1Strong}>{label}</span>
        {info && <InfoDot title={info} />}
      </span>
      {children}
    </div>
  )
}

export function Field({
  value,
  onChange,
  placeholder,
  type,
  inputMode,
  sample,
  width,
  strong,
}: {
  value: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  type?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  /** Focus/blur pair that swaps the example text aside. */
  sample?: { onFocus?: () => void; onBlur?: () => void }
  width?: number | string
  strong?: boolean
}) {
  return (
    <span
      data-field=""
      style={{
        boxSizing: 'border-box',
        width,
        maxWidth: '100%',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
      }}
    >
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        {...sample}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-family)',
          ...(strong ? caption1Strong : caption1),
          color: 'var(--text-primary)',
          padding: 0,
        }}
      />
    </span>
  )
}

export function ChipRow({
  options,
  value,
  onPick,
  labelOf,
}: {
  options: readonly string[]
  value: string
  onPick: (o: string) => void
  labelOf?: (o: string) => string
}) {
  return (
    <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
      {options.map((o) => (
        <Chip key={o} label={labelOf ? labelOf(o) : o} on={value === o} onPick={() => onPick(o)} />
      ))}
    </div>
  )
}

export function Chip({
  label,
  on,
  onPick,
}: {
  label: string
  on: boolean
  onPick: (e: MouseEvent<HTMLDivElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--primary-soft)' : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        ...caption1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--primary)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

export function SmallButton({
  children,
  onClick,
  primary,
  danger,
  height = 28,
}: {
  children?: ReactNode
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  danger?: boolean
  height?: number
}) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : danger && hover ? 'var(--danger-bg)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : danger ? 'var(--danger-border)' : 'var(--border-default)'}`,
        color: primary ? 'var(--text-inverse)' : danger ? 'var(--danger-fg)' : 'var(--text-primary)',
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

// A transient success line that clears itself - it reports a check, not a state.
export function TestResult({ children }: { children?: ReactNode }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--success-fg)' }}>
      <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--success-accent)', flexShrink: 0 }} />
      {children}
    </span>
  )
}

export function Select({
  label,
  open,
  onToggle,
  width = 150,
  children,
  muted,
}: {
  label: ReactNode
  open: boolean
  onToggle: (e: MouseEvent<HTMLDivElement>) => void
  width?: number | string
  children?: ReactNode
  muted?: boolean
}) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        onClick={onToggle}
        style={{
          boxSizing: 'border-box',
          width,
          maxWidth: '100%',
          height: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-100)',
          borderRadius: 'var(--radius-small)',
          background: 'var(--surface-card)',
          border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
          ...caption1,
          color: muted ? 'var(--text-helper)' : 'var(--text-primary)',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: focus ? FOCUS_RING : 'none',
          transition: 'border-color var(--motion-hover)',
        }}
        {...hoverProps}
        {...focusProps}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={12} />
        </span>
      </div>
      {open && <Dropdown width={width}>{children}</Dropdown>}
    </span>
  )
}

export function Dropdown({
  width,
  left = 0,
  top = 31,
  flip,
  children,
}: {
  width?: number | string
  left?: number | string
  top?: number | string
  flip?: boolean
  children?: ReactNode
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        // Upward when the anchor sits at the bottom of a clipping scroller.
        ...(flip ? { bottom: 31 } : { top }),
        left,
        boxSizing: 'border-box',
        width,
        maxWidth: '100%',
        maxHeight: 240,
        overflow: 'hidden auto',
        padding: 'var(--size-40)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        boxShadow: 'var(--elevation-menu)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

export function OptionRow({
  children,
  on,
  onPick,
  trailing,
}: {
  children?: ReactNode
  on?: boolean
  onPick?: () => void
  trailing?: ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        minHeight: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-50)' : hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
      {trailing}
    </div>
  )
}

export function EmptyRow({ children }: { children?: ReactNode }) {
  return (
    <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', ...caption1, color: 'var(--text-secondary)' }}>
      {children}
    </div>
  )
}

export function RowMenu({
  open,
  onToggle,
  items,
  flip,
  width = 56,
  minWidth = 190,
}: {
  open: boolean
  onToggle: (e: MouseEvent<HTMLSpanElement>) => void
  items: MenuItemSpec[]
  flip?: boolean
  width?: number
  minWidth?: number
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div style={{ width, flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
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
            <MenuRow key={m.label} item={m} />
          ))}
        </div>
      )}
    </div>
  )
}

// A dark item keeps its place and says why.
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

export function SearchField({
  value,
  onChange,
  placeholder,
  width = 260,
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

export function Toolbar({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        padding: 'var(--size-100) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
      }}
    >
      {children}
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
      {children}
    </div>
  )
}

export function HeadCell({
  h,
  sort,
  onSort,
}: {
  h: Head
  sort?: { col: string; dir: 'asc' | 'desc' }
  onSort?: () => void
}) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  const active = sort && sort.col === h.k
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
          <Icon name={active ? (sort.dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} color={active ? 'currentColor' : 'var(--text-disabled)'} />
        </span>
      )}
    </div>
  )
}

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

export function ModalFoot({ children, lead }: { children?: ReactNode; lead?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', paddingTop: 'var(--size-120)', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
      {lead}
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
        border: `1px solid ${disabled ? 'var(--border-default)' : danger ? 'var(--danger-accent)' : primary ? 'var(--primary)' : 'var(--border-default)'}`,
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

export function Helper({
  children,
  color = 'var(--text-helper)',
}: {
  children?: ReactNode
  color?: string
}) {
  return <span style={{ ...caption2, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
}
