'use client'

import { useHover } from '../../ds/useHover'
import { body1, caption1Strong, subtitle1 } from '../../ds/type'
import { Icon } from '../../ds/icons/Icon'
import { STATUSES, TIERS, tierOf } from './data'
import { Button, Checkbox, IconButton } from './parts'
import type { PendingFilters, RosterState } from './useRoster'

/**
 * The filter drawer.
 *
 * It edits a copy of the filters and only writes them back on Apply, so
 * Cancel is a real cancel rather than an undo.
 */
export function FilterPanel({ s }: { s: RosterState }) {
  if (!s.fpOpen) return null
  const p = s.pending
  const set = (next: PendingFilters) => s.setPf(next)

  const tierCounts: Record<string, number> = {}
  TIERS.forEach((t) => { tierCounts[t.name] = s.stats.active.filter((x) => tierOf(x.net) === t.name).length })

  const close = () => { s.setFpOpen(false); s.closeMenu() }

  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', justifyContent: 'flex-end', zIndex: 60 }}>
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box', width: 360, height: '100%', background: 'var(--surface-raised)',
          boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={subtitle1}>Filters</span>
          <div style={{ flex: 1 }} />
          <IconButton icon="FnDismiss" onClick={close} size={32} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Group
            label="Tier"
            count={Object.keys(p.tiers).length}
            open={!!s.fpSec.g0}
            onToggle={() => s.setFpSec({ ...s.fpSec, g0: !s.fpSec.g0 })}
          >
            {TIERS.map((t) => (
              <Option
                key={t.name}
                label={`${t.name} · ${tierCounts[t.name]}`}
                on={!!p.tiers[t.name]}
                onClick={() => {
                  const next = { ...p.tiers }
                  if (next[t.name]) delete next[t.name]
                  else next[t.name] = true
                  set({ ...p, tiers: next })
                }}
              />
            ))}
          </Group>

          <Group
            label="Status"
            count={p.status !== 'Active' ? 1 : 0}
            open={!!s.fpSec.g1}
            onToggle={() => s.setFpSec({ ...s.fpSec, g1: !s.fpSec.g1 })}
          >
            {STATUSES.map((v) => (
              <Option key={v} label={v} on={p.status === v} onClick={() => set({ ...p, status: v })} />
            ))}
          </Group>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', minHeight: 48, padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ flex: 1, ...body1, fontWeight: 'var(--weight-semibold)' }}>At Risk Only</span>
            <RiskToggle on={p.risk} onClick={() => set({ ...p, risk: !p.risk })} />
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
          <Button kind="link" onClick={() => set({ tiers: {}, status: 'Active', risk: false })}>Clear All</Button>
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" onClick={s.applyFilters}>Apply</Button>
        </div>
      </div>
    </div>
  )
}

/** The "At Risk Only" switch turns red, not blue — it narrows to a problem. */
function RiskToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', width: 36, height: 20, borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--red-600)' : 'var(--neutral-400)',
        display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer', transition: 'background 120ms',
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--surface-card)', boxShadow: 'var(--elevation-card)', transform: `translateX(${on ? 16 : 0}px)`, transition: 'transform 120ms' }} />
    </div>
  )
}

function Group({
  label, count, open, onToggle, children,
}: {
  label: string
  count: number
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
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
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 28, cursor: 'pointer' }}
    >
      <Checkbox on={on} onClick={(e) => { e.stopPropagation(); onClick() }} />
      <span style={body1}>{label}</span>
    </div>
  )
}
