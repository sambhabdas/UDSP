import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { StatusChip } from '../../ds/components/Chip'
import { useHover } from '../../ds/useHover'
import {
  body1Strong,
  caption1,
  caption1Strong,
  caption2,
  caption2Strong,
  eyebrow,
  subtitle1,
} from '../../ds/type'
import { initials, tint } from './data'
import type { Person } from './data'
import type { InboxState } from './useInbox'

const card: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
  padding: 'var(--size-160)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--size-80)',
}

const divider: CSSProperties = { height: 1, background: 'var(--border-subtle)' }

const jumpLink: CSSProperties = { alignSelf: 'flex-end', ...caption1, whiteSpace: 'nowrap' }

function ContactRow({
  glyph,
  bg,
  border,
  color,
  children,
}: {
  glyph: string
  bg: string
  border: string
  color: string
  children?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 'var(--radius-circle)',
          background: bg,
          border: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={glyph} size={12} color={color} />
      </span>
      {children}
    </div>
  )
}

// Card 1 — the person. Read-only: no rail control ever edits a roster field.
function ProfileCard({ person }: { person: Person }) {
  const [avBg, avFg] = tint(person.name)
  return (
    <div style={{ ...card, gap: 'var(--size-100)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-circle)',
            background: avBg,
            color: avFg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...body1Strong,
            flexShrink: 0,
          }}
        >
          {initials(person.name)}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ ...body1Strong }}>{person.name}</span>
          <span style={{ ...caption1, color: 'var(--text-helper)' }}>{person.role}</span>
        </div>
      </div>
      <div style={divider} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-80)',
          ...caption1,
          color: 'var(--text-secondary)',
        }}
      >
        <ContactRow
          glyph="IbCall"
          bg="var(--green-100)"
          border="var(--green-200)"
          color="var(--green-700)"
        >
          {person.phone}
        </ContactRow>
        <ContactRow
          glyph="IbMail"
          bg="var(--blue-100)"
          border="var(--blue-200)"
          color="var(--blue-700)"
        >
          {person.email}
        </ContactRow>
        <ContactRow
          glyph="PgContactCard"
          bg="var(--yellow-100)"
          border="var(--yellow-200)"
          color="var(--yellow-700)"
        >
          {person.tid}
        </ContactRow>
        <ContactRow
          glyph="PgCalendarLtr"
          bg="var(--red-100)"
          border="var(--red-200)"
          color="var(--red-700)"
        >
          {person.tenure}
        </ContactRow>
      </div>
      <a href="#" style={jumpLink}>
        Full profile →
      </a>
    </div>
  )
}

// Card 2 — route and van only. The freshness stamp is on screen, never only in
// the data: amber once the On Road board is more than 90 minutes old.
function RouteCard({ person, stale }: { person: Person; stale: boolean }) {
  return (
    <div style={card}>
      <div style={eyebrow}>Current route</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-80)' }}>
        <span style={{ ...body1Strong }}>
          {person.onRoute ? person.route : 'Not on route today'}
        </span>
        {person.onRoute && (
          <span
            style={{
              ...caption2,
              whiteSpace: 'nowrap',
              color: stale ? 'var(--yellow-700)' : 'var(--text-helper)',
            }}
          >
            as of 14:41
          </span>
        )}
      </div>
      <div style={divider} />
      <a href="#" style={jumpLink}>
        Dispatch →
      </a>
    </div>
  )
}

// Card 3 — the shift gate, the one number and its tier. This page defines none
// of it and never clears the gate.
function PerformanceCard({ person }: { person: Person }) {
  const blocked = person.blocked
  return (
    <div style={card}>
      <div style={eyebrow}>Performance</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 'var(--radius-circle)',
            background: blocked ? 'var(--red-500)' : 'var(--green-500)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            ...caption1Strong,
            color: blocked ? 'var(--red-700)' : 'var(--green-700)',
          }}
        >
          {blocked ? 'Blocked — overdue coaching' : 'Clear to work'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
        <span
          style={{
            ...subtitle1,
            color: person.score < 0 ? 'var(--red-600)' : 'var(--text-primary)',
          }}
        >
          {person.score > 0 ? '+' : ''}
          {person.score}
        </span>
        {/* The tier chip carries the at-risk treatment — there is no second pill. */}
        <StatusChip
          bg={person.atRisk ? 'var(--red-100)' : 'var(--surface-subtle)'}
          border={person.atRisk ? 'var(--red-200)' : 'var(--border-default)'}
          fg={person.atRisk ? 'var(--red-700)' : 'var(--text-secondary)'}
        >
          {person.atRisk ? `${person.tier} · At risk` : person.tier}
        </StatusChip>
      </div>
      <div style={{ ...caption1, color: 'var(--text-secondary)' }}>
        Open events · {person.openEvents}
      </div>
      <div style={{ ...caption1, color: 'var(--text-secondary)' }}>
        Coaching pending · {person.coaching}
      </div>
      <div style={divider} />
      <a href="#" style={jumpLink}>
        Scorecard →
      </a>
    </div>
  )
}

function GhostButton({
  children,
  onClick,
  gap,
}: {
  children?: ReactNode
  onClick?: () => void
  gap?: string
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap,
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
        ...caption1Strong,
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

// Card 4 — the rail's only writes: + Add task and the done checkbox.
function TasksCard({ person, state }: { person: Person; state: InboxState }) {
  const tasks = person.tasks || []
  const doneTasks = person.doneTasks || []
  return (
    <div style={card}>
      <div style={eyebrow}>Tasks</div>
      {tasks.map((t, i) => (
        <div key={t.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--size-80)' }}>
          <span
            onClick={() => state.completeTask(i)}
            style={{
              boxSizing: 'border-box',
              width: 16,
              height: 16,
              marginTop: 1,
              borderRadius: 'var(--radius-small)',
              border: `1px solid ${t.done ? 'var(--primary)' : 'var(--border-strong)'}`,
              background: t.done ? 'var(--primary)' : 'var(--surface-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              cursor: 'pointer',
              flexShrink: 0,
              ...caption2,
              transition: 'background var(--motion-hover)',
            }}
          >
            {t.done ? '✓' : ''}
          </span>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-20)',
            }}
          >
            <span
              style={{
                ...caption1,
                color: t.done ? 'var(--text-helper)' : 'var(--text-primary)',
                textDecoration: t.done ? 'line-through' : 'none',
              }}
            >
              {t.label}
            </span>
            <span style={{ alignSelf: 'flex-start' }}>
              <TaskStatusPill status={t.done ? 'done' : t.status} />
            </span>
          </div>
        </div>
      ))}
      {tasks.length === 0 && !state.addingTask && (
        <div style={{ ...caption1, color: 'var(--text-secondary)' }}>No tasks yet</div>
      )}
      <div style={divider} />
      {state.addingTask && (
        <input
          data-field=""
          autoFocus
          placeholder="Task label — Enter to add"
          value={state.newTask}
          onChange={(e) => state.setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && state.addTask()}
          style={{
            boxSizing: 'border-box',
            height: 28,
            padding: '0 var(--size-100)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            outline: 'none',
            ...caption1,
            color: 'var(--text-primary)',
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <GhostButton
          gap="var(--size-40)"
          onClick={() => {
            state.setAddingTask(!state.addingTask)
            state.setNewTask('')
          }}
        >
          {state.addingTask ? 'Cancel' : '+ Add task'}
        </GhostButton>
        <div style={{ flex: 1 }} />
        {doneTasks.length > 0 && (
          <span
            onClick={() => state.setShowDone(!state.showDone)}
            style={{
              ...caption1,
              color: 'var(--text-link)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {state.showDone ? 'Hide done' : 'Done'} · {doneTasks.length}
          </span>
        )}
      </div>
      {state.showDone && doneTasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          {doneTasks.map((t) => (
            <div
              key={t.label}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}
            >
              <span
                style={{
                  boxSizing: 'border-box',
                  width: 16,
                  height: 16,
                  borderRadius: 'var(--radius-small)',
                  background: 'var(--green-100)',
                  border: '1px solid var(--green-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--green-700)',
                  ...caption2,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  ...caption1,
                  color: 'var(--text-helper)',
                  textDecoration: 'line-through',
                }}
              >
                {t.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TaskStatusPill({ status }: { status: 'done' | 'assigned' | 'pending' }) {
  const map: Record<string, readonly [string, string, string]> = {
    done: ['var(--green-100)', 'var(--green-200)', 'var(--green-700)'],
    assigned: ['var(--blue-100)', 'var(--blue-200)', 'var(--blue-700)'],
    pending: ['var(--surface-subtle)', 'var(--border-default)', 'var(--text-secondary)'],
  }
  const [bg, border, fg] = map[status] || map.pending
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height: 16,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-60)',
        borderRadius: 'var(--radius-pill)',
        background: bg,
        border: `1px solid ${border}`,
        ...caption2Strong,
        color: fg,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  )
}

// Read-only context pulled from the other portals, one jump link per card.
// Below 920px it becomes a right-hand drawer behind the header's Details button.
export function DecisionRail({
  person,
  stale,
  isDrawer,
  open,
  onClose,
  state,
}: {
  person: Person
  stale: boolean
  isDrawer: boolean
  open: boolean
  onClose: () => void
  state: InboxState
}) {
  const hidden = isDrawer && !open
  return (
    <div
      style={{
        boxSizing: 'border-box',
        minHeight: 0,
        overflow: 'hidden auto',
        display: hidden ? 'none' : 'flex',
        flexDirection: 'column',
        gap: 'var(--size-160)',
        position: isDrawer ? 'absolute' : 'static',
        top: 0,
        right: 0,
        bottom: 0,
        width: isDrawer ? 320 : 'auto',
        padding: isDrawer ? 'var(--size-160)' : 0,
        background: isDrawer ? 'var(--surface-page)' : 'transparent',
        borderLeft: isDrawer ? '1px solid var(--border-default)' : 'none',
        boxShadow: isDrawer ? 'var(--elevation-drawer)' : 'none',
        zIndex: 5,
      }}
    >
      {isDrawer && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ ...body1Strong }}>Details</span>
          <div style={{ flex: 1 }} />
          <CloseButton onClick={onClose} />
        </div>
      )}
      <ProfileCard person={person} />
      <RouteCard person={person} stale={stale} />
      <PerformanceCard person={person} />
      <TasksCard person={person} state={state} />
    </div>
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <Icon name="IbDismiss" size={16} />
    </span>
  )
}
