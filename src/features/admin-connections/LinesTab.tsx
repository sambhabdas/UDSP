import type { MouseEvent } from 'react'
import type { Line, Member as MemberT, ReservedNumber } from './data'
import type { ConnectionsState } from './useConnections'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong } from '../../ds/type'
import { ASSIGN_KINDS, GREETINGS, INFO, LINE_HEADS, PRESENCE_DOT, TTS, USER_POOL, WHY } from './data'
import {
  Card,
  Chip,
  ChipRow,
  Dropdown,
  EmptyRow,
  Field,
  HeadCell,
  HeadRow,
  Labelled,
  OptionRow,
  RowMenu,
  SearchField,
  Section,
  SmallButton,
  Toolbar,
} from './parts'

// Line 110 + Number 120 + Assigned 110 + No answer 120 + Default 56 +
// Actions 56, plus gaps and cell padding. Below this the columns collide, so
// the table scrolls sideways in its own box rather than taking the page.
const MIN_WIDTH = 700
// Number 140 + Reserved on 100 + Actions 56, plus gaps and cell padding.
const RSV_MIN_WIDTH = 360

// A horizontal scroller clips vertically too, and a short table is shorter than
// its own row menu. Rather than flip the menu — which a two-row table has no
// room for in either direction — the scroller grows while a menu is open.
const MENU_ROOM = 84

export function LinesTab({ s }: { s: ConnectionsState }) {
  const lineMenuOpen = s.visibleLines.some((l) => s.menuFor === l.id)
  const rsvMenuOpen = s.visibleReserved.some((r) => s.menuFor === `rsv-${r.number}`)

  return (
    <>
      <Section label="Phone lines">
        <Card pad="0" gap="0" overflow="visible">
          <Toolbar>
            <SearchField
              value={s.lnQuery}
              onChange={(e) => s.setLnQuery(e.target.value)}
              placeholder="Search line, number or assignment"
            />
            <div style={{ flex: 1 }} />
            <SmallButton primary onClick={() => s.openAddLine()}>
              + Add line
            </SmallButton>
          </Toolbar>

          <div style={{ overflowX: 'auto', paddingBottom: lineMenuOpen ? MENU_ROOM : 0 }}>
            <div style={{ minWidth: MIN_WIDTH }}>
              <HeadRow>
                {LINE_HEADS.map((h) => (
                  <HeadCell key={h.label} h={h} sort={s.lnSort} onSort={() => h.k && s.sortLines(h.k)} />
                ))}
              </HeadRow>

              {s.visibleLines.map((l) => (
                <LineRow key={l.id} l={l} s={s} />
              ))}

              {s.visibleLines.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-240)' }}>
                  <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
                    {s.lines.length === 0 ? 'No lines yet - add one to send anything' : 'No lines match'}
                  </span>
                  <span onClick={() => s.setLnQuery('')} style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}>
                    Clear search
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Section>

      <Section label="Reserved numbers">
        <Card pad="0" gap="0" overflow="visible">
          <Toolbar>
            <SearchField value={s.rsvQuery} onChange={(e) => s.setRsvQuery(e.target.value)} placeholder="Search reserved numbers" />
            <div style={{ flex: 1 }} />
            <SmallButton primary onClick={s.openReserve}>
              + Reserve number
            </SmallButton>
          </Toolbar>

          <div style={{ overflowX: 'auto', paddingBottom: rsvMenuOpen ? MENU_ROOM : 0 }}>
            <div style={{ minWidth: RSV_MIN_WIDTH }}>
              <HeadRow>
                <HeadCell h={{ k: null, label: 'Number', flex: 1, min: 140 }} />
                <HeadCell h={{ k: null, label: 'Reserved on', w: 100 }} />
                <HeadCell h={{ k: null, label: 'Actions', w: 56, center: true }} />
              </HeadRow>

              {s.visibleReserved.map((r) => (
                <ReservedRow key={r.number} r={r} s={s} />
              ))}

              {s.visibleReserved.length === 0 && (
                <div style={{ padding: 'var(--size-160)', ...caption1, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {s.rsvQuery.trim() ? 'No match' : 'No reserved numbers'}
                </div>
              )}
            </div>
          </div>
        </Card>
      </Section>
    </>
  )
}

function LineRow({ l, s }: { l: Line; s: ConnectionsState }) {
  const [hover, hoverProps] = useHover()
  const open = s.drawerFor === l.id

  // The default line is the one everything falls back to, so it can be neither
  // re-defaulted nor deleted — both say why rather than vanishing.
  const items = [
    l.isDefault
      ? { label: 'Set as default', why: WHY.alreadyDefault }
      : { label: 'Set as default', act: () => s.setDefaultLine(l) },
    l.isDefault
      ? { label: 'Delete line', why: WHY.defaultUndeletable }
      : {
          label: 'Delete line',
          danger: true,
          act: () => {
            s.setDeleteFor(l.id)
            s.setDelText('')
            s.setMenuFor(null)
          },
        },
  ]

  return (
    <div>
      <div
        onClick={() => s.setDrawerFor(open ? null : l.id)}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          minHeight: 'var(--row-height)',
          padding: 'var(--size-60) var(--space-cell-x)',
          borderBottom: '1px solid var(--border-subtle)',
          background: hover || open ? 'var(--surface-subtle)' : 'transparent',
          ...caption1,
          cursor: 'pointer',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <div style={{ flex: 1, minWidth: 110, fontWeight: 'var(--weight-semibold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {l.name}
        </div>
        <div style={{ width: 120, flexShrink: 0, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {l.number}
        </div>
        <div style={{ width: 110, flexShrink: 0, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {l.assigned || '-'}
        </div>
        <div style={{ width: 120, flexShrink: 0, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {l.noAnswer}
        </div>
        <div style={{ width: 56, flexShrink: 0, display: 'flex' }}>
          {l.isDefault && (
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
              }}
            >
              Default
            </span>
          )}
        </div>
        <RowMenu
          open={s.menuFor === l.id}
          onToggle={(e) => {
            e.stopPropagation()
            s.setOpenDrop(null)
            s.setMenuFor(s.menuFor === l.id ? null : l.id)
          }}
          items={items}
        />
      </div>

      {open && <LineDrawer l={l} s={s} />}
    </div>
  )
}

function LineDrawer({ l, s }: { l: Line; s: ConnectionsState }) {
  const naOptions = ['Voicemail'].concat(s.lines.filter((o) => o.id !== l.id).map((o) => `Forward to ${o.name}`))
  const pool = s.memberPool(l)
  const memberOpen = s.openDrop === `member-${l.id}`
  const assignOpen = s.openDrop === `assign-${l.id}`
  const assignedIsUser = l.assigned !== 'Dispatch' && l.assigned !== 'Rescue'

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-200)',
        padding: 'var(--size-160) var(--space-cell-x) var(--size-200) var(--space-cell-x)',
        background: 'var(--surface-page)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--size-200)', flexWrap: 'wrap' }}>
        <Labelled label="Greeting" flex={1} min={220}>
          <ChipRow
            options={GREETINGS}
            value={l.greeting}
            onPick={(v) => s.patchLine(l.id, { greeting: v, vm: 'Greeting set' })}
          />
          {l.greeting === TTS && (
            <Field
              value={l.greetScript}
              onChange={(e) => s.patchLine(l.id, { greetScript: e.target.value })}
              placeholder="The script the caller hears"
            />
          )}
        </Labelled>

        <Labelled label="No answer" flex={1} min={220}>
          <ChipRow options={naOptions} value={l.noAnswer} onPick={(v) => s.patchLine(l.id, { noAnswer: v })} />
        </Labelled>

        <Labelled label="Caller ID name" info={INFO.callerId} flex={1} min={200}>
          <Field value={l.callerId} onChange={(e) => s.patchLine(l.id, { callerId: e.target.value })} />
        </Labelled>
      </div>

      <Labelled label="Ring group - in order" info={INFO.ringGroup}>
        <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap', alignItems: 'center' }}>
          {l.members.map((m) => (
            <Member key={m.name} m={m} onRemove={() => s.patchLine(l.id, { members: l.members.filter((x) => x.name !== m.name) })} />
          ))}
          <span style={{ position: 'relative', display: 'flex' }}>
            <AddMember
              onClick={(e) => {
                e.stopPropagation()
                s.setMenuFor(null)
                s.setOpenDrop(memberOpen ? null : `member-${l.id}`)
              }}
            />
            {memberOpen && (
              <Dropdown width={220}>
                {pool.map((p) => (
                  <OptionRow
                    key={p[0]}
                    onPick={() => {
                      s.patchLine(l.id, { members: l.members.concat([{ name: p[0], status: p[1] }]) })
                      s.setOpenDrop(null)
                    }}
                    trailing={<span style={{ ...caption1, color: 'var(--text-helper)' }}>{p[1]}</span>}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: PRESENCE_DOT[p[1]], flexShrink: 0 }} />
                      {p[0]}
                    </span>
                  </OptionRow>
                ))}
                {pool.length === 0 && <EmptyRow>Everyone is already in the group</EmptyRow>}
              </Dropdown>
            )}
          </span>
        </div>
      </Labelled>

      <Labelled label="Assigned to">
        <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
          {ASSIGN_KINDS.map((k) => {
            const isUser = k === 'User'
            const on = isUser ? assignedIsUser : l.assigned === k
            return (
              <span key={k} style={{ position: 'relative', display: 'flex' }}>
                <Chip
                  label={isUser && on ? `User: ${l.assigned}` : k}
                  on={on}
                  onPick={(e) => {
                    if (e) e.stopPropagation()
                    if (isUser) {
                      s.setMenuFor(null)
                      s.setOpenDrop(assignOpen ? null : `assign-${l.id}`)
                      return
                    }
                    s.patchLine(l.id, { assigned: k })
                    s.setOpenDrop(null)
                  }}
                />
                {isUser && assignOpen && (
                  // Upward: this is the last row in the drawer, and the table's
                  // scroller would clip a downward menu.
                  <Dropdown width={200} flip left={0}>
                    {USER_POOL.map((p) => (
                      <OptionRow
                        key={p[0]}
                        on={l.assigned === p[0]}
                        onPick={() => {
                          s.patchLine(l.id, { assigned: p[0] })
                          s.setOpenDrop(null)
                        }}
                      >
                        {p[0]}
                      </OptionRow>
                    ))}
                  </Dropdown>
                )}
              </span>
            )
          })}
        </div>
      </Labelled>
    </div>
  )
}

function Member({ m, onRemove }: { m: MemberT; onRemove: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
        padding: '0 var(--size-60) 0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        ...caption1,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: PRESENCE_DOT[m.status], flexShrink: 0 }} />
      {m.name}
      <span style={{ ...caption1, color: 'var(--text-helper)' }}>{m.status}</span>
      <span
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${m.name}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 'var(--radius-small)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          background: hover ? 'var(--surface-subtle)' : 'transparent',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <Icon name="DismissSize16ThemeRegular" size={16} />
      </span>
    </span>
  )
}

function AddMember({ onClick }: { onClick: (e: MouseEvent<HTMLSpanElement>) => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-small)',
        border: '1px dashed var(--border-strong)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1,
        color: 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      + Add member
    </span>
  )
}

function ReservedRow({ r, s }: { r: ReservedNumber; s: ConnectionsState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-160)',
        minHeight: 'var(--row-height)',
        padding: 'var(--size-60) var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1,
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ flex: 1, minWidth: 140, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.number}</div>
      <div style={{ width: 100, flexShrink: 0, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.since}</div>
      <RowMenu
        open={s.menuFor === `rsv-${r.number}`}
        onToggle={(e) => {
          e.stopPropagation()
          s.setOpenDrop(null)
          s.setMenuFor(s.menuFor === `rsv-${r.number}` ? null : `rsv-${r.number}`)
        }}
        items={[
          { label: 'Use for a new line', act: () => s.openAddLine(r.number) },
          { label: 'Release number', danger: true, act: () => { s.setReleaseFor(r.number); s.setMenuFor(null) } },
        ]}
      />
    </div>
  )
}
