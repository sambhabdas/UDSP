import { caption1, caption1Strong, caption2Strong } from '../../ds/type.js'
import { BANDS, FULL, POSTS, PUNCH, READ } from './data.js'

// Six columns of comparison. Below this the pills would be squeezed and
// `Punch API tab only` — the one partial that is named rather than coloured —
// would be clipped, so the matrix scrolls sideways as one piece instead. All
// ten bands share a single scroller, otherwise their columns would drift out of
// alignment with each other.
const MATRIX_MIN_WIDTH = 1160

const CAP_COL = { flex: 2.2, minWidth: 220 }

const PILLS = {
  [FULL]: { label: 'Full', bg: 'var(--success-bg)', border: 'var(--success-border)', fg: 'var(--success-fg)' },
  [READ]: { label: 'Read', bg: 'var(--blue-100)', border: 'var(--blue-200)', fg: 'var(--blue-700)' },
  [PUNCH]: { label: 'Punch API tab only', bg: 'var(--warning-bg)', border: 'var(--warning-border)', fg: 'var(--warning-fg)' },
}

// With nothing selected the Owner column stays tinted: it is not a variable.
// Once a post is picked, that column takes the tint and every other one dims.
function columnBg(i, selIdx) {
  if (i === selIdx) return 'var(--blue-50)'
  if (i === 0 && selIdx < 0) return 'var(--surface-subtle)'
  return 'transparent'
}

function Cell({ value, i, selIdx }) {
  const pill = PILLS[value]
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        background: columnBg(i, selIdx),
        opacity: selIdx >= 0 && i !== selIdx ? 0.4 : 1,
        transition: 'opacity var(--motion-hover)',
      }}
    >
      {pill ? (
        <span
          style={{
            boxSizing: 'border-box',
            height: 20,
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--size-80)',
            borderRadius: 'var(--radius-medium)',
            background: pill.bg,
            border: `1px solid ${pill.border}`,
            ...caption1Strong,
            color: pill.fg,
            whiteSpace: 'nowrap',
          }}
        >
          {pill.label}
        </span>
      ) : (
        /* A dash is hidden, never disabled — the post never sees the thing. */
        <span style={{ ...caption1, color: 'var(--text-disabled)' }}>—</span>
      )}
    </div>
  )
}

function Band({ band, rows, selIdx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', marginTop: 'var(--size-120)' }}>
      <span style={{ ...caption1Strong, color: 'var(--text-primary)' }}>{band}</span>

      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-medium)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 'var(--size-80)',
            padding: 'var(--size-80) var(--size-160)',
            background: 'var(--surface-subtle)',
            borderBottom: '1px solid var(--border-default)',
            ...caption2Strong,
            letterSpacing: '.6px',
            textTransform: 'uppercase',
            color: 'var(--text-label)',
          }}
        >
          <div style={CAP_COL}>Capability</div>
          {POSTS.map((p, i) => (
            <div
              key={p}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'stretch',
                whiteSpace: 'nowrap',
                background: i === selIdx ? 'var(--blue-50)' : 'transparent',
                color: i === selIdx ? 'var(--text-primary)' : 'var(--text-label)',
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {rows.map((m) => (
          <div
            key={m.cap}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-80)',
              minHeight: 'var(--row-height)',
              padding: 'var(--size-60) var(--space-cell-x)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ ...CAP_COL, ...caption1, color: 'var(--text-primary)', textWrap: 'pretty' }}>
              {m.cap}
            </div>
            {m.cells.map((v, i) => (
              <Cell key={POSTS[i]} value={v} i={i} selIdx={selIdx} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Matrix({ selIdx }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      {/* The bands are flex children with the page's own gap, so moving them
          into this scroller does not compress the rhythm between them: each
          band's margin sits on top of that gap exactly as it does in the page
          column. */}
      <div
        style={{
          minWidth: MATRIX_MIN_WIDTH,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-200)',
        }}
      >
        {BANDS.map((b) => (
          <Band key={b.band} band={b.band} rows={b.rows} selIdx={selIdx} />
        ))}
      </div>
    </div>
  )
}
