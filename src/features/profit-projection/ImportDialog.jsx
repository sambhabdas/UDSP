import { useHover } from '../../ds/useHover.js'
import { body1Strong, caption1, caption1Strong, caption2Strong, subtitle2, title3 } from '../../ds/type.js'
import {
  IMPORT_FILE,
  MAP_ROWS,
  SPLIT_BASE,
  SPLIT_EXTRA,
  SPLIT_TOTALS,
  UNMATCHED_CODES,
} from './data.js'

const headerRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-120)',
  padding: 'var(--size-80) var(--size-160)',
  background: 'var(--surface-subtle)',
  borderBottom: '1px solid var(--border-default)',
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

const dataRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--size-120)',
  minHeight: 'var(--row-height)',
  padding: 'var(--size-60) var(--size-160)',
  borderBottom: '1px solid var(--border-subtle)',
  ...caption1,
}

const boxed = { border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }

function Btn({ children, onClick, tone = 'ghost', wide }) {
  const [hover, hoverProps] = useHover()
  const primary = tone === 'primary'
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${wide ? 'var(--size-200)' : 'var(--size-120)'}`,
        borderRadius: 'var(--radius-medium)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: primary ? '1px solid var(--primary)' : '1px solid var(--border-default)',
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function Chip({ children, onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 20,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      {...hoverProps}
    >
      {children}
    </span>
  )
}

// The payroll file is read, mapped and split into days BEFORE anything lands —
// the dialog says exactly what each day will do, including the ones it skips.
export function ImportDialog({ s }) {
  const splitRows = s.splitAll ? SPLIT_BASE.concat(SPLIT_EXTRA) : SPLIT_BASE
  const notice = (msg) => (e) => {
    e.stopPropagation()
    s.toast(msg)
  }

  return (
    <div
      onClick={() => s.setImportOpen(false)}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(17,24,39,.4)',
        zIndex: 70,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'var(--size-320) var(--size-200)',
        overflow: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Import payroll data"
        style={{
          boxSizing: 'border-box',
          width: 780,
          maxWidth: '100%',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160) var(--size-200)' }}>
          <span style={{ ...title3 }}>Import payroll data</span>
          <div style={{ flex: 1 }} />
          <CloseX onClick={() => s.setImportOpen(false)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)', padding: '0 var(--size-200) var(--size-200)' }}>
          {/* The file */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-120)',
              padding: 'var(--size-120) var(--size-160)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
            }}
          >
            <span
              style={{
                boxSizing: 'border-box',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-small)',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-default)',
                ...caption2Strong,
                color: 'var(--text-secondary)',
                flexShrink: 0,
              }}
            >
              XLS
            </span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ ...body1Strong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {IMPORT_FILE.name}
              </span>
              <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{IMPORT_FILE.meta}</span>
            </div>
            <Btn onClick={notice('Available in the build')}>Replace</Btn>
            <Btn onClick={notice('Available in the build')}>Remove</Btn>
          </div>

          {/* Column mapping */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
              <span style={{ ...subtitle2, whiteSpace: 'nowrap', flexShrink: 0 }}>Columns we found</span>
              <span
                style={{
                  boxSizing: 'border-box',
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--size-60)',
                  padding: '0 var(--size-80)',
                  borderRadius: 'var(--radius-medium)',
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  ...caption1Strong,
                  color: 'var(--success-fg)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--success-accent)', flexShrink: 0 }} />
                Preset remembered
              </span>
            </div>
            <div style={boxed}>
              <div style={headerRow}>
                <span style={{ width: 220, flexShrink: 0 }}>Column in the file</span>
                <span style={{ flex: 1 }}>Becomes</span>
                <span style={{ width: 150, flexShrink: 0, textAlign: 'right' }}>Sample</span>
              </div>
              {MAP_ROWS.map((m) => (
                <div key={m.src} style={dataRow}>
                  <span
                    style={{
                      width: 220,
                      flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums',
                      color: m.unused ? 'var(--text-disabled)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {m.src}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      color: m.unused ? 'var(--text-disabled)' : 'var(--text-link)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.becomes}
                  </span>
                  {m.mapIt && <Chip onClick={notice('Available in the build')}>Map it</Chip>}
                  <span
                    style={{
                      width: 150,
                      flexShrink: 0,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {m.sample}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Day split */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
            <span style={{ ...subtitle2, whiteSpace: 'nowrap' }}>The file splits itself into 17 days</span>
            <div style={boxed}>
              <div style={headerRow}>
                <span style={{ width: 110, flexShrink: 0 }}>Day</span>
                <span style={{ width: 64, flexShrink: 0, textAlign: 'right' }}>People</span>
                <span style={{ width: 96, flexShrink: 0, textAlign: 'right' }}>Gross pay</span>
                <span style={{ flex: 1, paddingLeft: 'var(--size-160)' }}>What happens</span>
              </div>
              {splitRows.map((r) => {
                const c = r.dim ? 'var(--text-disabled)' : 'var(--text-primary)'
                return (
                  <div key={r.day} style={dataRow}>
                    <span style={{ width: 110, flexShrink: 0, color: c, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.day}</span>
                    <span style={{ width: 64, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: c }}>{r.people}</span>
                    <span style={{ width: 96, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: c }}>{r.gross}</span>
                    <span style={{ flex: 1, minWidth: 0, paddingLeft: 'var(--size-160)', display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
                      <span style={{ color: r.whatC, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.what}</span>
                      {r.unlock && <Chip onClick={notice('Available in the build')}>Unlock it</Chip>}
                    </span>
                  </div>
                )
              })}
              <MoreSplit onClick={(e) => { e.stopPropagation(); s.setSplitAll(!s.splitAll) }}>
                {s.splitAll ? 'Show fewer' : '13 more days · show all'}
              </MoreSplit>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--size-120)',
                  minHeight: 'var(--row-height)',
                  padding: 'var(--size-60) var(--size-160)',
                  background: 'var(--surface-subtle)',
                  ...caption1Strong,
                }}
              >
                <span style={{ width: 110, flexShrink: 0, whiteSpace: 'nowrap' }}>{SPLIT_TOTALS.days}</span>
                <span style={{ width: 64, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{SPLIT_TOTALS.people}</span>
                <span style={{ width: 96, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{SPLIT_TOTALS.gross}</span>
                <span style={{ flex: 1, paddingLeft: 'var(--size-160)', whiteSpace: 'nowrap' }}>{SPLIT_TOTALS.what}</span>
              </div>
            </div>
          </div>

          {/* Codes that did not match */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-120)',
              padding: 'var(--size-120) var(--size-160)',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-medium)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ ...caption1Strong, color: 'var(--warning-fg)' }}>{UNMATCHED_CODES.headline}</span>
              <span style={{ ...caption1, color: 'var(--warning-fg)' }}>{UNMATCHED_CODES.detail}</span>
            </div>
            <Btn onClick={notice('Available in the build')}>Link now</Btn>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
            <div style={{ flex: 1 }} />
            <Btn onClick={() => s.setImportOpen(false)}>Cancel</Btn>
            <Btn
              tone="primary"
              wide
              onClick={() => {
                s.setImportOpen(false)
                s.toast('Imported 16 days · 2 codes flagged for linking')
              }}
            >
              Import 16 days
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

function CloseX({ onClick }) {
  const [hover, hoverProps] = useHover()
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
        fontSize: 16,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      ×
    </span>
  )
}

function MoreSplit({ children, onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--size-160)',
        borderBottom: '1px solid var(--border-subtle)',
        ...caption1,
        color: 'var(--text-link)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}
