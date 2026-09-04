'use client'

import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong, caption2, caption2Strong, subtitle1, subtitle2 } from '../../ds/type'
import { Card, Eyebrow, IconButton, SearchField, Tick, Toast } from './parts'
import { Toolbar } from './Toolbar'
import { QuestionBlock } from './QuestionBlock'
import { useResponses } from './useResponses'
import type { RespState } from './useResponses'

/**
 * Responses - what the drivers actually said.
 *
 * The page is a read, not a workspace: the numbers, the shape of the week, who
 * has not answered yet, then every question with its own answers underneath.
 */
export function ResponsesPage() {
  const s = useResponses()

  return (
    <div
      data-screen-label="Responses"
      onClick={s.closeFloating}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        // The design file subtracts the header; the shell has already done it.
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden auto',
      }}
    >
      <Toolbar s={s} />

      <div
        data-rsp-page=""
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-160)',
          padding: 'var(--size-160) var(--size-200) var(--size-240) var(--size-200)',
        }}
      >
        {!s.s.named && <AnonymousBanner />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
          <Eyebrow>The read</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--grid-gutter)' }}>
            {s.s.kpis.map((k) => (
              <Card key={k.label} style={{ padding: 'var(--size-120) var(--size-160)', gap: 'var(--size-20)' }}>
                <span style={{ ...caption2Strong, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text-label)', whiteSpace: 'nowrap' }}>
                  {k.label}
                </span>
                <span style={{ ...subtitle1, color: k.color }}>{k.value}</span>
                <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {k.sub}
                </span>
              </Card>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'var(--grid-gutter)', alignItems: 'stretch' }}>
          <Timeline s={s} />
          {s.s.named && <NotAnswered s={s} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
          <Eyebrow>Questions</Eyebrow>
          {s.s.questions
            .filter((q) => s.qFilter === 'All questions' || q.title === s.qFilter)
            .map((q) => (
              <QuestionBlock key={q.id} s={s} q={q} index={s.s.questions.indexOf(q) + 1} />
            ))}
        </div>
      </div>

      <Lightbox s={s} />
      <FilterDrawer s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}

function AnonymousBanner() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-80) var(--size-120)',
        background: 'var(--warning-bg)',
        border: '1px solid var(--warning-border)',
        borderRadius: 'var(--radius-medium)',
        ...caption1,
        color: 'var(--warning-fg)',
      }}
    >
      Anonymous survey
      <span
        title="No driver or route on any answer, no not-answered list, no reminders. Results stay hidden until 5 answers land."
        style={{
          boxSizing: 'border-box',
          width: 14,
          height: 14,
          borderRadius: 'var(--radius-circle)',
          border: '1px solid var(--warning-border)',
          color: 'var(--warning-fg)',
          fontSize: 10,
          fontWeight: 'var(--weight-semibold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
          flexShrink: 0,
        }}
      >
        i
      </span>
    </div>
  )
}

/** Responses per day, over the window the toolbar picked. */
function Timeline({ s }: { s: RespState }) {
  const bars = s.s.timeline
  const peak = Math.max(...bars.map((t) => t.n), 1)
  // Round the axis up to an even number so the midpoint label is a whole one.
  const max = Math.ceil(peak / 2) * 2
  const hovered = bars.findIndex((_, i) => s.hover === `tl-${i}`)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)' }}>
      <Eyebrow>Timeline</Eyebrow>
      <Card style={{ padding: 'var(--size-160)', gap: 'var(--size-120)' }}>
        <span style={subtitle2}>Responses per day</span>
        <div style={{ display: 'flex', gap: 'var(--size-80)' }}>
          <div
            style={{
              width: 28,
              height: 132,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              ...caption2,
              color: 'var(--text-disabled)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span>{max}</span>
            <span>{max / 2}</span>
            <span>0</span>
          </div>
          <div style={{ flex: 1, position: 'relative', height: 132 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, borderTop: '1px solid var(--border-subtle)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid var(--border-subtle)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderTop: '1px solid var(--border-default)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
              {bars.map((t, i) => {
                const on = s.hover === `tl-${i}`
                return (
                  <div
                    key={t.day}
                    onMouseEnter={() => s.setHover(`tl-${i}`)}
                    onMouseLeave={() => s.setHover(null)}
                    style={{
                      flex: 1,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      background: on ? 'var(--surface-subtle)' : 'transparent',
                      cursor: 'default',
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: `${(t.n / max) * 100}%`,
                        minHeight: 2,
                        borderRadius: '2px 2px 0 0',
                        background: on ? 'var(--primary)' : 'var(--blue-300)',
                      }}
                    />
                  </div>
                )
              })}
            </div>
            {hovered >= 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  left: `${((hovered + 0.5) / bars.length) * 100}%`,
                  transform: 'translateX(-50%)',
                  zIndex: 30,
                  pointerEvents: 'none',
                  boxSizing: 'border-box',
                  minWidth: 150,
                  padding: 'var(--size-80) var(--size-100)',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-medium)',
                  boxShadow: 'var(--elevation-callout)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--size-40)',
                }}
              >
                <span style={caption1Strong}>{bars[hovered].day}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-small)', background: 'var(--blue-500)', flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Responses</span>
                  <span style={{ fontWeight: 'var(--weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>{bars[hovered].n}</span>
                </span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', marginLeft: 36 }}>
          {bars.map((t) => {
            const [day, date] = t.day.split(' ')
            return (
              <span key={t.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', ...caption1 }}>
                <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{day}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{date}</span>
              </span>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

/** Who still owes an answer, and the one-click nudge for each. */
function NotAnswered({ s }: { s: RespState }) {
  const rows = s.s.notAnswered.filter((n) => s.naQuery === '' || n.name.toLowerCase().includes(s.naQuery.toLowerCase()))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-80)', minHeight: 0 }}>
      <Eyebrow>Not answered</Eyebrow>
      <Card style={{ flex: 1, minHeight: 0, maxHeight: 262, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--size-80) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
          <SearchField flex value={s.naQuery} onChange={s.setNaQuery} />
        </div>
        <div
          style={{
            display: 'flex',
            gap: 'var(--size-120)',
            padding: 'var(--size-80) var(--size-160)',
            background: 'var(--surface-subtle)',
            borderBottom: '1px solid var(--border-default)',
            ...caption2Strong,
            letterSpacing: '.6px',
            textTransform: 'uppercase',
            color: 'var(--text-label)',
          }}
        >
          <div style={{ flex: 1 }}>Driver</div>
          <div style={{ width: 88, flexShrink: 0 }} />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden auto', display: 'flex', flexDirection: 'column' }}>
          {rows.map((n) => (
            <NaRow key={n.name} s={s} name={n.name} done={n.reminded || s.remindedNames.includes(n.name)} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function NaRow({ s, name, done }: { s: RespState; name: string; done: boolean }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        minHeight: 36,
        padding: 'var(--size-40) var(--size-160)',
        borderBottom: '1px solid var(--border-subtle)',
        ...caption1,
      }}
    >
      <span style={{ flex: 1, minWidth: 0, fontWeight: 'var(--weight-semibold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <div
        onClick={() => { if (!done) s.remind(name) }}
        style={{
          boxSizing: 'border-box',
          width: 88,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-small)',
          background: done ? 'var(--surface-subtle)' : hover ? 'var(--blue-100)' : 'var(--primary-soft)',
          border: `1px solid ${done ? 'var(--border-subtle)' : 'var(--blue-200)'}`,
          ...caption1Strong,
          color: done ? 'var(--text-disabled)' : 'var(--text-link)',
          whiteSpace: 'nowrap',
          cursor: done ? 'default' : 'pointer',
          transition: 'background var(--motion-hover)',
        }}
        {...(done ? {} : hoverProps)}
      >
        {done ? 'Reminded' : 'Remind'}
      </div>
    </div>
  )
}

function Lightbox({ s }: { s: RespState }) {
  if (!s.lightbox) return null
  const q = s.s.questions.find((x) => x.id === s.lightbox!.qid)
  const p = q?.photos?.[s.lightbox.idx]
  if (!p) return null

  return (
    <div
      onClick={() => s.setLightbox(null)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width: 560,
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xlarge)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 320, background: `linear-gradient(135deg, ${p.g1}, ${p.g2})` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-120) var(--size-160)' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--body-1-size)', lineHeight: 'var(--body-1-lh)', fontWeight: 'var(--weight-semibold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.caption}
            </span>
            <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>
              {s.s.named ? `${p.when} · ${p.driver} · ${p.route}` : p.when.split(',')[0]}
            </span>
          </div>
          <IconButton name="FnDismiss" size={32} onClick={() => s.setLightbox(null)} />
        </div>
      </div>
    </div>
  )
}

/**
 * The filter drawer.
 *
 * One section on this page - which question to show - but it keeps the shared
 * drawer's shape: a draft that Cancel discards, a searchable body, and a footer
 * whose Clear All greys out when there is nothing to clear.
 */
function FilterDrawer({ s }: { s: RespState }) {
  if (!s.fpOpen) return null
  const options = ['All questions', ...s.s.questions.map((q) => q.title)]
  const q = s.fpQuery.trim().toLowerCase()
  const rows = q ? options.filter((o) => o.toLowerCase().includes(q)) : options
  const sectionOpen = !!q || !s.fpClosedSections.includes('questions')
  const dirty = s.draft !== 'All questions'
  const count = dirty ? 1 : 0
  const visible = rows.length > 0 || 'questions'.includes(q)

  return (
    <div
      onClick={() => { s.setFpOpen(false); s.setFpDraft(null) }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', zIndex: 70, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div
        role="dialog"
        aria-label="Filters"
        onClick={(e) => e.stopPropagation()}
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
          <IconButton name="FnDismiss" onClick={() => { s.setFpOpen(false); s.setFpDraft(null) }} />
        </div>
        <div style={{ flexShrink: 0, padding: '0 var(--size-200) var(--size-160) var(--size-200)' }}>
          <SearchField flex value={s.fpQuery} onChange={s.setFpQuery} placeholder="Search filters" />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', borderTop: '1px solid var(--border-subtle)' }}>
          {visible && (
            <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <SectionHead
                label="Questions"
                count={count}
                open={sectionOpen}
                onToggle={() =>
                  s.setFpClosedSections((c) => (c.includes('questions') ? c.filter((x) => x !== 'questions') : [...c, 'questions']))
                }
              />
              {sectionOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 var(--size-120) var(--size-120) var(--size-120)' }}>
                  {rows.map((o) => (
                    <OptionRow key={o} label={o} on={s.draft === o} onPick={() => s.setFpDraft(o)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
          <span
            onClick={() => { if (dirty) s.setFpDraft('All questions') }}
            style={{
              ...caption1,
              color: dirty ? 'var(--text-link)' : 'var(--text-disabled)',
              cursor: dirty ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
            }}
          >
            Clear all
          </span>
          <div style={{ flex: 1 }} />
          <DrawerButton onClick={() => { s.setFpOpen(false); s.setFpDraft(null) }}>Cancel</DrawerButton>
          <DrawerButton primary onClick={() => { s.setQFilter(s.draft); s.setFpOpen(false); s.setFpDraft(null) }}>
            Apply
          </DrawerButton>
        </div>
      </div>
    </div>
  )
}

function SectionHead({ label, count, open, onToggle }: { label: string; count: number; open: boolean; onToggle: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-200)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : undefined,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ flex: 1, minWidth: 0, ...caption1Strong }}>{label}</span>
      {!!count && (
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
          transform: `rotate(${open ? '0deg' : '-90deg'})`,
          transition: 'transform var(--duration-fast) var(--curve-easy-ease)',
        }}
      >
        <ChevronGlyph />
      </span>
    </div>
  )
}

function ChevronGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" style={{ display: 'block' }}>
      <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OptionRow({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      onMouseDown={(e) => e.preventDefault()}
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
        background: hover ? 'var(--surface-subtle)' : undefined,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Tick on={on} radio />
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
  )
}

function DrawerButton({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        ...caption1Strong,
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}
