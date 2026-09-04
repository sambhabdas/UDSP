'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1Strong, subtitle1 } from '../../ds/type'
import { CATS } from './data'
import { Button, Checkbox, IconButton } from './parts'
import type { Filters, LibraryState } from './useCoachingLibrary'

type SetKey = 'sts' | 'cats' | 'use'

/** Each tab filters on a different axis, so the drawer shows only its own. */
export function FilterPanel({ s }: { s: LibraryState }) {
  if (!s.fpOpen) return null
  const p = s.pending
  const close = () => { s.setFpOpen(false); s.closeMenu() }

  const group: [string, string[], SetKey] =
    s.tab === 'modules'
      ? ['Status', ['Active', 'Inactive', 'Draft', 'Retired'], 'sts']
      : s.tab === 'videos'
        ? ['Category', [...CATS, 'Archived'], 'cats']
        : ['Usage', ['In Use', 'Unused'], 'use']

  const [label, pool, setKey] = group
  const count = Object.keys(p[setKey]).length
  const open = !!s.fpSec.g0

  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', justifyContent: 'flex-end', zIndex: 60 }}>
      <div
        data-dialog-drawer=""
        onClick={(e) => e.stopPropagation()}
        style={{ boxSizing: 'border-box', width: 360, height: '100%', background: 'var(--surface-raised)', boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={subtitle1}>Filters</span>
          <div style={{ flex: 1 }} />
          <IconButton icon="FnDismiss" onClick={close} size={32} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
            <GroupHead label={label} count={count} open={open} onToggle={() => s.setFpSec({ ...s.fpSec, g0: !open })} />
            {open && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
                {pool.map((v) => {
                  const on = !!p[setKey][v]
                  const toggle = () => {
                    const next = { ...p[setKey] }
                    if (next[v]) delete next[v]
                    else next[v] = true
                    s.setPf({ ...p, [setKey]: next } as Filters)
                  }
                  return (
                    <div key={v} data-fx="" tabIndex={0} role="button" onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 28, cursor: 'pointer' }}>
                      <Checkbox on={on} onClick={(e) => { e.stopPropagation(); toggle() }} />
                      <span style={body1}>{v}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
          <Button kind="link" onClick={() => s.setPf({ sts: {}, cats: {}, use: {} })}>Clear All</Button>
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" onClick={s.applyFilters}>Apply</Button>
        </div>
      </div>
    </div>
  )
}

function GroupHead({ label, count, open, onToggle }: { label: string; count: number; open: boolean; onToggle: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onToggle}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 48, padding: '0 var(--size-160)', cursor: 'pointer', background: hover ? 'var(--surface-subtle)' : undefined }}
      {...hoverProps}
    >
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{label}</span>
      {count > 0 && (
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 var(--size-60)', borderRadius: 'var(--radius-pill)', background: 'var(--blue-50)', color: 'var(--blue-700)', ...caption1Strong }}>
          {count}
        </span>
      )}
      <div style={{ flex: 1 }} />
      <span style={{ display: 'flex', color: 'var(--text-secondary)', transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform 120ms' }}>
        <Icon name="SvChevron" size={16} />
      </span>
    </div>
  )
}
