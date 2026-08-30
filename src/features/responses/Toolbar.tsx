'use client'

import { caption2 } from '../../ds/type'
import { ComboBox, DropTrigger, IconButton, Menu, MenuRow, Tick } from './parts'
import { RANGES, SURVEYS } from './data'
import type { RespState } from './useResponses'

/**
 * The sticky toolbar: which survey, over what window, for whom.
 *
 * The driver picker only exists on a named survey — an anonymous one has no
 * driver on any answer, so there is nothing to filter by.
 */
export function Toolbar({ s }: { s: RespState }) {
  return (
    <div
      data-rsp-page=""
      data-rsp-wrap=""
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-toolbar-gap)',
        padding: 'var(--size-160) var(--size-200)',
        background: 'var(--surface-page)',
        boxShadow: 'var(--shadow-2)',
      }}
    >
      <SurveyPicker s={s} />
      <RangePicker s={s} />
      {s.range === 'Custom' && <CustomRange s={s} />}
      {s.s.named && <DriverPicker s={s} />}
      <IconButton
        name="FnFilter"
        title="Filters"
        onClick={() => { s.closeFloating(); s.setFpQuery(''); s.setFpDraft(s.qFilter); s.setFpOpen(true) }}
        bg={s.applied ? 'var(--blue-100)' : 'transparent'}
        hoverBg={s.applied ? 'var(--blue-100)' : 'var(--surface-subtle)'}
        color={s.applied ? 'var(--blue-700)' : 'var(--text-secondary)'}
      />
      <div style={{ flex: 1 }} />
      <ExportMenu s={s} />
    </div>
  )
}

function SurveyPicker({ s }: { s: RespState }) {
  const open = s.drop === 'survey'
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <ComboBox
        strong
        width={240}
        value={s.surveyQuery}
        placeholder={s.s.name}
        onChange={(v) => { s.setSurveyQuery(v); s.setDrop('survey') }}
        onOpen={(e) => { e.stopPropagation(); s.setDrop('survey'); s.setMenuFor(null) }}
      />
      {open && (
        <Menu width={240}>
          {Object.keys(SURVEYS)
            .filter((k) => SURVEYS[k].name.toLowerCase().includes(s.surveyQuery.toLowerCase()))
            .map((k) => (
              <MenuRow key={k} height={32} padding="var(--size-100)" selected={k === s.survey} onClick={(e) => { e.stopPropagation(); s.pickSurvey(k) }}>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {SURVEYS[k].name}
                </span>
                <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>{SURVEYS[k].meta}</span>
              </MenuRow>
            ))}
        </Menu>
      )}
    </span>
  )
}

function RangePicker({ s }: { s: RespState }) {
  const open = s.drop === 'range'
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <DropTrigger width={132} onClick={(e) => { e.stopPropagation(); s.setDrop(open ? null : 'range'); s.setMenuFor(null) }}>
        {s.range}
      </DropTrigger>
      {open && (
        <Menu width={132}>
          {RANGES.map((r) => (
            <MenuRow key={r} small selected={s.range === r} onClick={(e) => { e.stopPropagation(); s.setRange(r); s.setDrop(null) }}>
              {r}
            </MenuRow>
          ))}
        </Menu>
      )}
    </span>
  )
}

function CustomRange({ s }: { s: RespState }) {
  const style = {
    boxSizing: 'border-box' as const,
    width: 150,
    height: 'var(--control-height)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-medium)',
    padding: '0 var(--size-100)',
    fontSize: 'var(--body-1-size)',
    fontFamily: 'var(--font-family)',
    color: 'var(--text-primary)',
    background: 'var(--surface-card)',
  }
  return (
    <>
      <input type="date" value={s.rangeFrom} onChange={(e) => s.setRangeFrom(e.target.value)} style={style} />
      <input type="date" value={s.rangeTo} onChange={(e) => s.setRangeTo(e.target.value)} style={style} />
    </>
  )
}

function DriverPicker({ s }: { s: RespState }) {
  const open = s.drop === 'drivers'
  const picked = s.pickedDrivers
  const q = s.driverQuery.toLowerCase()
  // Whoever is already picked floats to the top, so a long list stays useful.
  const names = s.allDrivers
    .filter((n) => !q || n.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => (picked.includes(a) ? 0 : 1) - (picked.includes(b) ? 0 : 1) || a.localeCompare(b))

  const placeholder = open
    ? 'Search drivers'
    : !picked.length ? 'All drivers' : picked.length === 1 ? picked[0] : `${picked.length} drivers`

  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <ComboBox
        width={180}
        value={s.driverQuery}
        placeholder={placeholder}
        onChange={(v) => { s.setDriverQuery(v); s.setDrop('drivers') }}
        onOpen={(e) => { e.stopPropagation(); s.setDrop('drivers'); s.setMenuFor(null) }}
      />
      {open && (
        <Menu width={200} maxHeight={240}>
          {!q && (
            <MenuRow small onClick={(e) => { e.stopPropagation(); s.setPickedDrivers([]) }}>
              <Tick on={!picked.length} />
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>All drivers</span>
            </MenuRow>
          )}
          {names.map((n) => (
            <MenuRow key={n} small onClick={(e) => { e.stopPropagation(); s.toggleDriver(n) }}>
              <Tick on={picked.includes(n)} />
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</span>
            </MenuRow>
          ))}
        </Menu>
      )}
    </span>
  )
}

function ExportMenu({ s }: { s: RespState }) {
  const open = s.drop === 'export'
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <DropTrigger width={104} strong onClick={(e) => { e.stopPropagation(); s.setDrop(open ? null : 'export'); s.setMenuFor(null) }}>
        Export
      </DropTrigger>
      {open && (
        <Menu width={104} align="right">
          {(['CSV', 'XLSX'] as const).map((fmt) => (
            <MenuRow
              key={fmt}
              small
              onClick={(e) => {
                e.stopPropagation()
                s.setDrop(null)
                s.toastMsg(`Export started · ${s.s.name} (${fmt.toLowerCase()})`)
              }}
            >
              {fmt}
            </MenuRow>
          ))}
        </Menu>
      )}
    </span>
  )
}
