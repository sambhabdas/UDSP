'use client'

import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { Button, Checkbox, IconButton } from './parts'
import type { StandardsState } from './useStandards'

/** One group: which categories to show. */
export function FilterPanel({ s }: { s: StandardsState }) {
  if (!s.fpOpen) return null
  const p = s.pending
  const close = () => { s.setFpOpen(false); s.closeMenu() }
  const count = Object.keys(p).length

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 48, padding: '0 var(--size-160)' }}>
              <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>Category</span>
              {count > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 var(--size-60)', borderRadius: 'var(--radius-pill)', background: 'var(--blue-50)', color: 'var(--blue-700)', ...caption1Strong }}>
                  {count}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
              {s.cats.map((c) => {
                const on = !!p[c.name]
                return (
                  <div
                    key={c.name}
                    data-fx=""
                    tabIndex={0}
                    role="button"
                    onClick={() => {
                      const next = { ...p }
                      if (next[c.name]) delete next[c.name]
                      else next[c.name] = true
                      s.setPf(next)
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 28, cursor: 'pointer' }}
                  >
                    <Checkbox on={on} onClick={() => {}} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot }} />
                    <span style={{ flex: 1, ...body1 }}>{c.name}</span>
                    <span style={{ ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{c.rows.length}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
          <Button kind="link" onClick={() => s.setPf({})}>Clear All</Button>
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" onClick={s.applyFilters}>Apply</Button>
        </div>
      </div>
    </div>
  )
}
