'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1Strong, subtitle1 } from '../../ds/type'
import { CATEGORIES, COACH_STATUSES, OPEN_STATUSES, SOURCES } from './data'
import { Button, Checkbox, Combo, Field, IconButton, Toggle } from './parts'
import type { Filters, EventsState } from './useEvents'

type SetKey = 'cats' | 'srcs' | 'sts'

/** The three combos, then the checkbox groups, then the tab's one switch. */
export function FilterPanel({ s }: { s: EventsState }) {
  if (!s.fpOpen) return null
  const p = s.pending
  const set = (next: Filters) => s.setPf(next)
  const close = () => { s.setFpOpen(false); s.closeMenu() }

  const groups: [string, string, string[], SetKey][] =
    s.tab === 'all'
      ? [
        ['g0', 'Category', CATEGORIES, 'cats'],
        ['g1', 'Source', SOURCES, 'srcs'],
        ['g2', 'Coaching Status', COACH_STATUSES, 'sts'],
      ]
      : s.tab === 'open'
        ? [['g0', 'Status', OPEN_STATUSES, 'sts']]
        : []

  const toggleLabel = s.tab === 'all' ? 'Voided Only' : s.tab === 'open' ? 'Blocked Only' : 'Repeats Only'
  const toggleKey: 'voided' | 'blocked' | 'repeats' = s.tab === 'all' ? 'voided' : s.tab === 'open' ? 'blocked' : 'repeats'

  const combos: [string, 'da' | 'std' | 'mod', string][] = [
    ['Associate', 'da', 'pDa'],
    ['Standard', 'std', 'pStd'],
    ['Module', 'mod', 'pMod'],
  ]

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)', padding: 'var(--size-160)' }}>
            {combos.map(([label, key, menuKind]) => (
              <Field key={key} label={label}>
                <Combo
                  value={s.menu?.kind === menuKind ? s.menuQuery : p[key] === 'All' ? '' : p[key]}
                  placeholder={p[key]}
                  onChange={s.setMenuQuery}
                  onOpen={(e) => s.openMenu(e as unknown as React.MouseEvent, menuKind)}
                />
              </Field>
            ))}
          </div>

          {groups.map(([id, label, pool, setKey]) => (
            <Group
              key={id}
              label={label}
              count={Object.keys(p[setKey]).length}
              open={!!s.fpSec[id]}
              onToggle={() => s.setFpSec({ ...s.fpSec, [id]: !s.fpSec[id] })}
            >
              {pool.map((v) => (
                <Option
                  key={v}
                  label={v}
                  on={!!p[setKey][v]}
                  onClick={() => {
                    const next = { ...p[setKey] }
                    if (next[v]) delete next[v]
                    else next[v] = true
                    set({ ...p, [setKey]: next })
                  }}
                />
              ))}
            </Group>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', minHeight: 48, padding: '0 var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ flex: 1, ...body1, fontWeight: 'var(--weight-semibold)' }}>{toggleLabel}</span>
            <Toggle on={p[toggleKey]} onClick={() => set({ ...p, [toggleKey]: !p[toggleKey] })} />
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
          <Button kind="link" onClick={() => set({ da: 'All', std: 'All', mod: 'All', cats: {}, srcs: {}, sts: {}, voided: false, blocked: false, repeats: false })}>
            Clear All
          </Button>
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" onClick={s.applyFilters}>Apply</Button>
        </div>
      </div>
    </div>
  )
}

function Group({ label, count, open, onToggle, children }: { label: string; count: number; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  const [hover, hoverProps] = useHover()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
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
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Option({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <div data-fx="" tabIndex={0} role="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 28, cursor: 'pointer' }}>
      <Checkbox on={on} onClick={(e) => { e.stopPropagation(); onClick() }} />
      <span style={body1}>{label}</span>
    </div>
  )
}
