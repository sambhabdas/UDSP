'use client'

import { body1, caption1Strong } from '../../ds/type'
import { PER_UNITS, SWATCHES, bandOf, countIn, sortTiers } from './data'
import type { Tier } from './data'
import { Button, Chip, DialogShell, Field, Input, PickerField, Swatch, TextArea, Toggle } from './parts'
import { FIELD_LABEL, HEAD, NUM } from './style'
import { blankMaker, type StandardsState } from './useStandards'

// ── The standard editor ─────────────────────────────────────────────────────

/**
 * One dialog builds a standard and edits one.
 *
 * A built-in can have its points and pairing changed but not its name, its
 * category or its unit - those are what imports match on.
 */
export function StandardDialog({ s }: { s: StandardsState }) {
  if (!s.stdDlg) return null
  const mk = s.mk
  const locked = mk.mode === 'editBuiltin'
  const has = (side: 'neg' | 'pos') => mk.dir === 'both' || mk.dir === side
  const catDot = mk.catNew ? mk.catColor : s.cats.find((c) => c.name === mk.cat)?.dot ?? 'var(--blue-400)'

  const dirTone = (k: string): [string, string] =>
    k === 'neg' ? ['var(--danger-bg)', 'var(--danger-fg)']
      : k === 'pos' ? ['var(--success-bg)', 'var(--success-fg)']
        : ['var(--blue-50)', 'var(--blue-700)']

  const close = () => { s.setStdDlg(false); s.closeMenu() }

  return (
    <DialogShell
      title={mk.mode === 'new' ? 'New Standard' : `Editing ${mk.name}`}
      width={672}
      chip={locked ? <Chip label="Built In" bg="var(--surface-subtle)" fg="var(--text-secondary)" border="var(--border-default)" /> : undefined}
      onClose={close}
      footer={
        <>
          <span style={body1}>Active</span>
          <Toggle on={mk.active} onClick={() => s.setMk({ ...mk, active: !mk.active })} />
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" onClick={() => saveMaker(s)}>Save Standard</Button>
        </>
      }
    >
      <div data-rsp-page="" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
        <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
          <Field label="Category">
            <PickerField onClick={(e) => s.openMenu(e, 'cat')}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: catDot }} />
              <span style={{ flex: 1, ...body1 }}>{mk.cat}</span>
            </PickerField>
          </Field>
          <Field label="Standard Name">
            <Input value={mk.name} onChange={(v) => s.setMk({ ...mk, name: v })} disabled={locked} placeholder="Name the rule" />
          </Field>
        </div>

        <Field label="Description">
          <TextArea value={mk.desc} onChange={(v) => s.setMk({ ...mk, desc: v })} placeholder="Shown to the driver on their own event row" />
        </Field>

        <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'var(--size-160)' }}>
          <Field label="Direction">
            <div style={{ display: 'flex', height: 'var(--control-height)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
              {(['neg', 'pos', 'both'] as const).map((d, i) => {
                const on = mk.dir === d
                return (
                  <div
                    key={d}
                    data-fx=""
                    tabIndex={0}
                    role="button"
                    onClick={() => s.setMk({ ...mk, dir: d })}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: on ? dirTone(d)[0] : 'var(--surface-card)',
                      color: on ? dirTone(d)[1] : 'var(--text-secondary)',
                      ...body1, fontWeight: 'var(--weight-semibold)', cursor: 'pointer',
                      borderRight: i < 2 ? '1px solid var(--border-default)' : 'none',
                    }}
                  >
                    {d === 'neg' ? 'Negative' : d === 'pos' ? 'Positive' : 'Both'}
                  </div>
                )
              })}
            </div>
          </Field>
          <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'var(--size-160)', minWidth: 0 }}>
            <Field label="Positive Points">
              <Input
                value={mk.pos}
                onChange={(v) => s.setMk({ ...mk, pos: v })}
                disabled={!has('pos')}
                color="var(--success-fg)"
                background={has('pos') ? 'var(--surface-subtle)' : 'var(--surface-page)'}
                numeric
              />
            </Field>
            <Field label="Negative Points">
              <Input
                value={mk.neg}
                onChange={(v) => s.setMk({ ...mk, neg: v })}
                disabled={!has('neg')}
                color="var(--danger-fg)"
                background={has('neg') ? 'var(--surface-subtle)' : 'var(--surface-page)'}
                numeric
              />
            </Field>
          </div>
        </div>

        <Field label="Per Unit">
          <div style={{ display: 'flex', gap: 'var(--size-60)' }}>
            {PER_UNITS.map((p) => {
              const on = mk.per === p
              return (
                <div
                  key={p}
                  data-fx=""
                  tabIndex={0}
                  role="button"
                  onClick={() => {
                    if (locked) { s.toastMsg('Per unit is locked on built-in standards'); return }
                    s.setMk({ ...mk, per: p })
                  }}
                  style={{
                    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: 'var(--control-height)', padding: '0 var(--size-100)', borderRadius: 'var(--radius-small)',
                    background: on ? 'var(--blue-100)' : 'var(--surface-card)',
                    border: `1px solid ${on ? 'var(--blue-200)' : 'var(--border-default)'}`,
                    color: on ? 'var(--blue-700)' : 'var(--text-secondary)',
                    ...caption1Strong, cursor: locked ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {p}
                </div>
              )
            })}
          </div>
        </Field>

        <div data-field="" style={{ boxSizing: 'border-box', marginTop: 'var(--size-100)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-medium)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            data-fx=""
            tabIndex={0}
            role="button"
            onClick={() => s.setCoachDrawer(!s.coachDrawer)}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', minHeight: 44, padding: '0 var(--size-120)', cursor: 'pointer', background: s.coachDrawer ? 'var(--surface-subtle)' : 'transparent' }}
          >
            <span style={HEAD}>Coaching Automation</span>
            <div style={{ flex: 1 }} />
            <span style={{ display: 'flex', color: 'var(--text-secondary)', transform: `rotate(${s.coachDrawer ? 180 : 0}deg)`, transition: 'transform 120ms' }}>
              <svg viewBox="0 0 16 16" width="16" height="16"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
          {s.coachDrawer && (
            <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr)', gap: 'var(--size-160)', padding: 'var(--size-160)', borderTop: '1px solid var(--border-subtle)' }}>
              <Field label="Paired Module">
                <PickerField onClick={(e) => s.openMenu(e, 'mkModule')}>
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...body1, color: mk.module ? 'var(--text-primary)' : 'var(--text-helper)' }}>
                    {mk.module ?? 'None'}
                  </span>
                </PickerField>
              </Field>
              <Field label="Auto Coach">
                <div style={{ display: 'flex', alignItems: 'center', height: 'var(--control-height)' }}>
                  <Toggle
                    on={mk.auto}
                    disabled={!mk.module}
                    title={mk.module ? undefined : 'Pair a module first'}
                    onClick={() => {
                      if (!mk.module) { s.toastMsg('Pair a module first'); return }
                      s.setMk({ ...mk, auto: !mk.auto })
                    }}
                  />
                </div>
              </Field>
              <Field label="Due Within">
                <div data-field="" style={{ boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
                  <input value={mk.due} onChange={(e) => s.setMk({ ...mk, due: e.target.value })} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, ...NUM }} />
                  <span style={{ ...FIELD_LABEL, fontWeight: 'var(--weight-regular)' }}>days</span>
                </div>
              </Field>
            </div>
          )}
        </div>
      </div>
    </DialogShell>
  )
}

function saveMaker(s: StandardsState) {
  const mk = s.mk
  const has = (side: 'neg' | 'pos') => mk.dir === 'both' || mk.dir === side
  const negV = parseFloat(mk.neg) || 0
  const posV = parseFloat(mk.pos) || 0
  if (mk.catNew && mk.catName.trim().length < 2) { s.toastMsg('Name the category first'); return }
  if (mk.name.trim().length < 2) { s.toastMsg('Name the standard first'); return }
  if ((!has('neg') || !negV) && (!has('pos') || !posV)) { s.toastMsg('A standard must score on at least one side'); return }

  const row = {
    name: mk.name.trim(),
    neg: has('neg') ? negV : 0,
    pos: has('pos') ? posV : 0,
    per: mk.per,
    module: mk.module,
    auto: mk.auto,
    due: mk.module ? parseInt(mk.due, 10) || 7 : null,
    custom: mk.mode !== 'editBuiltin',
    inactive: !mk.active,
    desc: mk.desc,
  }

  s.setCats((cs) => {
    const next = cs.map((x) => ({ ...x, rows: x.rows.slice() }))
    if (mk.mode === 'new') {
      if (mk.catNew) next.push({ name: mk.catName.trim(), dot: mk.catColor, custom: true, rows: [row] })
      else next[next.findIndex((c) => c.name === mk.cat)].rows.push(row)
    } else {
      const old = next[mk.srcCat!].rows[mk.srcRow!]
      next[mk.srcCat!].rows[mk.srcRow!] = {
        ...old, ...row,
        // Editing a built-in never makes it custom; it just marks it changed.
        custom: old.custom,
        edited: mk.mode === 'editBuiltin' ? true : old.edited,
        editedHint: mk.mode === 'editBuiltin' ? 'You · Aug 18' : old.editedHint,
      }
    }
    return next
  })
  s.setStdDlg(false)
  s.setMk(blankMaker())
  s.toastMsg('Standard saved - live for the next import')
}

// ── Category dialog ─────────────────────────────────────────────────────────

export function CategoryDialog({ s }: { s: StandardsState }) {
  if (!s.catDlg) return null
  const editing = s.catEditIdx !== null
  const custom = s.mk.catColor.startsWith('#')
  const close = () => { s.setCatDlg(false); s.setCatEditIdx(null); s.closeMenu() }

  return (
    <DialogShell
      title={editing ? 'Edit Category' : 'New Category'}
      width={560}
      onClose={close}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" onClick={() => saveCategory(s)}>{editing ? 'Save' : 'Add Category'}</Button>
        </>
      }
    >
      <div style={{ padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
        <Field label="Category Name">
          <Input value={s.mk.catName} onChange={(v) => s.setMk({ ...s.mk, catName: v })} placeholder="Name the category" />
        </Field>
        <Field label="Category Color">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
            <label
              title="Custom color"
              style={{
                position: 'relative', boxSizing: 'border-box', width: 28, height: 28, borderRadius: '50%',
                border: `2px solid ${custom ? 'var(--neutral-900)' : 'transparent'}`,
                background: 'conic-gradient(var(--red-500), var(--yellow-500), var(--green-500), var(--blue-500), var(--red-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
              }}
            >
              {custom && <span style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: s.mk.catColor }} />}
              <input
                type="color"
                value={custom ? s.mk.catColor : '#2563eb'}
                onChange={(e) => s.setMk({ ...s.mk, catColor: e.target.value })}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
            </label>
            {SWATCHES.slice(0, 8).map((sw) => (
              <Swatch key={sw} fill={sw} picked={s.mk.catColor === sw} onClick={() => s.setMk({ ...s.mk, catColor: sw })} />
            ))}
          </div>
        </Field>
      </div>
    </DialogShell>
  )
}

function saveCategory(s: StandardsState) {
  const name = s.mk.catName.trim()
  if (name.length < 2) { s.toastMsg('Name the category first'); return }
  if (s.catEditIdx !== null) {
    const idx = s.catEditIdx
    s.setCats((cs) => cs.map((x, i) => (i === idx ? { ...x, name, dot: s.mk.catColor } : x)))
    s.setCatDlg(false)
    s.setCatEditIdx(null)
    s.setMk(blankMaker())
    s.toastMsg(`${name} saved`)
    return
  }
  s.setCats((cs) => cs.concat([{ name, dot: s.mk.catColor, custom: true, rows: [] }]))
  s.setCatDlg(false)
  s.setMk(blankMaker())
  s.toastMsg(`${name} added - drop standards into it or use New Standard`)
}

// ── Tier editor ─────────────────────────────────────────────────────────────

export function TierDialog({ s }: { s: StandardsState }) {
  if (!s.tierDlg || !s.te) return null
  const te = s.te
  const close = () => { s.setTierDlg(null); s.setTe(null); s.closeMenu() }

  // Show where the tier would land before it is saved.
  const fromV = te.lowest ? null : te.from === '' || isNaN(parseInt(te.from, 10)) ? null : parseInt(te.from, 10)
  const preview: Tier[] = s.tiers
    .filter((t) => t.name !== te.orig)
    .concat([{ name: te.name || 'New Tier', from: te.lowest ? null : fromV, color: te.color, risk: te.risk }])
  const sorted = sortTiers(preview)
  const idx = sorted.findIndex((t) => t.name === (te.name || 'New Tier'))
  const bandLine = `${bandOf(sorted, idx)} · ${countIn(sorted, idx)} associates in this band today`

  return (
    <DialogShell
      title={s.tierDlg === 'new' ? 'Add Tier' : 'Edit Tier'}
      width={560}
      onClose={close}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={close}>Cancel</Button>
          <Button kind="primary" onClick={() => saveTier(s)}>Save</Button>
        </>
      }
    >
      <div style={{ padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
        <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
          <Field label="Name">
            <Input value={te.name} onChange={(v) => s.setTe({ ...te, name: v })} placeholder="Tier name" />
          </Field>
          <Field label="From">
            <Input
              value={te.lowest ? '-' : te.from}
              onChange={(v) => s.setTe({ ...te, from: v })}
              disabled={te.lowest}
              placeholder="Lower bound"
              background={te.lowest ? 'var(--surface-page)' : 'var(--surface-subtle)'}
              numeric
            />
          </Field>
        </div>
        <Field label="Color">
          <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
            {SWATCHES.map((sw) => (
              <Swatch key={sw} fill={sw} picked={te.color === sw} onClick={() => s.setTe({ ...te, color: sw })} />
            ))}
          </div>
        </Field>
        <Field label="Note">
          <Input value={te.note} onChange={(v) => s.setTe({ ...te, note: v })} placeholder="Shown on the tier chip hover" />
        </Field>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)' }}>
          <Toggle on={te.risk} tone="risk" onClick={() => s.setTe({ ...te, risk: !te.risk })} />
          <span style={body1}>Counts as at risk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-100) var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--size-60)', height: 20,
              padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
              background: te.risk ? 'var(--danger-bg)' : 'var(--surface-card)',
              color: te.risk ? 'var(--danger-fg)' : 'var(--text-primary)', ...caption1Strong,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: te.color }} />
            {te.name || 'Tier'}
          </span>
          <span style={{ ...body1, color: 'var(--text-secondary)', ...NUM }}>{bandLine}</span>
        </div>
      </div>
    </DialogShell>
  )
}

function saveTier(s: StandardsState) {
  const te = s.te
  if (!te) return
  if (te.name.trim().length < 2) { s.toastMsg('Name the tier first'); return }
  const fromV = te.lowest ? null : parseInt(te.from, 10)
  if (!te.lowest && isNaN(fromV as number)) { s.toastMsg('Set the lower bound'); return }
  if (!te.lowest && s.tiers.some((t) => t.name !== te.orig && t.from === fromV)) {
    s.toastMsg(`Another tier already starts at ${fromV}`)
    return
  }
  s.setTiers(s.tiers.filter((t) => t.name !== te.orig).concat([{ name: te.name.trim(), from: fromV, color: te.color, risk: te.risk, note: te.note }]))
  s.setTierDlg(null)
  s.setTe(null)
  s.toastMsg('Tier saved - every chip re-renders immediately')
}

// ── The shared confirm / history / rename / pair dialog ──────────────────────

export function GeneralDialog({ s }: { s: StandardsState }) {
  if (!s.gDlg || !s.gCtx) return null
  const ctx = s.gCtx
  const kind = ctx.kind

  const title =
    s.gDlg === 'confirm' ? (kind === 'risk' ? 'Change At Risk' : kind === 'delTier' ? 'Delete Tier' : 'Delete Standard')
      : s.gDlg === 'history' ? 'Edit History'
        : s.gDlg === 'cat' ? 'Rename Category'
          : ctx.first ? 'Pair Module' : 'Replace Module'

  const subject =
    s.gDlg === 'confirm' ? ctx.tier ?? ctx.name ?? ''
      : s.gDlg === 'history' ? ctx.name ?? ''
        : s.gDlg === 'cat' ? s.cats[ctx.idx!].name
          : s.cats[ctx.c!].rows[ctx.r!].name

  const saveLabel = s.gDlg === 'history' ? '' : s.gDlg === 'confirm' ? (kind === 'risk' ? 'Confirm' : 'Delete') : 'Save'
  const danger = s.gDlg === 'confirm' && kind !== 'risk'

  return (
    <DialogShell
      title={title}
      width={560}
      onClose={s.closeG}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <Button onClick={s.closeG}>{s.gDlg === 'history' ? 'Close' : 'Cancel'}</Button>
          {saveLabel && <Button kind={danger ? 'danger' : 'primary'} onClick={() => saveGeneral(s)}>{saveLabel}</Button>}
        </>
      }
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
        <span style={{ fontSize: 'var(--subtitle-1-size)', lineHeight: 'var(--subtitle-1-lh)', fontWeight: 'var(--weight-semibold)' }}>{subject}</span>

        {s.gDlg === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
            {(ctx.lines ?? []).map((l, i) => (
              <span key={i} style={{ ...body1, color: l.color }}>{l.txt}</span>
            ))}
          </div>
        )}

        {s.gDlg === 'history' && <History rows={ctx.rows ?? []} />}

        {s.gDlg === 'cat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
            <Field label="Name">
              <Input value={s.catForm.name} onChange={(v) => s.setCatForm({ ...s.catForm, name: v })} />
            </Field>
            <Field label="Color">
              <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
                {SWATCHES.map((sw) => (
                  <Swatch key={sw} fill={sw} picked={s.catForm.color === sw} onClick={() => s.setCatForm({ ...s.catForm, color: sw })} />
                ))}
              </div>
            </Field>
          </div>
        )}

        {s.gDlg === 'pair' && (
          <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>
            <Field label="Module">
              <PickerField onClick={(e) => s.openMenu(e, 'pairModule2')}>
                <span style={{ flex: 1, ...body1, color: s.pairForm.module ? 'var(--text-primary)' : 'var(--text-helper)' }}>
                  {s.pairForm.module ?? 'Pick a module'}
                </span>
              </PickerField>
            </Field>
            <Field label="Due Within">
              <div data-field="" style={{ boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center', padding: '0 var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
                <input value={s.pairForm.due} onChange={(e) => s.setPairForm({ ...s.pairForm, due: e.target.value })} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', ...body1, ...NUM }} />
                <span style={{ ...FIELD_LABEL, fontWeight: 'var(--weight-regular)' }}>days</span>
              </div>
            </Field>
          </div>
        )}
      </div>
    </DialogShell>
  )
}

function History({ rows }: { rows: { when: string; who: string; field: string; change: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr 1fr', columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderBottom: 'none', borderRadius: 'var(--radius-medium) var(--radius-medium) 0 0', padding: 'var(--size-60) var(--size-120)' }}>
        {['When', 'Who', 'Field', 'Change'].map((h) => <span key={h} style={HEAD}>{h}</span>)}
      </div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '0 0 var(--radius-medium) var(--radius-medium)', overflow: 'hidden' }}>
        {rows.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr 1fr', columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 40, padding: 'var(--size-40) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 'var(--caption-1-size)', lineHeight: 'var(--caption-1-lh)', color: 'var(--text-secondary)' }}>{h.when}</span>
            <span style={body1}>{h.who}</span>
            <span style={body1}>{h.field}</span>
            <span style={{ ...body1, ...NUM }}>{h.change}</span>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 64 }}>
            <span style={{ ...body1, color: 'var(--text-secondary)' }}>No edits yet.</span>
          </div>
        )}
      </div>
    </div>
  )
}

function saveGeneral(s: StandardsState) {
  const ctx = s.gCtx
  if (!ctx) return

  if (s.gDlg === 'confirm') {
    if (ctx.kind === 'risk') {
      s.setTiers(s.tiers.map((x) => (x.name === ctx.tier ? { ...x, risk: !x.risk } : x)))
      s.closeG()
      s.toastMsg('At risk updated - the red dots and Overview follow on the next render')
      return
    }
    if (ctx.kind === 'delTier') {
      s.setTiers(s.tiers.filter((t) => t.name !== ctx.tier))
      s.closeG()
      s.toastMsg(`${ctx.tier} deleted - the neighbouring band absorbs its range`)
      return
    }
    s.setCats((cs) => {
      const next = cs.map((x) => ({ ...x, rows: x.rows.slice() }))
      next[ctx.c!].rows.splice(ctx.r!, 1)
      return next
    })
    s.closeG()
    s.toastMsg(`${ctx.name} deleted - past events keep their stamped points`)
    return
  }

  if (s.gDlg === 'cat') {
    if (s.catForm.name.trim().length < 2) { s.toastMsg('Name the category first'); return }
    s.setCats((cs) => cs.map((x, xi) => (xi === s.catForm.idx ? { ...x, name: s.catForm.name.trim(), dot: s.catForm.color } : x)))
    s.closeG()
    s.toastMsg('Category saved - the new color propagates to every chip and chart')
    return
  }

  if (s.gDlg === 'pair') {
    if (!s.pairForm.module) { s.toastMsg('Pick a module'); return }
    const ref = { c: ctx.c!, r: ctx.r! }
    const old = s.cats[ref.c].rows[ref.r]
    s.setRow(ref, {
      ...old,
      module: s.pairForm.module,
      due: parseInt(s.pairForm.due, 10) || 7,
      // Pairing for the first time never switches auto coach on for you.
      auto: ctx.first ? false : old.auto,
    })
    s.closeG()
    s.toastMsg(ctx.first ? `${s.pairForm.module} paired - auto coach stays off until you turn it on` : 'Module replaced - applies to new events only')
  }
}
