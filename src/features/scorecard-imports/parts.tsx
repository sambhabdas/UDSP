'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong } from '../../ds/type'
import { FIELD_LABEL, HEAD } from './style'
export { Toast } from '../../ds/components/Toast'

export function Chip({ label, bg, fg, border, dot }: { label: string; bg: string; fg: string; border?: string; dot?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20, padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: bg, color: fg, border: border ? `1px solid ${border}` : undefined, ...caption1Strong, whiteSpace: 'nowrap' }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
      {label}
    </span>
  )
}

export function Checkbox({ on, onClick }: { on: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        boxSizing: 'border-box', width: 16, height: 16, borderRadius: 'var(--radius-small)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: on ? 'var(--primary)' : 'var(--surface-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse)',
      }}
    >
      {on && <Icon name="FnCheck" size={12} />}
    </span>
  )
}

export function SortHead({ label, justify, active, dir, onClick }: { label: string; justify: string; active?: boolean; dir?: 'asc' | 'desc'; onClick?: () => void }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', justifyContent: justify, ...HEAD, cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap', overflow: 'hidden' }}
    >
      <span>{label}</span>
      {onClick && (
        <span style={{ display: 'flex', color: active ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
          <Icon name={active ? (dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
        </span>
      )}
    </div>
  )
}

export function Button({ children, onClick, kind = 'plain' }: { children: ReactNode; onClick: (e: React.MouseEvent) => void; kind?: 'plain' | 'primary' | 'link' }) {
  const [hover, hoverProps] = useHover()
  const style: CSSProperties = {
    boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
    gap: 'var(--size-60)', padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)',
    ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', cursor: 'pointer',
    transition: 'background var(--motion-hover)',
  }
  if (kind === 'primary') Object.assign(style, { background: hover ? 'var(--primary-hover)' : 'var(--primary)', border: '1px solid var(--primary)', color: 'var(--text-inverse)', padding: '0 var(--size-160)' })
  else if (kind === 'link') Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'transparent', color: 'var(--text-link)', padding: '0 var(--size-100)' })
  else Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)', border: '1px solid var(--border-default)' })
  return (
    <div data-fx="" tabIndex={0} role="button" onClick={onClick} style={style} {...hoverProps}>
      {children}
    </div>
  )
}

export function IconButton({ icon, onClick, title, color = 'var(--text-secondary)', size = 28, bordered }: { icon: string; onClick: (e: React.MouseEvent) => void; title?: string; color?: string; size?: number; bordered?: boolean }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size,
        borderRadius: 'var(--radius-small)',
        border: bordered ? '1px solid var(--border-default)' : undefined,
        background: hover ? 'var(--surface-subtle)' : bordered ? 'var(--surface-card)' : 'transparent',
        cursor: 'pointer', color, flexShrink: 0,
      }}
      {...hoverProps}
    >
      <Icon name={icon} size={size >= 32 ? 20 : size <= 24 ? 12 : 16} />
    </div>
  )
}

export function SearchField({ value, onChange, placeholder, width }: { value: string; onChange: (v: string) => void; placeholder: string; width: number }) {
  return (
    <div data-search="" style={{ boxSizing: 'border-box', height: 'var(--control-height)', width, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="FnSearch" size={16} /></span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1 }} />
    </div>
  )
}

export function Field({ label, children, span }: { label: string; children: ReactNode; span?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', minWidth: 0, gridColumn: span ? '1 / -1' : undefined }}>
      <span style={FIELD_LABEL}>{label}</span>
      {children}
    </div>
  )
}

export function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div data-field="" style={{ boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1 }} />
    </div>
  )
}

/** A field that opens the shared menu rather than accepting typing. */
export function PickerField({
  label, color, background, border, onClick, flex,
}: {
  label: string
  color?: string
  background?: string
  border?: string
  onClick: (e: React.MouseEvent) => void
  flex?: boolean
}) {
  return (
    <div
      data-field=""
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', flex: flex ? 1 : undefined, minWidth: flex ? 0 : undefined,
        height: 'var(--control-height)', display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        padding: '0 var(--size-120)', border: `1px solid ${border ?? 'var(--border-default)'}`,
        borderRadius: 'var(--radius-medium)', background: background ?? 'var(--surface-subtle)', cursor: 'pointer',
      }}
    >
      <span style={{ flex: 1, minWidth: 0, ...body1, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={16} /></span>
    </div>
  )
}

/** A pick-one chip row, as used by the scoring mode. */
export function Segment({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-100)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
        color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
        ...caption1Strong, cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  )
}

export function GridHead({ cols, children, noTop }: { cols: string; children: ReactNode; noTop?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderTop: noTop ? undefined : '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)' }}>
      {children}
    </div>
  )
}

export function HeadCell({ children, align }: { children: ReactNode; align?: 'right' | 'center' }) {
  return <span style={{ ...HEAD, textAlign: align }}>{children}</span>
}

export function Empty({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
      <span style={{ ...body1, color: 'var(--text-secondary)' }}>{children}</span>
    </div>
  )
}

export function Pager({ page, setPage }: { page: { p: number; max: number; total: number }; setPage: (n: number) => void }) {
  const from = page.total === 0 ? 0 : (page.p - 1) * 8 + 1
  const pages: number[] = []
  for (let i = 1; i <= page.max; i++) pages.push(i)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-100) var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
      <span style={{ ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
        Showing {from}-{Math.min(page.p * 8, page.total)} of {page.total}
      </span>
      <div style={{ flex: 1 }} />
      <IconButton icon="FnChevronLeft" bordered color={page.p > 1 ? 'var(--text-secondary)' : 'var(--text-disabled)'} onClick={() => { if (page.p > 1) setPage(page.p - 1) }} />
      {pages.map((i) => (
        <div
          key={i}
          data-fx=""
          tabIndex={0}
          role="button"
          onClick={() => setPage(i)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, height: 28,
            padding: '0 var(--size-60)', borderRadius: 'var(--radius-small)',
            background: page.p === i ? 'var(--blue-50)' : 'var(--surface-card)',
            border: `1px solid ${page.p === i ? 'var(--blue-200)' : 'var(--border-default)'}`,
            color: page.p === i ? 'var(--blue-700)' : 'var(--text-primary)',
            ...caption1, fontWeight: page.p === i ? 'var(--weight-semibold)' : 'var(--weight-regular)',
            cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
          }}
        >
          {i}
        </div>
      ))}
      <IconButton icon="FnChevronRight" bordered color={page.p < page.max ? 'var(--text-secondary)' : 'var(--text-disabled)'} onClick={() => { if (page.p < page.max) setPage(page.p + 1) }} />
    </div>
  )
}
