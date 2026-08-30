import type { ProjectionState } from './useProfitProjection'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, subtitle2 } from '../../ds/type'

// A thread against the week or the day, so the reason a figure looks odd sits
// next to the figure instead of in someone's inbox.
export function Notes({ s }: { s: ProjectionState }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 'var(--size-200)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-100) var(--size-160)' }}>
        <span style={{ ...subtitle2 }}>Notes</span>
        <span
          style={{
            boxSizing: 'border-box',
            minWidth: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 var(--size-60)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-default)',
            ...caption1Strong,
            color: 'var(--text-secondary)',
          }}
        >
          {s.notes.length}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-160) var(--size-120)' }}>
        <input
          data-field=""
          value={s.noteDraft}
          onChange={(e) => s.setNoteDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && s.postNote()}
          placeholder={s.isWeek ? 'Add a note about this week' : 'Add a note about this day'}
          style={{
            boxSizing: 'border-box',
            flex: 1,
            minWidth: 0,
            height: 'var(--control-height)',
            padding: '0 var(--size-120)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--surface-card)',
            fontFamily: 'var(--font-family)',
            ...body1,
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <PostButton onClick={s.postNote} />
      </div>

      {s.notes.map((n, i) => (
        <div key={i} style={{ display: 'flex', gap: 'var(--size-100)', padding: 'var(--size-100) var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-circle)',
              background: n.avBg,
              color: n.avFg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...caption1Strong,
              flexShrink: 0,
            }}
          >
            {n.initials}
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-80)', ...caption1 }}>
              <span style={{ ...caption1Strong }}>{n.author}</span>
              <span style={{ color: 'var(--text-helper)' }}>{n.when}</span>
            </span>
            <span style={{ ...body1, color: 'var(--text-primary)' }}>{n.text}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function PostButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-200)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--primary-hover)' : 'var(--primary)',
        color: 'var(--text-inverse)',
        ...body1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      Post
    </div>
  )
}
