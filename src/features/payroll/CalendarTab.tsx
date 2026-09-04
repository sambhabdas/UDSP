import type { CSSProperties } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { Button, IconButton, StatusPill } from '../../ds/components/Button'
import { Field, Menu, MenuItem } from '../../ds/components/Overlay'
import { useHover } from '../../ds/useHover'
import { body1, body1Strong, caption1, caption1Strong, caption2Strong } from '../../ds/type'
import { fmtD, fmtRange, fromIso, iso, periodWeeks, weekOf } from './calendar'
import { CAL_FILTERS, STATUS_NAME, STATUS_TONE, TODAY } from './data'
import { tableMin, tableScroll } from './table'
import type { PeriodRow as Row } from './calendar'
import type { PeriodState } from './data'
import type { PayrollState, SortKey } from './usePayrollSetup'

const headerCell: CSSProperties = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

const card: CSSProperties = {
  flexShrink: 0,
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-medium)',
}

const inlineInput: CSSProperties = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-family)',
  color: 'var(--text-primary)',
  padding: 0,
}

const banner = (tone: 'warning' | 'danger' | 'info'): CSSProperties => ({
  boxSizing: 'border-box',
  padding: 'var(--size-80) var(--size-120)',
  background: `var(--${tone}-bg)`,
  border: `1px solid var(--${tone}-border)`,
  borderRadius: 'var(--radius-medium)',
  ...caption1,
  color: `var(--${tone}-fg)`,
  textWrap: 'pretty',
})

// Sortable column header - the glyph shows direction only on the active column.
function SortHeader({
  label,
  sortKey,
  sort,
  setSort,
  style,
  title,
}: {
  label: string
  sortKey: PayrollState['sort']['key']
  sort: PayrollState['sort']
  setSort: PayrollState['setSort']
  style?: CSSProperties
  title?: string
}) {
  const [hover, hoverProps] = useHover()
  const active = sort.key === sortKey
  return (
    <div
      onClick={() =>
        setSort((s) => ({
          key: sortKey,
          dir: s.key === sortKey && s.dir === 'asc' ? 'desc' : 'asc',
        }))
      }
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-40)',
        cursor: 'pointer',
        userSelect: 'none',
        color: active || hover ? 'var(--text-primary)' : 'var(--text-secondary)',
        ...style,
      }}
      {...hoverProps}
    >
      {label}
      <span style={{ display: 'flex' }}>
        <Icon
          name={active ? (sort.dir === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'}
          size={12}
          color={active ? 'currentColor' : 'var(--text-disabled)'}
        />
      </span>
    </div>
  )
}

function PeriodRow({
  row,
  state,
  isPreview,
  edit,
  setEdit,
  commitEdit,
  onOpen,
}: {
  row: Row
  state: PeriodState | null
  isPreview: boolean
  edit: PayrollState['edit']
  setEdit: PayrollState['setEdit']
  commitEdit: (row: Row) => void
  onOpen: () => void
}) {
  const [hover, hoverProps] = useHover()
  const editing = edit.row === row.n
  const isCurrent = row.start <= TODAY && row.end >= TODAY
  const openState = row.end < TODAY ? 'Closed' : isCurrent ? 'Current' : 'Open'

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
        ...caption1,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div style={{ width: 28, flexShrink: 0 }}>{row.n}</div>
      <div style={{ flex: 1.4, minWidth: 150 }}>
        {state ? (
          <WeeksLink label={periodWeeks(row.start)} title={`Open P${row.n} on the Upload tab`} onClick={onOpen} />
        ) : (
          periodWeeks(row.start)
        )}
      </div>
      <div
        style={{
          flex: 1.2,
          minWidth: 130,
          color: 'var(--text-secondary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {fmtRange(row.start, row.end, row.start.getFullYear())}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 120,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {editing ? (
          <>
            <Field small>
              <input
                type="date"
                value={edit.val}
                onChange={(e) => setEdit((s) => ({ ...s, val: e.target.value }))}
                style={{ ...inlineInput, ...caption1 }}
              />
            </Field>
            <IconButton title="Apply pay date" color="var(--primary)" onClick={() => commitEdit(row)}>
              <Icon name="FnCheck" size={14} />
            </IconButton>
            <IconButton title="Cancel" onClick={() => setEdit({ row: null, val: '', error: '' })}>
              <Icon name="FnDismiss" size={14} />
            </IconButton>
          </>
        ) : (
          <>
            {fmtD(row.pay, row.pay.getFullYear() !== row.start.getFullYear())}
            {row.overridden && (
              <span
                title="This pay date was edited by hand."
                style={{ ...caption1, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}
              >
                · edited
              </span>
            )}
            {isPreview && (
              <IconButton
                title="Edit this pay date. Only possible before locking."
                onClick={() => setEdit({ row: row.n, val: iso(row.pay), error: '' })}
              >
                <Icon name="FnEdit" size={12} />
              </IconButton>
            )}
          </>
        )}
      </div>
      <div
        style={{
          width: 150,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-40)',
        }}
      >
        {state ? (
          <StatusPill tone={STATUS_TONE[state.status]} title={state.info || ''}>
            {state.status === 'empty' ? 'Not started' : STATUS_NAME[state.status]}
          </StatusPill>
        ) : (
          <span
            style={{
              color:
                openState === 'Current'
                  ? 'var(--blue-700)'
                  : openState === 'Closed'
                    ? 'var(--text-helper)'
                    : 'var(--text-secondary)',
            }}
          >
            {openState}
          </span>
        )}
      </div>
    </div>
  )
}

function WeeksLink({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      onClick={onClick}
      title={title}
      style={{ cursor: 'pointer', textDecoration: hover ? 'underline' : 'none' }}
      {...hoverProps}
    >
      {label}
    </span>
  )
}

export function CalendarTab({ s }: { s: PayrollState }) {
  const { rows, isLocked, isPreview, draft, year, form, setForm, edit, setEdit, sort } = s

  const seedD = form.seedVal ? fromIso(form.seedVal) : null
  const seedValid = !!(seedD && seedD.getDay() === 0)
  const payD = form.payVal ? fromIso(form.payVal) : null
  const genReady = seedValid && !!payD
  const seedWeek = seedValid ? weekOf(seedD) : null

  const statusOf = (r: Row): PeriodState => s.periodStates[r.n] ?? { status: 'empty' }
  const calName = (n: PeriodState['status']) => (n === 'empty' ? 'Not started' : STATUS_NAME[n])

  let source = rows || []
  if (isLocked && s.calFilter !== 'All') {
    source = source.filter((r) => calName(statusOf(r).status) === s.calFilter)
  }
  const statusRank = (r: Row): number =>
    isLocked
      ? { posted: 0, uploaded: 1, 'needs-re-upload': 2, empty: 3 }[statusOf(r).status]
      : r.end < TODAY
        ? 0
        : r.start <= TODAY
          ? 1
          : 2
  const keyFns: Record<SortKey, (r: Row) => number> = {
    n: (r) => r.n,
    weeks: (r) => r.start.getTime(),
    range: (r) => r.start.getTime(),
    pay: (r) => r.pay.getTime(),
    status: statusRank,
  }
  const kf = keyFns[sort.key] || keyFns.n
  source = source
    .slice()
    .sort((a, b) => {
      const d = kf(a) - kf(b)
      return (sort.dir === 'desc' ? -d : d) || a.n - b.n
    })

  // A calendar seeded after W1 leaves the weeks before it in no calendar at all.
  const frontGap = (() => {
    if (!rows || isLocked) return ''
    const w = weekOf(rows[0].start)
    if (w.n > 1 && !s.lockedYears.includes(Number(year) - 1)) {
      return `W1-W${w.n - 1} · ${w.y} are not in any payroll calendar. Set up ${Number(year) - 1} to cover them.`
    }
    return ''
  })()

  return (
    <>
      {isLocked && (
        <div
          style={{
            ...card,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-100)',
            padding: 'var(--size-100) var(--size-160)',
          }}
        >
          <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
            <Icon name="FnLock" size={14} />
          </span>
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
            Locked on {s.yearState.lockedOn} by {s.yearState.lockedBy}. Only an Owner or Sub Admin
            can unlock it.
          </span>
          <div style={{ flex: 1 }} />
          <span
            title="Read-only. Invoice Validation, Profitability and Timecards all use this calendar."
            style={{ display: 'flex', color: 'var(--text-helper)', cursor: 'help' }}
          >
            <Icon name="FnInfo" size={14} />
          </span>
          <Button small onClick={() => s.setDialog('unlock')}>
            <Icon name="FnLockOpen" size={14} color="var(--text-secondary)" />
            Unlock year
          </Button>
        </div>
      )}

      {!isLocked && !draft && (
        <div
          style={{
            ...card,
            padding: 'var(--size-160)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--size-120)',
          }}
        >
          <span style={{ ...body1Strong }}>Set up {year}</span>
          <div
            style={{
              display: 'flex',
              gap: 'var(--size-120)',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
              <span style={{ ...caption1Strong, color: 'var(--text-primary)' }}>
                First week of payroll #1
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
                <Field>
                  <input
                    type="date"
                    value={form.seedVal}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, seedVal: e.target.value, error: '', warning: '' }))
                    }
                    style={{ ...inlineInput, ...body1 }}
                  />
                </Field>
                {seedD && (
                  <StatusPill
                    tone={
                      seedValid
                        ? ['var(--info-bg)', 'var(--info-border)', 'var(--info-fg)', 'var(--info-accent)']
                        : ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger-fg)', 'var(--danger-accent)']
                    }
                  >
                    {seedWeek ? `W${seedWeek.n} · ${seedWeek.y}` : 'Not a Sunday'}
                  </StatusPill>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
              <span style={{ ...caption1Strong, color: 'var(--text-primary)' }}>
                Pay date of payroll #1
              </span>
              <Field>
                <input
                  type="date"
                  value={form.payVal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, payVal: e.target.value, error: '', warning: '' }))
                  }
                  style={{ ...inlineInput, ...body1 }}
                />
              </Field>
            </div>
            <Button tone="primary" disabled={!genReady} onClick={s.generate}>
              Generate calendar
            </Button>
          </div>
          {form.error && <div style={banner('danger')}>{form.error}</div>}
          {form.warning && <div style={banner('warning')}>{form.warning}</div>}
        </div>
      )}

      {rows && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-100)',
              padding: 'var(--size-100) var(--size-160)',
            }}
          >
            <span style={{ ...body1Strong }}>
              {isLocked ? 'Payroll calendar · 26 payrolls' : 'Draft payroll calendar · 26 payrolls'}
            </span>
            <span style={{ ...caption1, color: 'var(--text-helper)' }}>
              {isLocked
                ? ''
                : draft.fromUnlock
                  ? `Unlocked for editing. Originally locked by ${draft.by} on ${draft.on}${draft.dirty ? ', edited since.' : ', not edited yet.'}`
                  : `Generated by ${draft.by} on ${draft.on}`}
            </span>
            <div style={{ flex: 1 }} />
            {isLocked && <CalFilter s={s} rows={rows} calName={calName} statusOf={statusOf} />}
            {isPreview && (
              <Button small onClick={() => s.setDialog('discard')}>
                Discard draft
              </Button>
            )}
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
            <SortHeader label="#" sortKey="n" sort={sort} setSort={s.setSort} title="Sort by period" style={{ width: 28, flexShrink: 0 }} />
            <SortHeader label="Weeks included" sortKey="weeks" sort={sort} setSort={s.setSort} title="Sort by weeks" style={{ flex: 1.4, minWidth: 150 }} />
            <SortHeader label="Date range" sortKey="range" sort={sort} setSort={s.setSort} title="Sort by date range" style={{ flex: 1.2, minWidth: 130 }} />
            <SortHeader label="Pay date" sortKey="pay" sort={sort} setSort={s.setSort} title="Sort by pay date" style={{ flex: 1, minWidth: 120 }} />
            <SortHeader label="Status" sortKey="status" sort={sort} setSort={s.setSort} title="Sort by status" style={{ width: 150, flexShrink: 0 }} />
          </div>

          {source.map((r) => (
            <PeriodRow
              key={r.n}
              row={r}
              state={isLocked ? statusOf(r) : null}
              isPreview={isPreview}
              edit={edit}
              setEdit={setEdit}
              commitEdit={s.commitEdit}
              onOpen={() => s.openPeriodFromCalendar(r.n)}
            />
          ))}
          </div>
          </div>

          {edit.error && (
            <div style={{ ...banner('danger'), margin: 'var(--size-100) var(--size-160)' }}>
              {edit.error}
            </div>
          )}
          {frontGap && (
            <div style={{ ...banner('warning'), margin: 'var(--size-100) var(--size-160)' }}>
              {frontGap}
            </div>
          )}
        </div>
      )}

      {isPreview && (
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-160)',
            padding: 'var(--size-120) var(--size-160)',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-medium)',
          }}
        >
          <span style={{ flex: 1, minWidth: 0, ...caption1, color: 'var(--warning-fg)', textWrap: 'pretty' }}>
            {draft.fromUnlock && !draft.dirty
              ? 'You have not changed anything yet. Edits take effect only when you lock the calendar again.'
              : 'Once locked, the calendar cannot be edited. Unlocking it later changes nothing on its own.'}
          </span>
          <Button tone="danger" onClick={() => s.setDialog('lock')}>
            {draft.fromUnlock && !draft.dirty ? 'Re-lock' : 'Confirm & lock'}
          </Button>
        </div>
      )}

      {!isLocked && !draft && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--size-80)',
            padding: 'var(--size-320)',
          }}
        >
          <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
            {year === 2025
              ? '2025 has no calendar yet. Set one up to cover the weeks before 2026.'
              : 'No calendar yet. Choose the first week and the pay date of payroll #1, then generate.'}
          </span>
        </div>
      )}
    </>
  )
}

function CalFilter({
  s,
  rows,
  calName,
  statusOf,
}: {
  s: PayrollState
  rows: Row[]
  calName: (status: PeriodState['status']) => string
  statusOf: (r: Row) => PeriodState
}) {
  const [hover, hoverProps] = useHover()
  const applied = s.calFilter !== 'All'
  const count = (f: string) => rows.filter((r) => calName(statusOf(r).status) === f).length
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        onClick={(e) => {
          e.stopPropagation()
          s.openMenu('calFilterOpen')
        }}
        style={{
          boxSizing: 'border-box',
          height: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-80)',
          borderRadius: 'var(--radius-small)',
          background: applied
            ? 'var(--blue-100)'
            : hover || s.menus.calFilterOpen
              ? 'var(--surface-subtle)'
              : 'var(--surface-card)',
          border: `1px solid ${applied ? 'var(--blue-200)' : 'var(--border-default)'}`,
          ...(applied ? caption1Strong : caption1),
          color: applied ? 'var(--blue-700)' : 'var(--text-primary)',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'background var(--motion-hover), border-color var(--motion-hover)',
        }}
        {...hoverProps}
      >
        {applied ? `${s.calFilter} · ${count(s.calFilter)}` : 'Status'}
        {applied ? (
          <span
            onClick={(e) => {
              e.stopPropagation()
              s.closeMenus()
              s.setCalFilter('All')
            }}
            role="button"
            aria-label="Remove filter"
            style={{ display: 'inline-flex', marginLeft: 2, opacity: 0.7, fontSize: 12 }}
          >
            ×
          </span>
        ) : (
          <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
            <Icon name="SvChevron" size={12} />
          </span>
        )}
      </div>
      {s.menus.calFilterOpen && (
        <Menu top={32} minWidth={170}>
          {CAL_FILTERS.map((f) => (
            <MenuItem
              key={f}
              selected={s.calFilter === f}
              onClick={(e) => {
                e.stopPropagation()
                s.closeMenus()
                s.setCalFilter(f)
              }}
              trailing={
                f === 'All' ? null : (
                  <span style={{ ...caption2Strong, color: 'var(--text-helper)' }}>{count(f)}</span>
                )
              }
            >
              {f}
            </MenuItem>
          ))}
        </Menu>
      )}
    </span>
  )
}
