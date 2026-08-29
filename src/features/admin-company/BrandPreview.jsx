import { Icon } from '../../ds/icons/Icon.jsx'
import { body1, caption1, caption1Stronger, caption2 } from '../../ds/type.js'
import { PREVIEW_SELECTED, PREVIEW_TILES } from './data.js'

// A miniature of the shell, painted live from the brand colour. The rail is the
// only surface the brand touches — pages keep the product palette — and every
// mark drawn on it takes its contrast from the colour's luminance, so a pale
// brand cannot ship an unreadable rail.
export function BrandPreview({ s }) {
  const { rail } = s
  const { displayName, slogan } = s.form

  return (
    <div
      style={{
        flex: 1,
        minHeight: 280,
        boxSizing: 'border-box',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        overflow: 'hidden',
        display: 'flex',
        background: 'var(--surface-page)',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          width: 'var(--rail-width)',
          flexShrink: 0,
          background: rail.hex,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          padding: 'var(--size-80) 0 var(--size-60) 0',
        }}
      >
        {/* The monogram keeps the product blue — it is the app's mark, not the
            DSP's. */}
        <div style={{ margin: '0 var(--size-40)', padding: 'var(--size-40)', display: 'flex', justifyContent: 'center' }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-small)',
              background: 'var(--primary)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...caption1Stronger,
            }}
          >
            {s.initial}
          </span>
        </div>

        <div style={{ height: 1, background: rail.divider, margin: 'var(--size-100) var(--size-80) var(--size-40) var(--size-80)' }} />

        {PREVIEW_TILES.map((n) => {
          const selected = n === PREVIEW_SELECTED
          return (
            <div
              key={n}
              style={{
                position: 'relative',
                boxSizing: 'border-box',
                width: 'var(--rail-tile-width)',
                height: 'var(--rail-tile-height)',
                margin: 'var(--size-20) var(--size-40) 0 var(--size-40)',
                borderRadius: 'var(--radius-medium)',
                background: selected ? rail.selectedBg : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selected && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    width: 2,
                    height: 28,
                    borderRadius: 'var(--radius-pill)',
                    background: rail.fg,
                  }}
                />
              )}
              <span style={{ display: 'flex' }}>
                <Icon name={n} size={20} color={selected ? rail.fg : rail.rest} />
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            boxSizing: 'border-box',
            height: 'var(--header-height)',
            flexShrink: 0,
            background: 'var(--surface-card)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--size-120)',
          }}
        >
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...caption1, fontWeight: 'var(--weight-semibold)' }}>
            {displayName}
          </span>
        </div>

        <div style={{ flex: 1, padding: 'var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-20)' }}>
          <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
          {/* The slogan is driver-facing, so it only appears once there is one. */}
          {slogan.trim() && (
            <span style={{ ...caption2, color: 'var(--text-helper)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {slogan}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
