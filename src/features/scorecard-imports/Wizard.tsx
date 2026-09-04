'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong } from '../../ds/type'
import {
  COLS, EVENT_PREVIEW, MODES, ROSTER_PREVIEW, ROSTER_PREVIEW_HEAD, STEPS, comma,
} from './data'
import type { ColumnMap, ImportsState } from './useImports'
import {
  Button, Chip, Field, GridHead, HeadCell, IconButton, PickerField, Segment,
} from './parts'
import { CARD, FIELD_LABEL, HEAD, ISSUE_COLS, MAP_COLS, NUM, PV_COLS, TILE_LABEL } from './style'

/** The wizard: a step rail on the left, the current step on the right. */
export function Wizard({ s }: { s: ImportsState }) {
  return (
    <div data-rsp-rail="" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--size-120)', alignItems: 'start' }}>
      <StepRail s={s} />
      <div style={CARD}>
        <Header s={s} />
        {s.step === 1 && <ChooseSource s={s} />}
        {s.step === 2 && <UploadFile s={s} />}
        {s.step === 3 && <MapColumns s={s} />}
        {s.step === 4 && <ScoringRules s={s} />}
        {s.step === 5 && <Review s={s} />}
        <Footer s={s} />
      </div>
    </div>
  )
}

function StepRail({ s }: { s: ImportsState }) {
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--size-160)' }}>
        <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Import</span>
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
              style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--size-100)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <span
                  style={{
                    boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%',
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
              <span
                style={{
                  paddingTop: 2, paddingBottom: last ? 0 : 'var(--size-160)', ...body1,
                  fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  color: on || done ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Header({ s }: { s: ImportsState }) {
  const lastBatch = s.batches.find((b) => b.source === s.src)
  // A source is "imported" if it was run just now, or ever appears in history.
  const everImported = !!s.imported[s.src] || s.batches.some((b) => b.source === s.src)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-160)' }}>
      <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>{STEPS[s.step - 1]}</span>
      <div style={{ flex: 1 }} />
      {everImported && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20, padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)', background: 'var(--success-bg)', color: 'var(--success-fg)', ...caption1Strong }}>
          <span style={{ display: 'flex' }}><Icon name="FnCheck" size={12} /></span>
          {s.imported[s.src] ? 'Imported just now' : `Last imported ${lastBatch?.date ?? ''}`}
        </span>
      )}
      <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Step {s.step} of 5</span>
    </div>
  )
}

function ChooseSource({ s }: { s: ImportsState }) {
  return (
    <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--size-120)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
      {s.allSources.map((name) => <SourceCard key={name} s={s} name={name} />)}
      <DashedButton onClick={() => { s.setFDlg('source'); s.setCs('') }} minHeight={64}>+ Custom Source</DashedButton>
    </div>
  )
}

function SourceCard({ s, name }: { s: ImportsState; name: string }) {
  const [hover, hoverProps] = useHover()
  const on = s.src === name
  const custom = s.customSources.includes(name)
  const tag = s.imported[name] ? 'Imported' : custom ? 'Custom' : 'Preset saved'
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={() => { s.setSrc(name); s.closeMenu(); s.setStep(2) }}
      style={{
        boxSizing: 'border-box', minHeight: 64, display: 'flex', alignItems: 'center', gap: 'var(--size-80)',
        padding: 'var(--size-120)', borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : on ? 'var(--blue-50)' : 'var(--surface-card)',
        border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`, cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
        <span style={{ ...body1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on ? 'var(--blue-700)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </span>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', width: 'fit-content', height: 18,
            padding: '0 var(--size-60)', borderRadius: 'var(--radius-small)',
            background: s.imported[name] ? 'var(--success-bg)' : custom ? 'var(--surface-subtle)' : 'var(--blue-50)',
            color: s.imported[name] ? 'var(--success-fg)' : custom ? 'var(--text-secondary)' : 'var(--blue-700)',
            ...caption1Strong, whiteSpace: 'nowrap',
          }}
        >
          {tag}
        </span>
      </div>
      <IconButton icon="FnMore" size={24} color="var(--primary)" onClick={(e) => s.openMenu(e, 'preset', { source: name })} />
    </div>
  )
}

function DashedButton({ children, onClick, minHeight }: { children: string; onClick: () => void; minHeight: number }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', minHeight, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-medium)',
        color: 'var(--text-secondary)', ...body1, fontWeight: 'var(--weight-semibold)', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : undefined,
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}

/** Step 2 - the file, and the first five rows of it. */
function UploadFile({ s }: { s: ImportsState }) {
  const head = s.roster ? ROSTER_PREVIEW_HEAD : COLS
  const rows = s.roster ? ROSTER_PREVIEW : EVENT_PREVIEW
  const k = s.pvSort.k === null ? null : parseInt(s.pvSort.k, 10)
  const sorted = k === null
    ? rows
    : rows.slice().sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (s.pvSort.d === 'asc' ? 1 : -1))

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-100) var(--size-160)', borderTop: '1px solid var(--border-default)', background: 'var(--surface-subtle)' }}>
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>
          {s.roster ? (s.src === 'Paycom' ? 'paycom-export-aug.xlsx' : 'roster-august.xlsx') : 'netradyne-wk33.csv'}
        </span>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{s.roster ? '14 rows · 8 columns' : '1,204 rows · 5 columns'}</span>
        <div style={{ flex: 1 }} />
        <Button kind="primary" onClick={() => s.toastMsg('Pick a new file - the mapping is kept')}>Replace</Button>
      </div>

      <div style={{ overflow: 'auto' }}>
        <div data-rsp-minw0="" style={{ minWidth: 860 }}>
          <div style={{ display: 'grid', gridTemplateColumns: PV_COLS, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)' }}>
            <span style={HEAD}>#</span>
            {head.map((c, i) => (
              <div
                key={c}
                data-fx=""
                tabIndex={0}
                role="button"
                onClick={() => s.sortPreview(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', ...HEAD, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                <span>{c}</span>
                <span style={{ display: 'flex', color: k === i ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
                  <Icon name={k === i ? (s.pvSort.d === 'asc' ? 'FnSortUp' : 'FnSortDown') : 'FnSort'} size={12} />
                </span>
              </div>
            ))}
          </div>
          {sorted.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: PV_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 40, padding: 'var(--size-40) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ ...body1, color: 'var(--text-secondary)', ...NUM }}>{i + 1}</span>
              {r.map((c, ci) => (
                <span key={ci} style={{ ...body1, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</span>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', minHeight: 36, padding: 'var(--size-40) var(--size-160)' }}>
            <span style={{ ...caption1, color: 'var(--text-secondary)' }}>
              {s.roster ? '9 more rows in the file' : '1,199 more rows in the file'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/** Step 3 - which column of the file feeds which field. */
function MapColumns({ s }: { s: ImportsState }) {
  const rosterFields: [string, keyof ColumnMap][] = s.src === 'Paycom'
    ? [['EE Code Column', 'rEeCol'], ['EE Name Column', 'rNameCol']]
    : [['Name Column', 'rNameCol'], ['Transporter ID Column', 'rIdCol'], ['EE Code Column', 'rEeCol'], ['Start Date Column', 'rStartCol']]

  return (
    <div data-rsp-page="" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
      {s.roster && (
        <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
          {rosterFields.map(([label, key]) => (
            <Field key={key} label={label}>
              <PickerField label={s.columns[key]} onClick={(e) => s.openMenu(e, 'rCol', { field: key })} />
            </Field>
          ))}
        </div>
      )}

      {!s.roster && (
        <>
          <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
            <Field label="Associate Match">
              <PickerField label={s.columns.daCol} onClick={(e) => s.openMenu(e, 'daCol')} />
            </Field>
            <Field label="Event Date">
              <PickerField label={s.columns.dateCol} onClick={(e) => s.openMenu(e, 'dateCol')} />
            </Field>
          </div>
          <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
            <Field label="Reporting Date">
              <PickerField label={s.columns.repCol} onClick={(e) => s.openMenu(e, 'repCol')} />
            </Field>
            <Field label="Description">
              <PickerField label={s.columns.descCol} onClick={(e) => s.openMenu(e, 'descCol')} />
            </Field>
          </div>
        </>
      )}
    </div>
  )
}

/** Step 4 - what each file value scores, and which rows count at all. */
function ScoringRules({ s }: { s: ImportsState }) {
  if (s.roster) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
        <span style={{ ...body1, color: 'var(--text-secondary)' }}>Roster imports carry no scoring rules.</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={FIELD_LABEL}>Value Map</span>
          <div style={{ flex: 1 }} />
          <a href="#" onClick={(e) => { e.preventDefault(); s.setFDlg('mv'); s.setMv({ file: '', std: null, dir: 'neg' }) }} style={body1}>+ Map Value</a>
        </div>
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: MAP_COLS, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-120)' }}>
            <span style={HEAD}>File Value</span>
            <span style={HEAD}>Standard</span>
            <span style={HEAD}>Direction</span>
          </div>
          {s.vmap.map(([file, std, dir], i) => (
            <div key={file} style={{ display: 'grid', gridTemplateColumns: MAP_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 40, padding: 'var(--size-40) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ ...caption1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file}</span>
              <span style={{ ...body1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{std}</span>
              <span style={{ ...body1, color: dir === 'pos' ? 'var(--success-fg)' : 'var(--danger-fg)' }}>{dir === 'pos' ? 'Positive' : 'Negative'}</span>
              <IconButton
                icon="FnDismiss"
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

      <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
        <Field label="Scoring Mode">
          <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
            {MODES.map((m) => <Segment key={m} label={m} on={s.mode === m} onClick={() => s.setMode(m)} />)}
          </div>
        </Field>
        <Field label="Filters">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', flexWrap: 'wrap', minHeight: 28 }}>
            {s.filters.map((f, i) => (
              <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 28, padding: '0 var(--size-100)', borderRadius: 'var(--radius-small)', background: 'var(--blue-100)', border: '1px solid var(--blue-200)', color: 'var(--blue-700)', ...caption1Strong }}>
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
                  style={{ display: 'flex', cursor: 'pointer' }}
                >
                  <Icon name="FnDismiss" size={12} />
                </span>
              </span>
            ))}
            <a href="#" onClick={(e) => { e.preventDefault(); s.setFDlg('filter'); s.setFf({ col: 'Status', op: 'Equals', val: '' }) }} style={body1}>+ Add Filter</a>
          </div>
        </Field>
      </div>
    </div>
  )
}

/** Step 5 - what the run will do, and everything still unanswered. */
function Review({ s }: { s: ImportsState }) {
  const tiles = [
    { label: 'Rows In File', value: comma(s.review.inFile), color: 'var(--text-primary)' },
    { label: s.roster ? 'Associate Updates' : 'Events To Create', value: comma(s.review.created), color: 'var(--success-fg)' },
    { label: 'Rows Not Imported', value: comma(s.review.notImported), color: s.review.notImported ? 'var(--warning-fg)' : 'var(--success-fg)' },
  ]
  const pendingCount = s.openIssues.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)', padding: 'var(--size-200)', borderTop: '1px solid var(--border-default)' }}>
      <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--size-120)' }}>
        {tiles.map((t) => (
          <div key={t.label} style={{ boxSizing: 'border-box', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-120) var(--size-160)', display: 'flex', flexDirection: 'column', gap: 'var(--size-40)' }}>
            <span style={TILE_LABEL}>{t.label}</span>
            <span style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>{t.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
          <span style={FIELD_LABEL}>Issues To Resolve</span>
          <Chip
            label={pendingCount ? `${pendingCount} pending` : 'All resolved'}
            bg={pendingCount ? 'var(--warning-bg)' : 'var(--success-bg)'}
            fg={pendingCount ? 'var(--warning-fg)' : 'var(--success-fg)'}
          />
          <div style={{ flex: 1 }} />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (!s.openIssues.length) { s.toastMsg('Every issue is resolved'); return }
              const next = { ...s.resolved }
              s.openIssues.forEach((r) => { next[r.id] = 'Skip these rows' })
              s.setResolved(next)
              s.toastMsg(`${s.openIssues.reduce((a, r) => a + r.rows, 0)} rows will be skipped`)
            }}
            style={body1}
          >
            Skip Unresolved Rows
          </a>
        </div>

        <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
          <GridHead cols={ISSUE_COLS} noTop>
            <HeadCell>Issue</HeadCell>
            <HeadCell>Cause</HeadCell>
            <HeadCell align="right">Rows</HeadCell>
            <HeadCell>Resolution</HeadCell>
            <HeadCell>Status</HeadCell>
          </GridHead>
          {s.issues.map((r) => <IssueRow key={r.id} s={s} issue={r} />)}
        </div>
      </div>
    </div>
  )
}

function IssueRow({ s, issue }: { s: ImportsState; issue: ImportsState['issues'][number] }) {
  const v = s.resolved[issue.id] ?? null
  const skipped = v === 'Skip these rows'
  const done = !!v && !skipped
  // A failed filter or a held roster row is the importer working as intended,
  // so it is reported rather than offered a fix.
  const byDesign = issue.kind === 'filter' || issue.kind === 'hold'
  const status = byDesign ? (issue.kind === 'filter' ? 'Skipped' : 'Held') : skipped ? 'Skipped' : done ? 'Ready' : 'Pending'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: ISSUE_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 52, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minWidth: 0, ...body1, fontFamily: issue.kind === 'da' || issue.kind === 'map' ? 'var(--font-mono)' : 'var(--font-family)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: byDesign ? 'var(--neutral-400)' : done ? 'var(--success-accent)' : 'var(--warning-accent)', flexShrink: 0 }} />
        {issue.value}
      </span>
      <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{issue.cause}</span>
      <span style={{ textAlign: 'right', ...body1, ...NUM }}>{comma(issue.rows)}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
        {!byDesign && (
          <PickerField
            flex
            label={v ?? (issue.kind === 'da' ? 'Pick an associate' : issue.kind === 'map' ? 'Map to a standard' : 'Set the date format')}
            color={v ? 'var(--text-primary)' : 'var(--text-helper)'}
            background={done ? 'var(--success-bg)' : 'var(--surface-subtle)'}
            border={done ? 'var(--success-border)' : 'var(--border-default)'}
            onClick={(e) => s.openMenu(e, issue.kind === 'da' ? 'issDa' : issue.kind === 'map' ? 'issStd' : 'issDate', { issueId: issue.id })}
          />
        )}
        {byDesign && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (issue.kind === 'filter') { s.setStep(4); s.toastMsg('Scoring Rules - adjust the filters'); return }
              s.toastMsg(`${issue.value} - listed for review once the run finishes`)
            }}
            style={body1}
          >
            {issue.kind === 'filter' ? 'Edit filters' : 'Review after run'}
          </a>
        )}
        {v && <IconButton icon="FnDismiss" size={24} title="Clear" onClick={(e) => { e.stopPropagation(); s.unresolve(issue.id) }} />}
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

function Footer({ s }: { s: ImportsState }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
      {s.step > 1 && <Button onClick={() => { s.setStep(Math.max(1, s.step - 1)); s.closeMenu() }}>Back</Button>}
      <div style={{ flex: 1 }} />
      {s.step === 5 && (
        <>
          <Button onClick={() => s.toastMsg('Preset saved - next week is one click')}>Save as Preset</Button>
          <Button kind="primary" onClick={() => runImport(s)}>Run Import</Button>
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

function runImport(s: ImportsState) {
  s.setImported({ ...s.imported, [s.src]: true })
  s.setTab('history')
  s.toastMsg(
    s.roster
      ? s.src === 'Paycom'
        ? '12 EE codes updated - no records created'
        : 'Roster upserted - 13 updates · 1 new · 1 listed for review'
      : '34 events created · 1,167 skipped · 3 queued for remediation',
  )
}
