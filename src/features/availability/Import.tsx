'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { caption1, caption1Strong } from '../../ds/type'
import {
  AVAIL_PREVIEW, AVAIL_PREVIEW_HEAD, SCHED_PREVIEW, SCHED_PREVIEW_HEAD,
  STEPS, WRITE_MODES, stateColor,
} from './data'
import { Button, Card, CardTitle, Chip, IconButton, PickerField } from './parts'
import { FIELD_LABEL, ISSUE_COLS, LABEL, MAP_COLS, NUM, PV_COLS } from './style'
import type { AvailabilityState, Mapping } from './useAvailability'

/** The five-step importer: a step rail, then whichever step is open. */
export function Import({ s }: { s: AvailabilityState }) {
  return (
    <div
      data-rsp-page=""
      style={{ boxSizing: 'border-box', flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-160) var(--size-200) var(--size-480) var(--size-200)' }}
    >
      <div data-rsp-minw0="" data-rsp-rail="" style={{ minWidth: 1020, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--size-120)', alignItems: 'start' }}>
        <StepRail s={s} />
        <Card>
          <StepHeader s={s} />
          {s.step === 1 && <ChooseSource s={s} />}
          {s.step === 2 && <UploadFile s={s} />}
          {s.step === 3 && <MapColumns s={s} />}
          {s.step === 4 && <ValueMap s={s} />}
          {s.step === 5 && <Review s={s} />}
          <Footer s={s} />
        </Card>
      </div>
    </div>
  )
}

function StepRail({ s }: { s: AvailabilityState }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--size-160)' }}>
        <CardTitle>Import</CardTitle>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--size-120) var(--size-160) var(--size-160) var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = n < s.step
          const on = n === s.step
          const last = n === STEPS.length
          return (
            <div
              key={label}
              data-fx=""
              tabIndex={0}
              role="button"
              onClick={() => { s.setStep(n); s.closeMenu() }}
              onMouseDown={(e) => e.preventDefault()}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--size-100)', cursor: 'pointer', borderRadius: 'var(--radius-small)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <span
                  style={{
                    boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: 'var(--radius-circle)',
                    background: done ? 'var(--success-bg)' : on ? 'var(--primary)' : 'var(--surface-card)',
                    border: `1px solid ${done ? 'var(--success-bg)' : on ? 'var(--primary)' : 'var(--border-default)'}`,
                    color: done ? 'var(--success-fg)' : on ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    ...caption1Strong,
                  }}
                >
                  {done ? '✓' : n}
                </span>
                <span style={{ width: 1, height: last ? 0 : 20, background: done ? 'var(--success-accent)' : 'var(--border-default)' }} />
              </div>
              <span style={{ paddingTop: 2, paddingBottom: last ? 0 : 'var(--size-160)', ...caption1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on || done ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function StepHeader({ s }: { s: AvailabilityState }) {
  const srcBatches = s.batches.filter((b) => b.source === s.importType)
  const everImported = !!s.imported[s.importType] || srcBatches.length > 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-160)' }}>
      <CardTitle>{STEPS[s.step - 1]}</CardTitle>
      <div style={{ flex: 1 }} />
      {everImported && (
        <Chip
          label={s.imported[s.importType] ? 'Imported just now' : `Last imported ${srcBatches[0]?.date ?? ''}`}
          bg="var(--success-bg)"
          fg="var(--success-fg)"
          dot="var(--success-accent)"
        />
      )}
      <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Step {s.step} of 5</span>
    </div>
  )
}

function ChooseSource({ s }: { s: AvailabilityState }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--size-120)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
      {s.allSources.map((name) => <SourceCard key={name} s={s} name={name} />)}
      <Dashed onClick={() => { s.setFDlg('source'); s.setCs(''); s.closeMenu() }}>+ Custom source</Dashed>
    </div>
  )
}

function SourceCard({ s, name }: { s: AvailabilityState; name: string }) {
  const [hover, hoverProps] = useHover()
  const on = s.importType === name
  const custom = s.customSources.includes(name)
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={() => { s.setImportType(name); s.setStep(2); s.closeMenu() }}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        boxSizing: 'border-box', minHeight: 64, display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        padding: 'var(--size-120)', borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : on ? 'var(--primary-soft)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`, cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
        <span style={{ ...caption1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on ? 'var(--blue-700)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </span>
        <Chip
          label={s.imported[name] ? 'Imported' : custom ? 'Custom' : 'Preset saved'}
          bg={s.imported[name] ? 'var(--success-bg)' : custom ? 'var(--surface-subtle)' : 'var(--blue-100)'}
          fg={s.imported[name] ? 'var(--success-fg)' : custom ? 'var(--text-secondary)' : 'var(--blue-700)'}
        />
      </div>
      <IconButton icon="SvMore" size={24} color="var(--primary)" onClick={(e) => s.openMenu(e, 'preset', { source: name })} />
    </div>
  )
}

function Dashed({ children, onClick }: { children: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-medium)', color: 'var(--text-secondary)', ...caption1Strong, cursor: 'pointer', background: hover ? 'var(--surface-subtle)' : undefined }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

function UploadFile({ s }: { s: AvailabilityState }) {
  const head = s.isSchedSrc ? SCHED_PREVIEW_HEAD : AVAIL_PREVIEW_HEAD
  const raw = s.isSchedSrc ? SCHED_PREVIEW : AVAIL_PREVIEW
  const k = s.pvSort.k
  const rows = k === null
    ? raw
    : raw.slice().sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (s.pvSort.d === 'asc' ? 1 : -1))

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-100) var(--size-160)', borderTop: '1px solid var(--border-default)', background: 'var(--surface-subtle)' }}>
        <span style={{ ...caption1Strong, fontFamily: 'var(--font-mono)' }}>
          {s.isSchedSrc ? 'schedule_w30.xlsx' : 'availability_w32.csv'}
        </span>
        <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {s.isSchedSrc ? '41 rows · 5 columns' : '42 rows · 5 columns'}
        </span>
        <div style={{ flex: 1 }} />
        <ReplaceButton onClick={() => s.toastMsg('Pick a new file - the mapping is kept')} />
      </div>

      <div style={{ overflow: 'auto' }}>
        <div style={{ minWidth: 720 }}>
          <div style={{ display: 'grid', gridTemplateColumns: PV_COLS, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)' }}>
            <span style={{ ...LABEL, color: 'var(--text-secondary)' }}>#</span>
            {head.map((c, i) => (
              <div
                key={c}
                data-fx=""
                tabIndex={0}
                role="button"
                onClick={() => s.setPvSort({ k: i, d: k === i && s.pvSort.d === 'asc' ? 'desc' : 'asc' })}
                onMouseDown={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', ...LABEL, color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', borderRadius: 'var(--radius-small)' }}
              >
                <span>{c}</span>
                <span style={{ display: 'flex', color: k === i ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
                  <Icon name={k === i ? (s.pvSort.d === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
                </span>
              </div>
            ))}
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: PV_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 36, padding: 'var(--size-40) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ ...caption1, color: 'var(--text-secondary)', ...NUM }}>{i + 1}</span>
              {r.map((c, ci) => (
                <span key={ci} style={{ ...caption1, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</span>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', minHeight: 36, padding: 'var(--size-40) var(--size-160)' }}>
            <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {s.isSchedSrc ? '36 more rows in the file' : '37 more rows in the file'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function ReplaceButton({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{ boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', padding: '0 var(--size-100)', borderRadius: 'var(--radius-small)', background: hover ? 'var(--primary-hover)' : 'var(--primary)', border: '1px solid var(--primary)', color: 'var(--text-inverse)', ...caption1Strong, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background var(--motion-hover)' }}
      {...hoverProps}
    >
      Replace
    </div>
  )
}

/** Step 3 — which column of the file feeds which field. */
function MapColumns({ s }: { s: AvailabilityState }) {
  const combos: [string, keyof Mapping, string[]][] = s.isSchedSrc
    ? [
      ['Week represented', 'wkRep', ['Jul 19 - 25']],
      ['DA match', 'schDaCol', ['Transporter ID', 'Name']],
      ['Department column', 'deptCol', ['Department', 'Dept code']],
      ['Hours fallback', 'hrsFall', ['10', '8']],
    ]
    : [
      ['DA match', 'daCol', ['Transporter ID', 'EE code', 'Name']],
      ['Date column', 'dayCol', ['Date', 'Day']],
      ['Value column', 'valCol', ['Value', 'State']],
      ['Target week', 'tgtWeek', ['Aug 2 - 8', 'Aug 9 - 15']],
    ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
      {combos.map(([label, key, opts]) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <span style={{ ...FIELD_LABEL, whiteSpace: 'nowrap' }}>{label}</span>
          <PickerField label={s.mapping[key]} onClick={(e) => s.openMenu(e, 'combo', { comboKey: key, comboOpts: opts })} />
        </div>
      ))}
    </div>
  )
}

/** Step 4 — what each file value writes, and which rows count at all. */
function ValueMap({ s }: { s: AvailabilityState }) {
  if (s.isSchedSrc) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
          Schedule imports carry no value map - department codes set each shift’s length.
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ ...FIELD_LABEL, whiteSpace: 'nowrap' }}>Value map</span>
          <div style={{ flex: 1 }} />
          <a href="#" onClick={(e) => { e.preventDefault(); s.setFDlg('mv'); s.setMv({ file: '', std: null }) }} style={{ ...caption1, whiteSpace: 'nowrap' }}>+ Map value</a>
        </div>
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: MAP_COLS, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-120)' }}>
            <span style={{ ...LABEL, color: 'var(--text-secondary)' }}>File value</span>
            <span style={{ ...LABEL, color: 'var(--text-secondary)' }}>Cell state</span>
            <span />
          </div>
          {s.vmap.map(([file, state], i) => (
            <div key={file} style={{ display: 'grid', gridTemplateColumns: MAP_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 'var(--row-height)', padding: 'var(--size-40) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file}</span>
              <span style={{ ...caption1, color: stateColor(state), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{state}</span>
              <IconButton
                icon="DismissSize16ThemeRegular"
                size={24}
                onClick={() => {
                  s.setVmap(s.vmap.filter((_, vi) => vi !== i))
                  s.toastMsg(`${file} unmapped - its rows will skip as unmapped value`)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <span style={FIELD_LABEL}>Write as</span>
          <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
            {WRITE_MODES.map((m) => {
              const on = s.writeMode === m
              return (
                <div
                  key={m}
                  data-fx=""
                  tabIndex={0}
                  role="button"
                  onClick={() => s.setWriteMode(m)}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)', background: on ? 'var(--blue-100)' : 'var(--surface-card)', border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`, color: on ? 'var(--blue-700)' : 'var(--text-secondary)', ...caption1Strong, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {m}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-60)' }}>
          <span style={FIELD_LABEL}>Filters</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', flexWrap: 'wrap', minHeight: 24 }}>
            {s.filters.map((f, i) => (
              <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 24, padding: '0 var(--size-80)', borderRadius: 'var(--radius-small)', background: 'var(--blue-100)', border: '1px solid var(--blue-200)', color: 'var(--blue-700)', ...caption1Strong, whiteSpace: 'nowrap' }}>
                {f}
                <span
                  data-fx=""
                  tabIndex={0}
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    s.setFilters(s.filters.filter((_, fi) => fi !== i))
                    s.toastMsg('Filter removed - every row passes this check now')
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ display: 'flex', cursor: 'pointer' }}
                >
                  <Icon name="DismissSize16ThemeRegular" size={14} />
                </span>
              </span>
            ))}
            <a href="#" onClick={(e) => { e.preventDefault(); s.setFDlg('filter'); s.setFf({ col: 'Value', op: 'Equals', val: '' }) }} style={{ ...caption1, whiteSpace: 'nowrap' }}>+ Add filter</a>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Step 5 — what the run will write, and everything still unanswered. */
function Review({ s }: { s: AvailabilityState }) {
  const tiles = [
    { label: 'Rows in file', value: String(s.review.inFile), color: 'var(--text-primary)' },
    { label: s.isSchedSrc ? 'Shift rows to write' : 'Cells to write', value: String(s.review.created), color: 'var(--success-fg)' },
    { label: 'Rows not imported', value: String(s.review.notImported), color: s.review.notImported ? 'var(--warning-fg)' : 'var(--success-fg)' },
  ]
  const pending = s.review.pending.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--size-120)' }}>
        {tiles.map((t) => (
          <div key={t.label} style={{ boxSizing: 'border-box', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-120) var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
            <span style={{ ...LABEL, color: 'var(--text-helper)' }}>{t.label}</span>
            <span style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>{t.value}</span>
          </div>
        ))}
      </div>

      {s.issues.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
            <span style={{ ...FIELD_LABEL, whiteSpace: 'nowrap' }}>Issues to resolve</span>
            <Chip
              label={pending ? `${pending} pending` : 'All resolved'}
              bg={pending ? 'var(--warning-bg)' : 'var(--success-bg)'}
              fg={pending ? 'var(--warning-fg)' : 'var(--success-fg)'}
            />
            <div style={{ flex: 1 }} />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (!s.review.pending.length) { s.toastMsg('Every issue is resolved'); return }
                const next = { ...s.resolved }
                s.review.pending.forEach((r) => { next[r.id] = 'Skip these rows' })
                s.setResolved(next)
                s.toastMsg(`${s.review.pending.reduce((a, r) => a + r.rows, 0)} rows will be skipped`)
              }}
              style={{ ...caption1, whiteSpace: 'nowrap' }}
            >
              Skip unresolved rows
            </a>
          </div>

          <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: ISSUE_COLS, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)' }}>
              {['Issue', 'Cause', 'Rows', 'Resolution', 'Status'].map((h, i) => (
                <span key={h} style={{ ...LABEL, color: 'var(--text-secondary)', textAlign: i === 2 ? 'right' : undefined }}>{h}</span>
              ))}
            </div>
            {s.issues.map((issue) => <IssueRow key={issue.id} s={s} issue={issue} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function IssueRow({ s, issue }: { s: AvailabilityState; issue: AvailabilityState['issues'][number] }) {
  const v = s.resolved[issue.id] ?? null
  const skipped = v === 'Skip these rows'
  const done = !!v && !skipped
  // A failed filter is the importer doing its job, so it is reported, not fixed.
  const byDesign = issue.kind === 'filter'
  const status = byDesign || skipped ? 'Skipped' : done ? 'Ready' : 'Pending'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: ISSUE_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 44, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minWidth: 0, ...caption1, fontFamily: issue.kind === 'filter' ? 'var(--font-family)' : 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: byDesign ? 'var(--neutral-400)' : done ? 'var(--success-accent)' : 'var(--warning-accent)', flexShrink: 0 }} />
        {issue.value}
      </span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{issue.cause}</span>
      <span style={{ textAlign: 'right', ...caption1, ...NUM }}>{issue.rows}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
        {!byDesign && (
          <PickerField
            flex
            label={v ?? (issue.kind === 'da' ? 'Pick a DA' : 'Map to a state')}
            color={v ? 'var(--text-primary)' : 'var(--text-helper)'}
            bg={done ? 'var(--success-bg)' : 'var(--surface-subtle)'}
            border={done ? 'var(--success-border)' : 'var(--border-default)'}
            onClick={(e) => s.openMenu(e, issue.kind === 'da' ? 'issDa' : 'issStd', { issueId: issue.id })}
          />
        )}
        {byDesign && (
          <a href="#" onClick={(e) => { e.preventDefault(); s.setStep(4); s.toastMsg('Value map - adjust the filters') }} style={{ ...caption1, whiteSpace: 'nowrap' }}>Edit filters</a>
        )}
        {v && (
          <IconButton
            icon="DismissSize16ThemeRegular"
            size={24}
            title="Clear"
            onClick={(e) => {
              e.stopPropagation()
              const next = { ...s.resolved }
              delete next[issue.id]
              s.setResolved(next)
            }}
          />
        )}
      </div>
      <span>
        <Chip
          label={status}
          bg={byDesign || skipped ? 'var(--surface-subtle)' : done ? 'var(--success-bg)' : 'var(--warning-bg)'}
          fg={byDesign || skipped ? 'var(--text-secondary)' : done ? 'var(--success-fg)' : 'var(--warning-fg)'}
          dot={byDesign || skipped ? 'var(--neutral-400)' : done ? 'var(--success-accent)' : 'var(--warning-accent)'}
        />
      </span>
    </div>
  )
}

function Footer({ s }: { s: AvailabilityState }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
      {s.step > 1 && <Button onClick={() => { s.setStep(Math.max(1, s.step - 1)); s.closeMenu() }}>Back</Button>}
      <div style={{ flex: 1 }} />
      {s.step === 5 && (
        <>
          <Button onClick={() => s.toastMsg('Preset saved - next week is one click')}>Save as preset</Button>
          <Button kind="primary" onClick={() => runImport(s)}>Run import</Button>
        </>
      )}
      {s.step < 5 && (
        <Button kind="primary" onClick={() => { s.setStep(Math.min(5, s.step + 1)); s.closeMenu() }}>
          {s.step === 1 ? 'Continue' : 'Next'}
        </Button>
      )}
    </div>
  )
}

function runImport(s: AvailabilityState) {
  // Rows with no roster match queue for remediation rather than being dropped.
  const unmatched = s.review.daPending
  const skipped = s.isSchedSrc ? 0 : s.review.notImported - unmatched
  const file = s.isSchedSrc ? 'schedule_w30.xlsx' : 'availability_w32.csv'
  s.setBatches([
    {
      date: 'Aug 18, 06:40', d: 818, source: s.importType, file,
      rows: s.review.inFile, events: s.review.created, skipped, unmatched,
      status: unmatched > 0 ? 'Needs review' : 'Done',
    },
    ...s.batches,
  ])
  s.setImported({ ...s.imported, [s.importType]: true })
  s.setTab('History')
  s.setStep(1)
  s.setResolved({})
  s.setBPg(1)
  s.closeMenu()
  s.log('Import batch', `${file} applied`)
  s.toastMsg(
    s.isSchedSrc
      ? 'Jul 19 - 25 record built · 41 shift rows'
      : `${s.review.created} cells written into ${s.mapping.tgtWeek}${skipped ? ` · ${skipped} skipped` : ''}${unmatched ? ` · ${unmatched} queued for remediation` : ''}`,
  )
}
