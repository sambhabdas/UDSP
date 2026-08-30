import type { ReactNode } from 'react'
import type { ComposerProps } from './Composer'
import type { Activity, Channel, Person } from './data'
import { FilterChip, StatusChip } from '../../ds/components/Chip'
import { useHover } from '../../ds/useHover'
import { body1Strong, caption1, caption1Strong } from '../../ds/type'
import { CHANNELS, initials, tint } from './data'
import { Timeline } from './Timeline'
import { Composer } from './Composer'

function HeaderButton({ onClick, children }: { onClick: () => void; children?: ReactNode }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
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

export function ActivityPanel({
  person,
  feed,
  channels,
  onChannel,
  railIsDrawer,
  onToggleDetails,
  recentsIsDrawer,
  onToggleRecents,
  composer,
}: {
  person: Person
  feed: Activity[]
  channels: Channel[]
  onChannel: (c: Channel | 'All') => void
  railIsDrawer: boolean
  onToggleDetails: () => void
  recentsIsDrawer: boolean
  onToggleRecents: () => void
  composer: ComposerProps
}) {
  const [avBg, avFg] = tint(person.name)
  const onRoute = person.onRoute

  return (
    <div
      style={{
        boxSizing: 'border-box',
        minHeight: 0,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-100)',
          padding: 'var(--size-100) var(--size-160)',
          flexWrap: 'wrap',
          rowGap: 'var(--size-60)',
        }}
      >
        {recentsIsDrawer && <HeaderButton onClick={onToggleRecents}>Recents</HeaderButton>}
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-circle)',
            background: avBg,
            color: avFg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...caption1Strong,
            flexShrink: 0,
          }}
        >
          {initials(person.name)}
        </span>
        <span
          style={{
            ...body1Strong,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {person.name}
        </span>
        <StatusChip
          bg={onRoute ? 'var(--green-100)' : 'var(--surface-subtle)'}
          border={onRoute ? 'var(--green-200)' : 'var(--border-default)'}
          fg={onRoute ? 'var(--green-700)' : 'var(--text-secondary)'}
        >
          {onRoute && person.route ? `On route · ${person.route.split(' ·')[0]}` : 'Off duty'}
        </StatusChip>
        <div style={{ flex: 1 }} />
        {railIsDrawer && <HeaderButton onClick={onToggleDetails}>Details</HeaderButton>}
        {!recentsIsDrawer && (
          <a href="#" style={{ ...caption1, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Full profile →
          </a>
        )}
      </div>

      <div style={{ height: 1, background: 'var(--border-default)', flexShrink: 0 }} />

      {/* Channel chips cut the timeline to one activity type; the composer is unaffected. */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          gap: 'var(--size-60)',
          padding: 'var(--size-80) var(--size-160)',
          flexWrap: 'wrap',
        }}
      >
        {CHANNELS.map((c) => (
          <FilterChip
            key={c}
            label={c}
            selected={c === 'All' ? channels.length === 0 : channels.includes(c)}
            onSelect={() => onChannel(c)}
          />
        ))}
      </div>

      <Timeline feed={feed} />

      <Composer {...composer} firstName={person.name.split(' ')[0]} />
    </div>
  )
}
