import type { MouseEvent, ReactNode } from 'react'
import type { MakerState, Question } from './useSurveyMaker'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption2 } from '../../ds/type'
import { KINDS } from './data'
import { Helper, Seg } from './parts'

// Collapsed, a question is one line you can drag. Expanded, it is the whole
// editor. Only one is open at a time, so the list stays readable while you work.
export function QuestionCard({ q, i, m }: { q: Question; i: number; m: MakerState }) {
  const expanded = m.editing === i

  return (
    <div
      draggable={!expanded}
      onDragStart={() => m.beginDrag(i)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        m.dropOn(i)
      }}
      style={{
        boxSizing: 'border-box',
        background: 'var(--surface-subtle)',
        border: `1px solid ${expanded ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {expanded ? <Expanded q={q} i={i} m={m} /> : <Collapsed q={q} i={i} m={m} />}
    </div>
  )
}

const kindLabel = (q: Question) => (q.kind === 'Rating' ? `Rating 1-${q.scale}` : q.kind)

function Collapsed({ q, i, m }: { q: Question; i: number; m: MakerState }) {
  return (
    <div
      onClick={() => m.setEditing(i)}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-100) var(--size-120)', cursor: 'pointer' }}
    >
      <span style={{ display: 'flex', color: 'var(--text-disabled)', cursor: 'grab', flexShrink: 0 }}>
        <Icon name="SvDrag" size={14} />
      </span>
      <span style={{ ...caption1, color: 'var(--text-helper)', flexShrink: 0 }}>{i + 1}.</span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...caption1,
          color: q.text ? 'var(--text-primary)' : 'var(--text-helper)',
        }}
      >
        {q.text || 'Untitled question'}
      </span>
      <Tag>{kindLabel(q)}</Tag>
      {q.required && <Tag blue>Required</Tag>}
      <IconBtn title="Duplicate" name="SvCopy" onClick={() => m.duplicateQ(i)} />
      <IconBtn title="Delete" name="SvDelete" danger onClick={() => m.removeQ(i)} />
    </div>
  )
}

function Expanded({ q, i, m }: { q: Question; i: number; m: MakerState }) {
  const opts = q.options || []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: 'var(--size-120)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <span style={{ ...caption1, color: 'var(--text-helper)', flexShrink: 0 }}>{i + 1}.</span>
        <input
          data-field=""
          autoFocus
          value={q.text}
          onChange={(e) => m.patchQ(i, { text: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && m.setEditing(null)}
          placeholder="Type the question…"
          style={{
            boxSizing: 'border-box',
            flex: 1,
            minWidth: 0,
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-small)',
            padding: 'var(--size-60) var(--size-80)',
            fontFamily: 'var(--font-family)',
            ...caption1,
            color: 'var(--text-primary)',
            background: 'var(--surface-card)',
            outline: 'none',
          }}
        />
        <IconBtn title="Duplicate" name="SvCopy" onClick={() => m.duplicateQ(i)} />
        <IconBtn title="Delete" name="SvDelete" danger onClick={() => m.removeQ(i)} />
      </div>

      <Labelled label="Answer type">
        <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
          {KINDS.map((k) => (
            <Seg
              key={k}
              height={26}
              label={k}
              on={q.kind === k}
              onPick={() => m.patchQ(i, { kind: k, ...(k === 'Choice' && opts.length === 0 ? { options: ['', ''] } : {}) })}
            />
          ))}
        </div>
      </Labelled>

      {q.kind === 'Rating' && (
        <Labelled label="Scale">
          <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
            <Seg height={26} label="1-5" on={q.scale === 5} onPick={() => m.patchQ(i, { scale: 5 })} />
            <Seg height={26} label="1-10" on={q.scale === 10} onPick={() => m.patchQ(i, { scale: 10 })} />
          </div>
        </Labelled>
      )}

      {q.kind === 'Choice' && (
        <Labelled label="Options">
          {opts.map((o, oi) => (
            <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
              <input
                data-field=""
                value={o}
                onChange={(e) => m.patchQ(i, { options: opts.map((x, xi) => (xi === oi ? e.target.value : x)) })}
                placeholder={`Option ${oi + 1}`}
                style={{
                  boxSizing: 'border-box',
                  flex: 1,
                  minWidth: 0,
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-small)',
                  padding: 'var(--size-40) var(--size-80)',
                  fontFamily: 'var(--font-family)',
                  ...caption1,
                  color: 'var(--text-primary)',
                  background: 'var(--surface-card)',
                  outline: 'none',
                }}
              />
              {/* A choice needs two options to be a choice at all. */}
              <IconBtn
                title={opts.length <= 2 ? 'A choice needs at least 2 options' : 'Remove'}
                name="DismissSize16ThemeRegular"
                size={12}
                off={opts.length <= 2}
                onClick={() => opts.length > 2 && m.patchQ(i, { options: opts.filter((_, xi) => xi !== oi) })}
              />
            </div>
          ))}
          <span
            onClick={() => m.patchQ(i, { options: opts.concat(['']) })}
            style={{ alignSelf: 'flex-start', ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}
          >
            + Add an option
          </span>
        </Labelled>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', paddingTop: 'var(--size-40)', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        <div onClick={() => m.patchQ(i, { required: !q.required })} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', cursor: 'pointer' }}>
          <span
            style={{
              boxSizing: 'border-box',
              width: 14,
              height: 14,
              borderRadius: 'var(--radius-small)',
              border: `1px solid ${q.required ? 'var(--primary)' : 'var(--border-strong)'}`,
              background: q.required ? 'var(--primary)' : 'var(--surface-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              ...caption2,
              flexShrink: 0,
            }}
          >
            {q.required ? '✓' : ''}
          </span>
          <span style={{ ...caption1, color: 'var(--text-primary)' }}>Required · the driver cannot skip it</span>
        </div>
        <div style={{ flex: 1 }} />
        <DoneButton onClick={() => m.setEditing(null)} />
      </div>
    </div>
  )
}

function Labelled({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
      <Helper>{label}</Helper>
      {children}
    </div>
  )
}

function Tag({ children, blue }: { children?: ReactNode; blue?: boolean }) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height: 18,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-60)',
        borderRadius: 'var(--radius-small)',
        background: blue ? 'var(--blue-100)' : 'var(--surface-card)',
        border: `1px solid ${blue ? 'var(--blue-200)' : 'var(--border-subtle)'}`,
        ...caption2,
        color: blue ? 'var(--blue-700)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  )
}

function IconBtn({
  title,
  name,
  size = 14,
  danger,
  off,
  onClick,
}: {
  title: string
  name: string
  size?: number
  danger?: boolean
  off?: boolean
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      title={title}
      onClick={
        off
          ? (e) => e.stopPropagation()
          : (e) => {
              e.stopPropagation()
              onClick?.(e)
            }
      }
      style={{
        width: 24,
        height: 24,
        borderRadius: 'var(--radius-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: off ? 'var(--text-disabled)' : danger && hover ? 'var(--danger-fg)' : 'var(--text-secondary)',
        cursor: off ? 'default' : 'pointer',
        flexShrink: 0,
        background: !off && hover ? 'var(--surface-card)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name={name} size={size} />
    </span>
  )
}

function DoneButton({ onClick }: { onClick: (e: MouseEvent<HTMLDivElement>) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--primary-hover)' : 'var(--primary)',
        color: 'var(--text-inverse)',
        ...caption1,
        fontWeight: 'var(--weight-semibold)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      Done
    </div>
  )
}
