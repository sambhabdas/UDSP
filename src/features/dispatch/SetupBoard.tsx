'use client'

import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle2 } from '../../ds/type'
import { resolveTemplate, smsSegments } from './calc'
import { Pill, ToolButton } from './parts'
import { BARE_INPUT, CARD, SECTION_LABEL } from './ui'
import type { DispatchState } from './useDispatch'

/** Merge fields every template can use, plus the ones only some can. */
const BASE_FIELDS = [
  '{Employee}', '{Day, Date}', '{Scheduled}', '{Wave}', '{Van}', '{Route}', '{Staging}', '{Transporter}',
]
const STATUS_FIELDS = ['{Stops done}', '{Stops}', '{Pkgs left}', '{Proj RTS}']
const RESCUE_FIELDS = [
  '{Rescuer}', '{Rescuing}', '{Rescuing Route}', '{Where}', '{Totes}', '{Rescuer Phone}', '{Rescuing Phone}',
]

/**
 * Setup: the SMS templates every send on this page reads from.
 *
 * The badge on each template names where it is used, so editing one shows its
 * blast radius before the edit rather than after. The preview resolves against
 * a real row for the same reason.
 */
export function SetupBoard({ s }: { s: DispatchState }) {
  const i = Math.min(s.tmplSel, s.tmpls.length - 1)
  const t = s.tmpls[i]
  const dirty = s.tmplEdit === i && s.tmplDraft !== t.body
  const body = s.tmplEdit === i ? s.tmplDraft : t.body

  const isStatus = t.name === 'Route Status' || t.name === 'Behind Check-In'
  const isRescue = t.name.startsWith('Rescue Meet-Up')
  const fields = [...BASE_FIELDS, ...(isStatus ? STATUS_FIELDS : []), ...(isRescue ? RESCUE_FIELDS : [])]

  // Status templates preview against a route that is actually behind, so the
  // numbers in the preview are the ones that matter.
  const previewRow = isStatus
    ? (s.day.rows.find((r) => s.day.itin[r.id]?.st === 'behind') ?? s.day.rows[0])
    : s.day.rows[0]
  const preview = resolveTemplate(body, previewRow, s.day, s.schedOff)
  const segs = smsSegments(preview)

  const startEditing = (idx: number) => {
    s.setTmplSel(idx)
    s.setTmplEdit(idx)
    s.setTmplDraft(s.tmpls[idx].body)
  }

  return (
    <div
      data-screen-label="Setup"
      data-rsp-rail=""
      style={{
        display: 'grid',
        gridTemplateColumns: '340px minmax(0,1fr)',
        gap: 'var(--size-160)',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        <span style={SECTION_LABEL}>Templates</span>
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {s.tmpls.map((x, j) => (
            <TemplateRow
              key={x.name + j}
              name={x.name}
              badge={x.badge}
              selected={j === i}
              onPick={() => startEditing(j)}
            />
          ))}
          <div style={{ padding: 'var(--size-120)', borderTop: '1px solid var(--border-subtle)' }}>
            <ToolButton
              onClick={() => {
                const next = [...s.tmpls, { name: 'Untitled template', badge: 'Extra · P5 Template', seeded: false, body: '' }]
                s.setTmpls(next)
                startEditing(next.length - 1)
              }}
            >
              + New template
            </ToolButton>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
        <span style={SECTION_LABEL}>{t.name}</span>
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column', gap: 'var(--size-120)', padding: 'var(--size-160)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
            <span style={subtitle2}>{t.name}</span>
            <Pill bg="var(--surface-subtle)" border="var(--border-default)" fg="var(--text-secondary)">
              {t.badge}
            </Pill>
            {t.seeded && (
              <Pill bg="var(--info-bg)" border="var(--info-border)" fg="var(--info-fg)" title="Ships with the product — it can be edited but not archived">
                Built in
              </Pill>
            )}
          </div>

          <textarea
            value={body}
            onChange={(e) => {
              if (s.tmplEdit !== i) s.setTmplEdit(i)
              s.setTmplDraft(e.target.value)
            }}
            rows={7}
            style={{
              ...BARE_INPUT,
              boxSizing: 'border-box',
              width: '100%',
              padding: 'var(--size-120)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--surface-card)',
              resize: 'vertical',
              lineHeight: 'var(--body-1-lh)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
            {fields.map((f) => (
              <FieldPill
                key={f}
                label={f}
                onInsert={() => {
                  if (s.tmplEdit !== i) s.setTmplEdit(i)
                  const cur = s.tmplEdit === i ? s.tmplDraft : t.body
                  s.setTmplDraft(cur + (cur && !cur.endsWith(' ') ? ' ' : '') + f)
                }}
              />
            ))}
          </div>

          <div
            style={{
              boxSizing: 'border-box',
              padding: 'var(--size-120) var(--size-160)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-60)',
            }}
          >
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
              Preview · {previewRow ? previewRow.emp : 'no rows to preview against'}
            </span>
            <span style={{ ...body1, whiteSpace: 'pre-wrap', textWrap: 'pretty' }}>{preview || '-'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
            <span
              style={{
                ...caption1,
                // Past three segments the cost is worth flagging, not hiding.
                color: segs > 3 ? 'var(--warning-fg)' : 'var(--text-secondary)',
              }}
            >
              {preview.length} characters · {segs} SMS segment{segs > 1 ? 's' : ''}
            </span>
            <div style={{ flex: 1 }} />
            <ToolButton onClick={() => s.toastMsg('Test SMS sent to your phone via the station number')}>
              Send a test
            </ToolButton>
            <ToolButton
              onClick={() => {
                if (!dirty) {
                  s.toastMsg('Nothing to discard')
                  return
                }
                s.setTmplDraft(t.body)
              }}
            >
              Discard
            </ToolButton>
            <ToolButton
              primary={dirty}
              onClick={() => {
                if (!dirty) {
                  s.toastMsg('Nothing to save')
                  return
                }
                s.setTmpls(s.tmpls.map((x, j) => (j === i ? { ...x, body: s.tmplDraft } : x)))
                s.setTmplEdit(null)
                s.toastMsg('Saved - every sender reads the new body from the next send')
              }}
            >
              Save
            </ToolButton>
          </div>
        </div>

        <ServiceTypes s={s} />
      </div>
    </div>
  )
}

function TemplateRow({
  name,
  badge,
  selected,
  onPick,
}: {
  name: string
  badge: string
  selected: boolean
  onPick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 'var(--size-100) var(--size-160)',
        borderBottom: '1px solid var(--border-subtle)',
        background: selected ? 'var(--blue-50)' : hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ ...body1, fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)' }}>
        {name}
      </span>
      <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{badge}</span>
    </div>
  )
}

function FieldPill({ label, onInsert }: { label: string; onInsert: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onInsert}
      title="Insert this field"
      style={{
        boxSizing: 'border-box',
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-pill)',
        background: hover ? 'var(--blue-100)' : 'var(--surface-subtle)',
        border: '1px solid var(--border-default)',
        ...caption1,
        fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </span>
  )
}

/** The service-type table the roster's bands come from. */
function ServiceTypes({ s }: { s: DispatchState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
      <span style={SECTION_LABEL}>Service types</span>
      <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 80px 1fr',
            gap: 'var(--size-80)',
            padding: 'var(--size-80) var(--space-cell-x)',
            background: 'var(--surface-subtle)',
            borderBottom: '1px solid var(--border-default)',
            ...caption1Strong,
            color: 'var(--text-secondary)',
          }}
        >
          <div>Name</div>
          <div style={{ textAlign: 'right' }}>Hours</div>
          <div>Vehicle type</div>
        </div>
        {s.svcReg.map((r) => (
          <div
            key={r.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 80px 1fr',
              alignItems: 'center',
              gap: 'var(--size-80)',
              minHeight: 40,
              padding: 'var(--size-40) var(--space-cell-x)',
              borderBottom: '1px solid var(--border-subtle)',
              ...body1,
            }}
          >
            <div>{r.name}</div>
            <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.hours}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{r.veh || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
