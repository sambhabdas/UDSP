'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1Strong, subtitle1 } from '../../ds/type'
import { Button, IconButton, Link } from './parts'
import type { GaState } from './useGeneralAssociates'

/**
 * The filter drawer.
 *
 * Two copies of the filter state exist while this is open - the draft it edits
 * and the applied set behind it - so Cancel and the backdrop both mean "throw
 * this away" without the roster having flickered in the meantime.
 */
export function FilterDrawer({ s }: { s: GaState }) {
  const draft = s.draft
  if (!draft) return null

  return (
    <div
      onClick={s.closeFilters}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.75)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 80,
      }}
    >
      <div
        data-dialog-drawer=""
        data-pop=""
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
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-120)',
            padding: '0 var(--size-200)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ flex: 1, ...subtitle1 }}>Filters</span>
          <IconButton
            name="FnDismiss"
            title="Close"
            size={32}
            glyph={20}
            color="var(--text-secondary)"
            onClick={s.closeFilters}
          />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {s.sections.map(([key, label, options, kind]) => {
            const open = s.openSections[key]
            // Status counts as one filter only when it is off its default.
            const count = kind === 'radio' ? (draft.status !== 'Active' ? 1 : 0) : (draft[key] as string[]).length
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-subtle)' }}>
                <SectionHead label={label} count={count} open={open} onClick={() => s.toggleSection(key)} />
                {open && (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '0 var(--size-200) var(--size-120) var(--size-200)' }}>
                    {options.map((o) => {
                      const on = kind === 'radio' ? draft.status === o : (draft[key] as string[]).includes(o)
                      return <OptionRow key={o} label={o} on={on} onClick={() => s.pickFilter(key, kind, o)} />
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-160) var(--size-200)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <Link onClick={s.clearFilters}>Clear All</Link>
          <div style={{ flex: 1 }} />
          <Button onClick={s.closeFilters}>Cancel</Button>
          <Button primary onClick={s.applyFilters}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

function SectionHead({ label, count, open, onClick }: { label: string; count: number; open: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 48,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-200)',
        background: hover ? 'var(--surface-subtle)' : undefined,
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, ...body1Strong }}>{label}</span>
      {!!count && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 20,
            height: 20,
            padding: '0 var(--size-40)',
            borderRadius: 'var(--radius-circle)',
            background: 'var(--blue-50)',
            border: '1px solid var(--blue-200)',
            color: 'var(--blue-700)',
            ...caption1Strong,
          }}
        >
          {count}
        </span>
      )}
      <span
        style={{
          display: 'flex',
          color: 'var(--text-secondary)',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform var(--duration-faster) var(--curve-easy-ease)',
        }}
      >
        <Icon name="FnChevronRight" size={16} />
      </span>
    </div>
  )
}

/** Radio and multi both wear a checkbox; only the pick behaviour differs. */
function OptionRow({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        minHeight: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-100)',
        borderRadius: 'var(--radius-small)',
        padding: '0 var(--size-60)',
        background: hover ? 'var(--surface-subtle)' : undefined,
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span
        style={{
          boxSizing: 'border-box',
          width: 16,
          height: 16,
          flexShrink: 0,
          borderRadius: 'var(--radius-small)',
          border: `1px solid ${on ? 'var(--primary)' : 'var(--border-default)'}`,
          background: on ? 'var(--primary)' : 'var(--surface-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-inverse)',
        }}
      >
        {on && <Icon name="FnCheck" size={12} />}
      </span>
      <span style={body1}>{label}</span>
    </div>
  )
}
