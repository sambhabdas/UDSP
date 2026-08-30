'use client'

import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1Strong, caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { BARE_INPUT } from './ui'
import { Toast as BaseToast } from '../../ds/components/Toast'

/** A pill that filters the board. Selected reads blue; a warning chip that is
 *  not selected keeps its amber, because the count is the warning. */
export function Chip({
  label,
  on,
  warn,
  onPick,
  title,
}: {
  label: string
  on?: boolean
  warn?: boolean
  onPick?: () => void
  title?: string
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-pill)',
        background: on
          ? 'var(--blue-100)'
          : warn
            ? 'var(--warning-bg)'
            : hover
              ? 'var(--surface-subtle)'
              : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : warn ? 'var(--warning-border)' : 'var(--border-default)'}`,
        ...caption1,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--blue-700)' : warn ? 'var(--warning-fg)' : 'var(--text-secondary)',
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

export function ToolButton({
  children,
  onClick,
  primary,
  chevron,
  title,
}: {
  children?: ReactNode
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  primary?: boolean
  chevron?: boolean
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
        gap: 'var(--size-60)',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: primary
          ? hover
            ? 'var(--primary-hover)'
            : 'var(--primary)'
          : hover
            ? 'var(--surface-subtle)'
            : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
      {chevron && (
        <span style={{ display: 'inline-flex', marginLeft: 'var(--size-40)', transform: 'rotate(90deg)' }}>
          <Icon name="FnChevronRight" size={16} />
        </span>
      )}
    </div>
  )
}

/** The 28px square the day stepper and calendar use. */
export function IconSquare({
  name,
  onClick,
  title,
  size = 28,
}: {
  name: string
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  title?: string
  size?: number
}) {
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
        width: size,
        height: size,
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={16} />
    </div>
  )
}

export function CheckBox({
  on,
  onClick,
  title,
}: {
  on: boolean
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
  title?: string
}) {
  return (
    <span
      role="checkbox"
      aria-checked={on}
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        width: 16,
        height: 16,
        flexShrink: 0,
        borderRadius: 'var(--radius-small)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
        background: on ? 'var(--primary)' : 'var(--surface-card)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-inverse)',
        cursor: 'pointer',
      }}
    >
      {on && <Icon name="FnCheck" size={12} />}
    </span>
  )
}

/** A cell that turns into an input when you click it. The board keeps one edit
 *  at a time, so the caller says whether this is the one. */
export function EditableCell({
  editing,
  value,
  display,
  color,
  onStart,
  onChange,
  onCommit,
  onCancel,
  title,
  align,
}: {
  editing: boolean
  value: string
  display: ReactNode
  color?: string
  onStart: () => void
  onChange: (v: string) => void
  onCommit: () => void
  onCancel: () => void
  title?: string
  align?: CSSProperties['textAlign']
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
          ...BARE_INPUT,
          boxSizing: 'border-box',
          height: 24,
          padding: '0 var(--size-40)',
          border: '1px solid var(--border-focus)',
          borderRadius: 'var(--radius-small)',
          background: 'var(--surface-card)',
          textAlign: align,
        }}
      />
    )
  }
  return (
    <span
      title={title}
      onClick={onStart}
      style={{
        display: 'block',
        boxSizing: 'border-box',
        minHeight: 24,
        lineHeight: '24px',
        padding: '0 var(--size-40)',
        margin: '0 calc(-1 * var(--size-40))',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color,
        cursor: 'text',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: align,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {display}
    </span>
  )
}

/** A collapsible block with a count and, sometimes, a warning line. */
export function Panel({
  title,
  count,
  open,
  onToggle,
  note,
  trailing,
  children,
}: {
  title: string
  count?: string
  open: boolean
  onToggle: () => void
  note?: string
  trailing?: ReactNode
  children?: ReactNode
}) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: 'var(--size-100) var(--size-160)',
          flexWrap: 'wrap',
          rowGap: 'var(--size-60)',
        }}
      >
        <span
          role="button"
          tabIndex={0}
          onClick={onToggle}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', cursor: 'pointer' }}
        >
          <span
            style={{
              display: 'flex',
              color: 'var(--text-secondary)',
              transform: `rotate(${open ? '90deg' : '0deg'})`,
              transition: 'transform var(--motion-hover)',
            }}
          >
            <Icon name="FnChevronRight" size={16} />
          </span>
          <span style={subtitle2}>{title}</span>
          {count !== undefined && (
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{count}</span>
          )}
        </span>
        {note && (
          <span style={{ ...caption1, color: 'var(--warning-fg)', whiteSpace: 'nowrap' }}>{note}</span>
        )}
        <div style={{ flex: 1 }} />
        {trailing}
      </div>
      {open && children}
    </div>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder,
  width = 220,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  width?: number | string
}) {
  return (
    <span
      data-field=""
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
        background: 'var(--surface-card)',
      }}
    >
      <Icon name="FnSearch" size={16} color="var(--text-disabled)" />
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...BARE_INPUT, ...caption1 }}
      />
    </span>
  )
}

/** Status colours are always a word as well as a hue. */
export function Pill({
  children,
  bg,
  border,
  fg,
  dot,
  title,
}: {
  children?: ReactNode
  bg: string
  border: string
  fg: string
  dot?: string
  title?: string
}) {
  return (
    <span
      title={title}
      style={{
        boxSizing: 'border-box',
        height: 20,
        display: 'inline-flex',
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
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: dot, flexShrink: 0 }} />
      )}
      {children}
    </span>
  )
}


/** An empty board says what would fill it, and offers the two ways to do it. */
export function EmptyBoard({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        padding: 'var(--size-480) var(--size-240)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--size-160)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--subtitle-1-size)',
          lineHeight: 'var(--subtitle-1-lh)',
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
      {children && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
          {children}
        </div>
      )}
    </div>
  )
}

/** Caption-scale toast — this page's design file sets it one step down. */
export function Toast({ children, onUndo }: { children: ReactNode; onUndo?: () => void }) {
  return <BaseToast size="caption" onUndo={onUndo}>{children}</BaseToast>
}
