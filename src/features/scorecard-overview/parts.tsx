'use client'

import type { ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { CARD, HEAD } from './style'
import { tierTone } from './data'
export { Toast } from '../../ds/components/Toast'

export function Card({ children }: { children: ReactNode }) {
  return <div style={CARD}>{children}</div>
}

/** Every panel opens with a title, optional deep-link, then its controls. */
export function CardHead({
  title, link, linkTitle, note, controls, wrap,
}: {
  title: string
  link?: () => void
  linkTitle?: string
  note?: string
  controls?: ReactNode
  wrap?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: wrap ? 'var(--size-120)' : 'var(--size-120)',
        flexWrap: wrap ? 'wrap' : undefined, rowGap: wrap ? 'var(--size-80)' : undefined,
        padding: 'var(--size-100) var(--size-120)',
      }}
    >
      <span style={subtitle2}>{title}</span>
      {link && <LinkButton title={linkTitle ?? ''} onClick={link} />}
      <div style={{ flex: 1 }} />
      {note && <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{note}</span>}
      {controls}
    </div>
  )
}

function LinkButton({ title, onClick }: { title: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
        borderRadius: 'var(--radius-small)', cursor: 'pointer', color: 'var(--text-link)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      <Icon name="SvExport" size={16} />
    </div>
  )
}

/** The strip along the bottom of a chart card. */
export function CardFoot({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', minHeight: 32, padding: 'var(--size-40) var(--size-120)', borderTop: '1px solid var(--border-default)', background: 'var(--surface-card)' }}>
      <span style={{ ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{children}</span>
    </div>
  )
}

export interface DropOption {
  label: string
  hint?: string
}

/**
 * The page's one dropdown. Every filter on it is this control: a labelled
 * trigger, and a menu whose current choice carries a tick.
 */
export function Dropdown({
  label, value, options, open, onToggle, onPick, width,
}: {
  label: string
  value: string
  options: (string | DropOption)[]
  open: boolean
  onToggle: () => void
  onPick: (v: string) => void
  width: number
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        data-fx=""
        tabIndex={0}
        role="button"
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        style={{
          boxSizing: 'border-box', height: 'var(--control-height)', minWidth: width,
          display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)', background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
          border: '1px solid var(--border-default)', ...body1, cursor: 'pointer',
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
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: 36, left: 0, right: 0, boxSizing: 'border-box',
            maxHeight: 320, overflow: 'hidden auto', padding: 'var(--size-40)',
            background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)',
            zIndex: 30, display: 'flex', flexDirection: 'column',
          }}
        >
          {options.map((o) => {
            const opt = typeof o === 'string' ? { label: o } : o
            return (
              <MenuRow key={opt.label} selected={value === opt.label} hint={opt.hint} onClick={() => onPick(opt.label)}>
                {opt.label}
              </MenuRow>
            )
          })}
        </div>
      )}
    </span>
  )
}

function MenuRow({
  children, selected, hint, onClick,
}: {
  children: ReactNode
  selected: boolean
  hint?: string
  onClick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        boxSizing: 'border-box', minHeight: 'var(--row-height)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : selected ? 'var(--blue-50)' : 'transparent',
        ...body1,
        fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: selected ? 'var(--blue-700)' : 'var(--text-primary)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>
        {selected && <Icon name="FnCheck" size={16} />}
      </span>
      <span style={{ flex: hint ? 1 : undefined }}>{children}</span>
      {hint && <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{hint}</span>}
    </div>
  )
}

export function SearchBox({ value, onChange, width }: { value: string; onChange: (v: string) => void; width: number }) {
  return (
    <div
      data-search=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', width,
        display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="FnSearch" size={16} />
      </span>
      <input
        value={value}
        placeholder="Search"
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1 }}
      />
    </div>
  )
}

/** The pair of date inputs a "Custom" window reveals. */
export function DateRange({
  from, to, onFrom, onTo, width,
}: {
  from: string
  to: string
  onFrom: (v: string) => void
  onTo: (v: string) => void
  width: number
}) {
  return (
    <>
      <DateField value={from} onChange={onFrom} width={width} placeholder="From date" />
      <DateField value={to} onChange={onTo} width={width} placeholder="To date" />
    </>
  )
}

function DateField({ value, onChange, width, placeholder }: { value: string; onChange: (v: string) => void; width: number; placeholder: string }) {
  return (
    <div
      data-field=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', width,
        display: 'flex', alignItems: 'center', padding: '0 var(--size-100)',
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-subtle)',
      }}
    >
      <input
        type="date"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1 }}
      />
    </div>
  )
}

export function Legend({ items }: { items: { label: string; fill: string }[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)' }}>
      {items.map((l) => (
        <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--text-secondary)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: l.fill }} />
          {l.label}
        </span>
      ))}
    </div>
  )
}

/** A tier badge - the same pill wherever a tier is named. */
export function TierChip({ tier }: { tier: string }) {
  const t = tierTone(tier)
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20,
        padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: t.bg, color: t.fg, ...caption1Strong, whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />
      {tier}
    </span>
  )
}

/** A grid header cell that can also be a sort control. */
export function SortHead({
  label, justify, active, dir, onClick,
}: {
  label: string
  justify: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
}) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', justifyContent: justify, ...HEAD, cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      <span>{label}</span>
      <span style={{ display: 'flex', color: active ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
        <Icon name={active ? (dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
      </span>
    </div>
  )
}

/** A row that highlights and opens something on click. */
export function Row({ cols, onClick, children }: { cols: string; onClick?: () => void; children: ReactNode }) {
  const [hover, hoverProps] = useHover()
  const interactive = !!onClick
  return (
    <div
      data-fx={interactive ? '' : undefined}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--size-100)', alignItems: 'center',
        minHeight: 44, padding: 'var(--size-40) var(--size-120)', borderBottom: '1px solid var(--border-subtle)',
        background: interactive && hover ? 'var(--surface-subtle)' : undefined,
        cursor: interactive ? 'pointer' : undefined,
      }}
      {...(interactive ? hoverProps : {})}
    >
      {children}
    </div>
  )
}

export function HeadRow({ cols, children }: { cols: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--size-100)', alignItems: 'center',
        background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)', padding: 'var(--size-40) var(--size-120)',
      }}
    >
      {children}
    </div>
  )
}

/** A small bordered action button, as used by the Kudos and coaching tables. */
export function MiniButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        display: 'flex', alignItems: 'center', height: 28, padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)', border: '1px solid var(--border-default)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        ...caption1Strong, whiteSpace: 'nowrap', cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}
