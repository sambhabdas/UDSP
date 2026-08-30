'use client'

import type { PeriodRow as Row } from './calendar'
import type { PeriodState } from './data'
import type { PayrollState } from './usePayrollSetup'
import { useEffect, useRef } from 'react'
import { Icon } from '../../ds/icons/Icon'
import { IconButton, StatusPill } from '../../ds/components/Button'
import { Field, Menu, MenuItem, Toast } from '../../ds/components/Overlay'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption2Strong } from '../../ds/type'
import { fmtD, fmtRange, periodWeeks } from './calendar'
import { STATUS_NAME, STATUS_TONE, YEARS } from './data'
import { usePayrollSetup } from './usePayrollSetup'
import { CalendarTab } from './CalendarTab'
import { UploadTab } from './UploadTab'
import { PayrollDialogs } from './PayrollDialogs'

const TABS: [PayrollState['tab'], string][] = [
  ['cal', 'Calendar'],
  ['data', 'Upload'],
]

function Tab({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-40)',
        cursor: 'pointer',
        paddingBottom: 'var(--size-40)',
      }}
    >
      <span
        style={{
          ...body1,
          fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
          color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
      {selected && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--primary)',
          }}
        />
      )}
    </div>
  )
}

function YearPicker({ s }: { s: PayrollState }) {
  const [hover, hoverProps] = useHover()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        onClick={(e) => {
          e.stopPropagation()
          s.openMenu('yearsOpen')
        }}
        style={{
          boxSizing: 'border-box',
          height: 'var(--control-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)',
          background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          ...body1,
          cursor: 'pointer',
          transition: 'background var(--motion-hover)',
        }}
        {...hoverProps}
      >
        {s.year}
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={16} />
        </span>
      </div>
      {s.menus.yearsOpen && (
        <Menu minWidth={220}>
          {YEARS.map((y) => (
            <MenuItem
              key={y}
              selected={y === s.year}
              onClick={(e) => {
                e.stopPropagation()
                s.closeMenus()
                s.setYear(y)
                s.setForm({ seedVal: '', payVal: '', error: '', warning: '' })
                s.setEdit({ row: null, val: '', error: '' })
              }}
              trailing={
                <span style={{ ...caption2Strong, color: 'var(--text-helper)' }}>
                  {s.years[y].status === 'locked'
                    ? 'Locked · read-only'
                    : y === 2025
                      ? 'Previous year'
                      : y === 2027
                        ? 'Next year'
                        : 'Unlocked'}
                </span>
              }
            >
              {y}
            </MenuItem>
          ))}
        </Menu>
      )}
    </span>
  )
}

function PeriodPicker({ s }: { s: PayrollState }) {
  const [hover, hoverProps] = useHover()
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Open on the selected period, centred, with the search field focused.
  useEffect(() => {
    if (!s.menus.periodsOpen) return
    const el = menuRef.current
    if (el) {
      const sel = el.querySelector<HTMLElement>('[data-selected="true"]')
      if (sel) el.scrollTop = Math.max(0, sel.offsetTop - el.clientHeight / 2 + sel.offsetHeight / 2)
    }
    if (searchRef.current) searchRef.current.focus()
  }, [s.menus.periodsOpen])

  const q = s.periodQuery.trim().toLowerCase()
  const matches = s.dataRows.filter((r) => {
    if (!q) return true
    const st = s.periodStates[r.n] || { status: 'empty' }
    return (
      `p${r.n} ${periodWeeks(r.start)} ${fmtRange(r.start, r.end, s.dataYear)} ${fmtD(r.pay)} ${STATUS_NAME[st.status]}`
        .toLowerCase()
        .indexOf(q) !== -1
    )
  })

  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        onClick={(e) => {
          e.stopPropagation()
          s.setPeriodQuery('')
          s.openMenu('periodsOpen')
        }}
        style={{
          boxSizing: 'border-box',
          height: 'var(--control-height)',
          width: 'min(400px, 46vw)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-80)',
          padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)',
          background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
          border: `1px solid ${s.menus.periodsOpen ? 'var(--border-focus)' : 'var(--border-default)'}`,
          ...body1,
          cursor: 'pointer',
          transition: 'background var(--motion-hover), border-color var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {s.periodRow
            ? `Pay period: P${s.periodRow.n} · ${periodWeeks(s.periodRow.start)}`
            : 'Pick a period'}
        </span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={16} />
        </span>
      </div>

      {s.menus.periodsOpen && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            right: 0,
            boxSizing: 'border-box',
            width: 'min(400px, 92vw)',
            maxHeight: 420,
            overflow: 'hidden',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              flexShrink: 0,
              boxSizing: 'border-box',
              padding: 'var(--size-40)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <Field style={{ background: 'var(--surface-page)' }}>
              <Icon name="SearchGlyph" size={16} color="var(--text-disabled)" />
              <input
                ref={searchRef}
                value={s.periodQuery}
                onChange={(e) => s.setPeriodQuery(e.target.value)}
                placeholder="Search…"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-family)',
                  ...caption1,
                  color: 'var(--text-primary)',
                  padding: 0,
                }}
              />
            </Field>
          </div>
          <div
            ref={menuRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden auto',
              boxSizing: 'border-box',
              padding: 'var(--size-40)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-20)',
            }}
          >
            {matches.map((r) => {
              const st = s.periodStates[r.n] || { status: 'empty' }
              const selected = r.n === s.activePeriod
              return (
                <PeriodOption
                  key={r.n}
                  row={r}
                  state={st}
                  selected={selected}
                  dataYear={s.dataYear}
                  onPick={() => {
                    s.closeMenus()
                    s.setPeriod(r.n)
                    s.setManualOpen(false)
                    s.setUnmappedRowsOpen(false)
                    s.setPeriodQuery('')
                  }}
                />
              )
            })}
            {matches.length === 0 && (
              <div
                style={{
                  boxSizing: 'border-box',
                  padding: 'var(--size-120)',
                  ...caption1,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                }}
              >
                No pay periods match
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  )
}

function PeriodOption({
  row,
  state,
  selected,
  dataYear,
  onPick,
}: {
  row: Row
  state: PeriodState
  selected: boolean
  dataYear: number | null
  onPick: () => void
}) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      data-selected={selected ? 'true' : 'false'}
      style={{
        boxSizing: 'border-box',
        height: 'var(--row-height)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-80)',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: selected
          ? 'var(--primary-soft)'
          : hover
            ? 'var(--surface-subtle)'
            : 'transparent',
        color: selected ? 'var(--primary-hover)' : 'var(--text-primary)',
        ...body1,
        fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex' }}>
        {selected && <Icon name="FnCheck" size={16} />}
      </span>
      <span style={{ fontWeight: 'var(--weight-semibold)' }}>P{row.n}</span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          ...caption1,
          color: 'var(--text-secondary)',
        }}
      >
        {periodWeeks(row.start)} · {fmtRange(row.start, row.end, dataYear)}
      </span>
      <span style={{ ...caption2Strong, color: STATUS_TONE[state.status][2] }}>
        {STATUS_NAME[state.status]}
      </span>
    </div>
  )
}

export function PayrollSetupPage() {
  const s = usePayrollSetup()
  const isCal = s.tab === 'cal'

  return (
    <div
      data-screen-label="Payroll Setup"
      onClick={s.closeMenus}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-160)',
        padding: 'var(--size-200)',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden auto',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-200)',
          flexWrap: 'wrap',
          rowGap: 'var(--size-80)',
        }}
      >
        {TABS.map(([id, label]) => (
          <Tab
            key={id}
            label={label}
            selected={s.tab === id}
            onClick={() => {
              s.closeMenus()
              s.setTab(id)
            }}
          />
        ))}
        <div style={{ flex: 1 }} />

        {isCal && (
          <>
            <YearPicker s={s} />
            <StatusPill
              tone={
                s.isLocked
                  ? ['var(--info-bg)', 'var(--info-border)', 'var(--info-fg)', 'var(--info-accent)']
                  : ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning-fg)', 'var(--warning-accent)']
              }
            >
              <span style={{ display: 'flex' }}>
                <Icon name={s.isLocked ? 'FnLock' : 'FnLockOpen'} size={14} />
              </span>
              {s.isLocked ? 'Locked' : 'Unlocked'}
            </StatusPill>
            {s.isLocked && (
              <span style={{ position: 'relative', display: 'flex' }}>
                <IconButton
                  size={28}
                  title="Year actions"
                  onClick={(e) => {
                    e.stopPropagation()
                    s.openMenu('yearMenuOpen')
                  }}
                >
                  <Icon name="SvMore" size={16} />
                </IconButton>
                {s.menus.yearMenuOpen && (
                  <Menu top={32} minWidth={170} elevation="callout">
                    <MenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        s.closeMenus()
                        s.setTypedVal('')
                        s.setReasonVal('')
                        s.setDialog('unlock')
                      }}
                    >
                      <Icon name="FnLockOpen" size={14} color="var(--text-secondary)" />
                      Unlock year
                    </MenuItem>
                  </Menu>
                )}
              </span>
            )}
          </>
        )}

        {!isCal && s.dataYear && (
          <>
            <PeriodPicker s={s} />
            <StatusPill tone={STATUS_TONE[s.periodStatus]}>
              {STATUS_NAME[s.periodStatus]}
            </StatusPill>
          </>
        )}
      </div>

      {isCal ? <CalendarTab s={s} /> : <UploadTab s={s} />}

      <PayrollDialogs s={s} />
      {s.toastText && <Toast>{s.toastText}</Toast>}
    </div>
  )
}
