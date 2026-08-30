'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { FIELD_LABEL, HEAD, NUM } from './style'
export { Toast } from '../../ds/components/Toast'

export function Chip({ label, bg, fg, border, title, small }: { label: string; bg: string; fg: string; border?: string; title?: string; small?: boolean }) {
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', height: small ? 18 : 20,
        padding: small ? '0 var(--size-60)' : '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: bg, color: fg, border: border ? `1px solid ${border}` : undefined,
        ...caption1Strong, whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      {label}
    </span>
  )
}

/** A status pill with a leading dot — Ready / Unavailable. */
export function DotChip({ label, bg, fg, dot }: { label: string; bg: string; fg: string; dot: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20, padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: bg, color: fg, ...caption1Strong }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
      {label}
    </span>
  )
}

export function Checkbox({ on, onClick }: { on: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <div data-fx="" tabIndex={0} role="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <span
        style={{
          boxSizing: 'border-box', width: 16, height: 16, borderRadius: 'var(--radius-small)',
          border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: on ? 'var(--primary)' : 'var(--surface-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse)',
        }}
      >
        {on && <Icon name="FnCheck" size={12} />}
      </span>
    </div>
  )
}

export function Toggle({ on, onClick, disabled, title }: { on: boolean; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      style={{
        boxSizing: 'border-box', width: 36, height: 20, borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--primary)' : 'var(--neutral-400)',
        display: 'flex', alignItems: 'center', padding: 2,
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 120ms',
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--surface-card)', boxShadow: 'var(--elevation-card)', transform: `translateX(${on ? 16 : 0}px)`, transition: 'transform 120ms' }} />
    </div>
  )
}

export function Button({ children, onClick, kind = 'plain', small, danger }: { children: ReactNode; onClick: (e: React.MouseEvent) => void; kind?: 'plain' | 'primary' | 'link'; small?: boolean; danger?: boolean }) {
  const [hover, hoverProps] = useHover()
  const style: CSSProperties = {
    boxSizing: 'border-box', height: small ? 28 : 'var(--control-height)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 'var(--size-60)', padding: small ? '0 var(--size-100)' : '0 var(--size-120)',
    borderRadius: 'var(--radius-medium)',
    ...(small ? caption1Strong : { ...body1, fontWeight: 'var(--weight-semibold)' }),
    whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)',
  }
  if (kind === 'primary') Object.assign(style, { background: hover ? 'var(--primary-hover)' : 'var(--primary)', border: '1px solid var(--primary)', color: 'var(--text-inverse)' })
  else if (kind === 'link') Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'transparent', color: 'var(--text-link)', padding: '0 var(--size-100)' })
  else Object.assign(style, { background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)', border: '1px solid var(--border-default)', color: danger ? 'var(--danger-fg)' : undefined })
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
      <Icon name={icon} size={size >= 32 ? 20 : size <= 24 ? 16 : 16} />
    </div>
  )
}

export function SearchField({ value, onChange, placeholder, width }: { value: string; onChange: (v: string) => void; placeholder: string; width: number }) {
  return (
    <div
      data-search=""
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', width, display: 'flex', alignItems: 'center',
        gap: 'var(--size-80)', padding: '0 var(--size-120)', borderRadius: 'var(--radius-medium)',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="FnSearch" size={16} /></span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1 }} />
    </div>
  )
}

export function Field({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', minWidth: 0 }}>
      {action
        ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1, ...FIELD_LABEL }}>{label}</span>
            {action}
          </div>
        )
        : <span style={FIELD_LABEL}>{label}</span>}
      {children}
    </div>
  )
}

export function Input({ value, onChange, placeholder, suffix, numeric }: { value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string; numeric?: boolean }) {
  return (
    <div data-field="" style={{ boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, ...(numeric ? NUM : {}) }} />
      {suffix && <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{suffix}</span>}
    </div>
  )
}

export function TextArea({ value, onChange, placeholder, height = 56 }: { value: string; onChange: (v: string) => void; placeholder: string; height?: number }) {
  return (
    <div data-field="" style={{ boxSizing: 'border-box', display: 'flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
      <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, height, resize: 'none', border: 'none', background: 'transparent', padding: 'var(--size-80) var(--size-120)', ...body1 }} />
    </div>
  )
}

/** A field that opens the shared menu. */
export function PickerField({ label, color, onClick }: { label: string; color?: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <div
      data-field=""
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{ boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)', cursor: 'pointer' }}
    >
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...body1, color }}>{label}</span>
      <span style={{ display: 'flex', color: 'var(--text-secondary)' }}><Icon name="SvChevron" size={16} /></span>
    </div>
  )
}

/** The white play triangle drawn over every poster frame. */
export function PlayBadge({ size }: { size: number }) {
  const arrow = Math.round(size * 0.3)
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--elevation-card)' }}>
      <span style={{ width: 0, height: 0, borderLeft: `${arrow}px solid var(--neutral-900)`, borderTop: `${Math.round(arrow * 0.7)}px solid transparent`, borderBottom: `${Math.round(arrow * 0.7)}px solid transparent`, marginLeft: Math.round(arrow * 0.25) }} />
    </span>
  )
}

export function GridHead({ cols, children }: { cols: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)' }}>
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

/** The shared pager under each of the three tables. */
export function Pager({ page, setPage }: { page: { p: number; max: number; total: number }; setPage: (n: number) => void }) {
  const from = page.total === 0 ? 0 : (page.p - 1) * 8 + 1
  const pages: number[] = []
  for (let i = 1; i <= page.max; i++) pages.push(i)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-100) var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
      <span style={{ ...caption1, color: 'var(--text-secondary)', ...NUM }}>
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
            cursor: 'pointer', ...NUM,
          }}
        >
          {i}
        </div>
      ))}
      <IconButton icon="FnChevronRight" bordered color={page.p < page.max ? 'var(--text-secondary)' : 'var(--text-disabled)'} onClick={() => { if (page.p < page.max) setPage(page.p + 1) }} />
    </div>
  )
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <span style={subtitle1}>{children}</span>
}
