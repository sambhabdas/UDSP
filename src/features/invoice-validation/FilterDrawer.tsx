'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, subtitle1 } from '../../ds/type'
import { Button, IconButton } from './parts'
import { STATUS_FILTERS } from './data'
import { statusName } from './calc'
import type { IvState } from './useInvoiceValidation'

/**
 * The one shared filter drawer, with the page's single axis in it.
 *
 * Status is one-of rather than any-of, so picking a row replaces the choice
 * instead of adding to it — and nothing filters until Apply.
 */
export function FilterDrawer({ s }: { s: IvState }) {
  if (!s.fpOpen) return null
  const chosen = s.draftFilter ?? s.filter

  const count = (f: string): number =>
    s.elapsed.filter((x) =>
      f === 'All' ? true : f === 'Pending' ? s.inv[x].status === 'pending' && !s.inv[x].na : statusName(s.inv[x]) === f,
    ).length

  return (
    <div
      onClick={() => s.setFpOpen(false)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', justifyContent: 'flex-end', zIndex: 60 }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width: 360,
          height: '100%',
          background: 'var(--surface-raised)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={subtitle1}>Filters</span>
          <div style={{ flex: 1 }} />
          <IconButton name="FnDismiss" size={32} glyph={20} onClick={() => s.setFpOpen(false)} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 48, padding: '0 var(--size-160)' }}>
              <span style={body1Strong}>Status</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
              {STATUS_FILTERS.map((f) => (
                <Option key={f} label={f} count={f === 'All' ? '' : String(count(f))} on={chosen === f} onPick={() => s.setDraftFilter(f)} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
          <ClearAll onClick={() => s.setDraftFilter('All')} />
          <div style={{ flex: 1 }} />
          <Button onClick={() => s.setFpOpen(false)}>Cancel</Button>
          <Button
            primary
            onClick={() => {
              s.setFilter(chosen)
              s.setFpOpen(false)
              s.toastMsg('Filters applied')
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

function ClearAll({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 'var(--control-height)',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        color: 'var(--text-link)',
        ...body1Strong,
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      Clear All
    </div>
  )
}

function Option({ label, count, on, onPick }: { label: string; count: string; on: boolean; onPick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', minHeight: 28, cursor: 'pointer' }}
    >
      <span
        style={{
          boxSizing: 'border-box',
          width: 16,
          height: 16,
          borderRadius: 'var(--radius-small)',
          border: `1px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: on ? 'var(--primary)' : 'var(--surface-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-inverse)',
        }}
      >
        {on && <Icon name="FnCheck" size={12} />}
      </span>
      <span style={{ flex: 1, ...body1 }}>{label}</span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
    </div>
  )
}
