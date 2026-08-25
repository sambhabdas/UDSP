import { Icon } from '../../ds/icons/Icon.jsx'
import { Button } from '../../ds/components/Button.jsx'
import { Field } from '../../ds/components/Overlay.jsx'
import { useHover } from '../../ds/useHover.js'
import {
  body1,
  body1Strong,
  caption1,
  caption1Strong,
  caption2Strong,
  eyebrow,
} from '../../ds/type.js'
import { fmtRange, money, periodWeeks } from './calendar.js'
import { MANUAL_GROUPS, TODAY, UNMAPPED_ROWS, UNMAPPED_TOTAL } from './data.js'
import { tableMin, tableScroll } from './table.js'

const card = {
  flexShrink: 0,
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
}

const headerCell = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

const num = (v) => (v == null ? 0 : v)

// The one dashed border in the system, where it means "nothing here yet".
function UploadZone({ s }) {
  const [hover, hoverProps] = useHover()
  const disabled = s.periodStatus === 'posted'
  const parsing = s.parsing.active
  return (
    <div
      onClick={s.simulateUpload}
      title={
        disabled
          ? 'This period is posted. Revert it first.'
          : `Uploads are saved against P${s.activePeriod}`
      }
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--size-80)',
        padding: 'var(--size-320) var(--size-200)',
        background: disabled
          ? 'var(--surface-subtle)'
          : parsing
            ? 'var(--primary-soft)'
            : hover
              ? 'var(--surface-subtle)'
              : 'var(--surface-card)',
        border: `1px dashed ${disabled ? 'var(--border-subtle)' : parsing ? 'var(--primary)' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius-medium)',
        textAlign: 'center',
        cursor: disabled || parsing ? 'default' : 'pointer',
        transition: 'background var(--motion-hover), border-color var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span
        style={{
          display: 'flex',
          color: parsing ? 'var(--primary)' : 'var(--text-disabled)',
        }}
      >
        <Icon name="FnUpload" size={24} />
      </span>
      <span style={{ ...body1Strong, color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)' }}>
        {disabled
          ? 'This period is posted. Revert it before replacing the figures.'
          : parsing
            ? `Reading PaycomReport_P${s.activePeriod}.xlsx`
            : 'Drop this period’s Paycom payroll file here, or click to browse.'}
      </span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>
        {disabled
          ? ''
          : parsing
            ? s.parsing.stage
            : 'Excel file (.xlsx). Uploading again replaces this period’s figures.'}
      </span>
    </div>
  )
}

function ManualEntry({ s }) {
  return (
    <div
      style={{
        ...card,
        padding: 'var(--size-160)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-120)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
        <span style={{ ...body1Strong }}>
          Manual entry · P{s.periodRow.n} · {periodWeeks(s.periodRow.start)}
        </span>
        <span
          title="Saved as this period’s figures and marked as entered manually."
          style={{ display: 'flex', color: 'var(--text-helper)', cursor: 'help' }}
        >
          <Icon name="FnInfo" size={14} />
        </span>
        <div style={{ flex: 1 }} />
        <Button
          onClick={() => {
            s.setManualOpen(false)
            s.setManual({ dg: '', dt: '', pg: '', pt: '', tg: '', tt: '' })
          }}
        >
          Cancel
        </Button>
        <Button tone="primary" onClick={s.saveManual}>
          Save
        </Button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--size-160)',
        }}
      >
        {MANUAL_GROUPS.map(([name, gk, tk]) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
            <span style={{ ...eyebrow, color: 'var(--text-label)' }}>{name}</span>
            {[
              [gk, 'Gross pay'],
              [tk, 'Employer taxes'],
            ].map(([k, label]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
                <span style={{ ...caption1Strong, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
                <Field>
                  <span style={{ ...body1, color: 'var(--text-helper)' }}>$</span>
                  <input
                    value={s.manual[k]}
                    inputMode="decimal"
                    placeholder="0.00"
                    onChange={(e) =>
                      s.setManual((m) => ({ ...m, [k]: e.target.value.replace(/[^0-9.]/g, '') }))
                    }
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'var(--font-family)',
                      ...body1,
                      color: 'var(--text-primary)',
                      padding: 0,
                    }}
                  />
                </Field>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function FiguresTable({ s }) {
  const fig = s.figures
  const rows = [
    ['Driver', 'Driver · Driver–Step Van · Standby', fig.dg, fig.dt, ''],
    ['Dispatch', 'Dispatch', fig.pg, fig.pt, ''],
    [
      'Training',
      'Trainer · AMZL Training',
      fig.tg,
      fig.tt,
      'This file has no Trainer or AMZL Training rows. That means absent, not zero.',
    ],
  ]
  const grossAll = num(fig.dg) + num(fig.pg) + num(fig.tg)
  const taxAll = num(fig.dt) + num(fig.pt) + num(fig.tt)

  const cell = { flex: 0.8, minWidth: 90, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }

  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-100)',
          padding: 'var(--size-100) var(--size-160)',
        }}
      >
        <span style={{ ...body1Strong }}>Extracted figures by group</span>
        <span style={{ ...caption1, color: 'var(--text-helper)' }}>
          {s.periodState.source
            ? s.periodState.source.manual
              ? `Entered by hand by ${s.periodState.source.by} on ${s.periodState.source.on}`
              : `Read from ${s.periodState.source.file}, uploaded by ${s.periodState.source.by} on ${s.periodState.source.on}`
            : ''}
        </span>
      </div>
      <div style={tableScroll}>
      <div style={tableMin}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          padding: 'var(--size-100) var(--space-cell-x)',
          background: 'var(--surface-subtle)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          ...headerCell,
        }}
      >
        <div style={{ width: 90, flexShrink: 0 }}>Group</div>
        <div style={{ flex: 1.4, minWidth: 170 }}>Positions summed</div>
        <div style={cell}>Gross pay</div>
        <div style={{ ...cell, minWidth: 100 }}>Employer taxes</div>
        <div style={cell}>Total</div>
      </div>

      {rows.map(([group, positions, g, t, absentHover]) => (
        <div
          key={group}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-160)',
            minHeight: 'var(--row-height)',
            padding: 'var(--size-60) var(--space-cell-x)',
            borderBottom: '1px solid var(--border-subtle)',
            ...caption1,
          }}
        >
          <div style={{ width: 90, flexShrink: 0 }}>{group}</div>
          <div style={{ flex: 1.4, minWidth: 170, color: 'var(--text-secondary)' }}>{positions}</div>
          {/* An absent group prints nothing and says why on hover — absent is
              not zero, and a zero here would be a lie about the file. */}
          <div title={g == null ? absentHover : ''} style={{ ...cell, color: g == null ? 'var(--text-helper)' : 'var(--text-primary)' }}>
            {g == null ? '' : money(g)}
          </div>
          <div title={g == null ? absentHover : ''} style={{ ...cell, minWidth: 100, color: g == null ? 'var(--text-helper)' : 'var(--text-primary)' }}>
            {t == null ? '' : money(t)}
          </div>
          <div title={g == null ? absentHover : ''} style={{ ...cell, color: g == null ? 'var(--text-helper)' : 'var(--text-primary)' }}>
            {g == null && t == null ? '' : money(num(g) + num(t))}
          </div>
        </div>
      ))}

      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-160)',
          minHeight: 'var(--row-height)',
          padding: 'var(--size-60) var(--space-cell-x)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-subtle)',
          ...caption1Strong,
        }}
      >
        <div style={{ width: 90, flexShrink: 0 }}>All groups</div>
        <div style={{ flex: 1.4, minWidth: 170 }} />
        <div style={cell}>{money(grossAll)}</div>
        <div style={{ ...cell, minWidth: 100 }}>{money(taxAll)}</div>
        <div style={cell}>{money(grossAll + taxAll)}</div>
      </div>
      </div>
      </div>

      {s.periodState.unmapped && (
        <div
          role="status"
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--size-120)',
            padding: 'var(--size-120) var(--size-160)',
            background: 'var(--warning-bg)',
            borderTop: '1px solid var(--warning-border)',
            borderRadius: '0 0 var(--radius-medium) var(--radius-medium)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-20)' }}>
            <span style={{ ...caption1Strong, color: 'var(--yellow-800)' }}>Unmapped groups</span>
            <span style={{ ...caption1, color: 'var(--warning-fg)', textWrap: 'pretty' }}>
              3 position names in this file are not mapped to a group, so their {UNMAPPED_TOTAL} is
              not included above.
            </span>
            {s.unmappedRowsOpen && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--size-20)',
                  marginTop: 'var(--size-40)',
                }}
              >
                {UNMAPPED_ROWS.map((u) => (
                  <div
                    key={u.group}
                    style={{ display: 'flex', gap: 'var(--size-120)', ...caption1, color: 'var(--warning-fg)' }}
                  >
                    <span style={{ width: 120 }}>{u.group}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{u.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span
            onClick={() => s.setUnmappedRowsOpen(!s.unmappedRowsOpen)}
            style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {s.unmappedRowsOpen ? 'Hide rows' : 'View rows'}
          </span>
        </div>
      )}
    </div>
  )
}

export function UploadTab({ s }) {
  // Tab B needs a locked calendar — upload is keyed to a calendar period, never
  // to free dates.
  if (!s.dataYear) {
    return (
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--size-100)',
          padding: 'var(--size-320)',
        }}
      >
        <span style={{ ...body1Strong }}>Lock the payroll calendar first</span>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
          You can only upload payroll against locked pay periods, and no year is locked yet.
        </span>
        <Button
          tone="primary"
          onClick={() => s.setTab('cal')}
          style={{ height: 40, padding: '0 var(--size-200)', borderRadius: 'var(--radius-large)' }}
        >
          Go to Calendar
        </Button>
      </div>
    )
  }

  const canPost =
    (s.periodStatus === 'uploaded' || s.periodStatus === 'needs-re-upload') && !!s.figures
  const disabled = s.periodStatus === 'posted'

  return (
    <>
      {!s.manualOpen && (
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <UploadZone s={s} />
          <span
            onClick={() => !disabled && s.setManualOpen(true)}
            title={disabled ? 'This period is posted. Revert it first.' : ''}
            style={{
              alignSelf: 'flex-start',
              ...caption1,
              color: disabled ? 'var(--text-disabled)' : 'var(--text-link)',
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            Enter figures manually →
          </span>
        </div>
      )}

      {s.manualOpen && <ManualEntry s={s} />}

      {s.figures && !s.manualOpen && (
        <>
          <FiguresTable s={s} />
          <div
            style={{
              ...card,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-160)',
              padding: 'var(--size-120) var(--size-160)',
            }}
          >
            <span style={{ ...eyebrow, color: 'var(--text-label)' }}>Post to Profitability</span>
            {s.periodStatus === 'posted' && s.periodState.by && (
              <span style={{ ...caption1, color: 'var(--success-fg)' }}>
                Posted by {s.periodState.by} on {s.periodState.on}
              </span>
            )}
            <div style={{ flex: 1 }} />
            {canPost && (
              <Button tone="primary" onClick={() => s.setDialog('post')}>
                Post payroll
              </Button>
            )}
            {s.periodStatus === 'posted' && (
              <Button
                onClick={() => {
                  s.setReasonVal('')
                  s.setDialog('revert')
                }}
              >
                Revert to uploaded
              </Button>
            )}
          </div>
        </>
      )}

      {!s.figures && s.periodStatus === 'empty' && s.periodRow && s.periodRow.end >= TODAY && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-240)',
          }}
        >
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
            Every closed pay period is posted. P{s.periodRow.n} is still open until{' '}
            {fmtRange(s.periodRow.start, s.periodRow.end, s.dataYear).split('–').pop().trim()}.
          </span>
        </div>
      )}
    </>
  )
}
