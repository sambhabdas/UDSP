'use client'

import { useHover } from '../../ds/useHover'
import { Icon } from '../../ds/icons/Icon'
import { body1, caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { PEOPLE } from './data'
import { fmt12, smsSegments } from './calc'
import { NumField, TallButton, Toggle } from './parts'
import { CARD, CARD_BAR } from './style'
import type { ComplianceState } from './useCompliance'

/** The two rows the previews are rendered against. */
const LUNCH_SAMPLE = PEOPLE.find((p) => p.id === 'p5')!
const PUNCH_SCHED = 690
const PUNCH_WAVE = 705

/** Fill the merge fields with the sample row, the way a real send would. */
function resolve(body: string, isLunch: boolean): string {
  return isLunch
    ? body
        .replace('{Employee}', 'MENDEZ, GABRIEL')
        .replace('{Lunch deadline}', fmt12(LUNCH_SAMPLE.inP! + 300))
        .replace('{Punched in}', fmt12(LUNCH_SAMPLE.inP!))
    : body
        .replace('{Employee}', 'DIAZ, DAVID')
        .replace('{Scheduled}', fmt12(PUNCH_SCHED))
        .replace('{Wave}', fmt12(PUNCH_WAVE))
}

const LUNCH_PILLS = ['{Employee}', '{Lunch deadline}', '{Punched in}']
const PUNCH_PILLS = ['{Employee}', '{Scheduled}', '{Wave}']

export function MessageSetup({ s }: { s: ComplianceState }) {
  const isLunch = s.mtSel === 0
  const preview = resolve(s.body, isLunch)
  const chars = preview.length
  const segs = smsSegments(preview)

  return (
    <>
      {/* Auto-Remind and its two thresholds. The card tints while it is on. */}
      <div
        data-screen-label="Compliance - Message Setup"
        style={{
          boxSizing: 'border-box',
          background: s.autoOn ? 'var(--blue-50)' : 'var(--surface-card)',
          border: `1px solid ${s.autoOn ? 'var(--blue-200)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-medium)',
          padding: 'var(--size-160)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-240)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
          <span style={subtitle2}>Auto-Remind</span>
          <Toggle on={s.autoOn} onClick={() => s.setAutoOn(!s.autoOn)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>Lunch reminder</span>
          <NumField value={s.leadDraft} onChange={s.setLeadDraft} />
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>min before the window closes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>Punch-in reminder</span>
          <NumField value={s.graceDraft} onChange={s.setGraceDraft} />
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>min after scheduled arrival</span>
        </div>
      </div>

      <div
        data-rsp-rail=""
        style={{ display: 'grid', gridTemplateColumns: '340px minmax(0,1fr)', gap: 'var(--size-160)', alignItems: 'start' }}
      >
        <div style={CARD}>
          <div style={CARD_BAR}>
            <span style={{ flex: 1, ...subtitle2 }}>Message Templates</span>
          </div>
          {[0, 1].map((j) => (
            <TemplateRow
              key={j}
              name={j === 0 ? 'Lunch Reminder' : 'Punch-In Reminder'}
              badge={j === 0 ? `Auto at close - ${s.lead} min` : `Auto at scheduled + ${s.grace} min`}
              selected={s.mtSel === j}
              dirty={j === 0 ? s.lunchDraft !== null && s.lunchDraft !== s.lunchBodySaved : s.punchDraft !== null && s.punchDraft !== s.punchBodySaved}
              onPick={() => s.setMtSel(j)}
            />
          ))}
        </div>

        <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
          <div style={CARD_BAR}>
            <span style={{ flex: 1, ...subtitle2 }}>{isLunch ? 'Lunch Reminder' : 'Punch-In Reminder'}</span>
          </div>
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-160)',
              padding: 'var(--size-160)',
            }}
          >
            <div
              data-rsp-c2=""
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
                gap: 'var(--size-200)',
                alignItems: 'stretch',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)', minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
                  <span style={{ ...caption1Strong, color: 'var(--text-secondary)' }}>Message</span>
                  <textarea
                    value={s.body}
                    onChange={(e) => s.setBody(e.target.value)}
                    rows={8}
                    style={{
                      boxSizing: 'border-box',
                      width: '100%',
                      padding: 'var(--size-100) var(--size-120)',
                      borderRadius: 'var(--radius-medium)',
                      border: '1px solid var(--border-default)',
                      outline: 'none',
                      ...body1,
                      color: 'var(--text-primary)',
                      background: 'var(--surface-card)',
                      resize: 'vertical',
                    }}
                  />
                  <span
                    style={{ alignSelf: 'flex-end', ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {chars} characters · {segs} SMS segment{segs > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
                  <span style={{ ...caption1Strong, color: 'var(--text-secondary)' }}>Merge Fields</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', flexWrap: 'wrap' }}>
                    {(isLunch ? LUNCH_PILLS : PUNCH_PILLS).map((pl) => (
                      <MergePill
                        key={pl}
                        label={pl}
                        onClick={() => s.setBody(s.body + (s.body && !s.body.endsWith(' ') ? ' ' : '') + pl)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)', minWidth: 0 }}>
                <span style={{ ...caption1Strong, color: 'var(--text-secondary)' }}>Preview</span>
                <div
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: 182,
                    overflow: 'auto',
                    padding: 'var(--size-100) var(--size-120)',
                    borderRadius: 'var(--radius-medium)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--surface-card)',
                    ...body1,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {preview}
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-80)',
              padding: 'var(--size-160)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <SmallButton onClick={() => s.toastMsg('Test SMS sent to the mobile number on your account')}>
              Send Test To Me
            </SmallButton>
            <div style={{ flex: 1 }} />
            <TallButton onClick={s.discard}>Discard Changes</TallButton>
            <TallButton primary onClick={s.save}>Save</TallButton>
          </div>
        </div>
      </div>
    </>
  )
}

function TemplateRow({
  name,
  badge,
  selected,
  dirty,
  onPick,
}: {
  name: string
  badge: string
  selected: boolean
  dirty: boolean
  onPick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 'var(--size-80) var(--size-160)',
        borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : selected ? 'var(--blue-50)' : 'var(--surface-card)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {selected && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--primary)' }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            ...body1,
            fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        {dirty && (
          <span
            title="Unsaved draft"
            style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: 'var(--primary)', flexShrink: 0 }}
          />
        )}
        <EditGlyph onClick={onPick} />
      </div>
      <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {badge}
      </span>
    </div>
  )
}

function EditGlyph({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      title="Edit this template"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 'var(--radius-small)',
        color: hover ? 'var(--primary)' : 'var(--text-disabled)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      {...hoverProps}
    >
      <Icon name="FnEdit" size={16} />
    </span>
  )
}

/** A merge field. Clicking one appends it to the end of the body. */
function MergePill({ label, onClick }: { label: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      title="Insert at the end of the body"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--blue-100)' : 'var(--blue-50)',
        border: '1px solid var(--blue-200)',
        color: 'var(--blue-700)',
        ...caption1Strong,
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

function SmallButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        minWidth: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--size-100)',
        borderRadius: 'var(--radius-medium)',
        border: '1px solid var(--border-default)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        ...caption1Strong,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}
