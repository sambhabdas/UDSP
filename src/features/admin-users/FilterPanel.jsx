import { Icon } from '../../ds/icons/Icon.jsx'
import { useHover } from '../../ds/useHover.js'
import { caption1, caption1Strong, subtitle2 } from '../../ds/type.js'
import { Btn, CheckBox } from './parts.jsx'
import { FOCUS_RING, INSET_FOCUS_RING, useFocusRing } from './ui.js'

// One drawer serves both tabs — the sections come from the tab's filter defs.
// Edits land in a draft and only reach the table on Apply.
export function FilterPanel({ s }) {
  const q = s.fpQ.trim().toLowerCase()

  const sections = s.filterDefs
    .map((d) => {
      const picked = s.draft ? s.draft[d.key] : []
      const rows = q ? d.options.filter((o) => o.label.toLowerCase().includes(q)) : d.options
      return {
        def: d,
        rows,
        picked,
        // A search hit must never stay folded away.
        open: q ? true : !s.collapsed.includes(d.id),
      }
    })
    .filter((x) => !q || x.rows.length > 0 || x.def.label.toLowerCase().includes(q))

  return (
    <div
      onClick={s.cancelFilters}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.32)',
        zIndex: 70,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Filters"
        style={{
          boxSizing: 'border-box',
          width: 320,
          maxWidth: '88vw',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-raised)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--elevation-menu)',
        }}
      >
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160) var(--size-200)' }}>
          <span style={{ flex: 1, minWidth: 0, ...subtitle2 }}>Filters</span>
          <CloseX onClick={s.cancelFilters} />
        </div>

        <div style={{ flexShrink: 0, padding: '0 var(--size-200) var(--size-160) var(--size-200)' }}>
          <span
            data-field=""
            style={{
              boxSizing: 'border-box',
              width: '100%',
              height: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-60)',
              padding: '0 var(--size-80)',
              borderRadius: 'var(--radius-small)',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
            }}
          >
            <span style={{ display: 'flex', flexShrink: 0 }}>
              <Icon name="SearchGlyph" size={14} color="var(--text-disabled)" />
            </span>
            <input
              value={s.fpQ}
              onChange={(e) => s.setFpQ(e.target.value)}
              placeholder="Search filters"
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-family)',
                ...caption1,
                color: 'var(--text-primary)',
                padding: 0,
              }}
            />
          </span>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', borderTop: '1px solid var(--border-subtle)' }}>
          {sections.map((sec) => (
            <div key={sec.def.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <SectionHead
                label={sec.def.label}
                count={sec.picked.length}
                open={sec.open}
                onToggle={() => s.toggleSection(sec.def.id)}
              />
              {sec.open && (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
                  {sec.rows.map((o) => (
                    <OptionRow
                      key={o.value}
                      label={o.label}
                      meta={o.meta}
                      on={sec.picked.includes(o.value)}
                      onPick={() => s.toggleDraft(sec.def.key, o.value)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-160) var(--size-200)',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <ClearAll enabled={s.draftDirty} onClick={s.clearDraft} />
          <div style={{ flex: 1 }} />
          <Btn onClick={s.cancelFilters}>Cancel</Btn>
          <Btn tone="primary" onClick={s.applyFilters}>
            Apply
          </Btn>
        </div>
      </div>
    </div>
  )
}

function CloseX({ onClick }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <span
      onClick={onClick}
      aria-label="Close"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-small)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      <Icon name="DismissSize16ThemeRegular" size={16} />
    </span>
  )
}

function SectionHead({ label, count, open, onToggle }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onToggle}
      style={{
        boxSizing: 'border-box',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-200)',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? INSET_FOCUS_RING : 'none',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      <span style={{ flex: 1, minWidth: 0, ...caption1Strong, color: 'var(--text-primary)' }}>{label}</span>
      {count > 0 && (
        <span
          style={{
            boxSizing: 'border-box',
            height: 20,
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--size-80)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--blue-100)',
            border: '1px solid var(--blue-200)',
            ...caption1Strong,
            color: 'var(--blue-700)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
      )}
      <span
        style={{
          display: 'flex',
          color: 'var(--text-secondary)',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform var(--duration-fast) var(--curve-easy-ease)',
        }}
      >
        <Icon name="SvChevron" size={12} />
      </span>
    </div>
  )
}

function OptionRow({ label, meta, on, onPick }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        ...caption1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      <CheckBox on={on} />
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
        {label}
      </span>
      <span style={{ color: 'var(--text-helper)', fontVariantNumeric: 'tabular-nums' }}>{meta}</span>
    </div>
  )
}

function ClearAll({ enabled, onClick }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <span
      onClick={enabled ? onClick : undefined}
      style={{
        ...caption1,
        color: enabled ? 'var(--text-link)' : 'var(--text-disabled)',
        cursor: enabled ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        borderRadius: 'var(--radius-small)',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        textDecoration: enabled && hover ? 'underline' : 'none',
      }}
      {...hoverProps}
      {...focusProps}
    >
      Clear all
    </span>
  )
}
