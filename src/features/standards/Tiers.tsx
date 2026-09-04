'use client'

import { body1, caption1, caption1Strong } from '../../ds/type'
import { ROSTER_NETS, bandOf, countIn, namesIn, signed } from './data'
import { Button, IconButton, Toggle } from './parts'
import { CARD, HEAD, LADDER_COLS, NUM } from './style'
import type { StandardsState } from './useStandards'

/**
 * Performance Tiers - the ladder that turns a net score into a label, and
 * every consequence of changing it, stated before you commit.
 */
export function Tiers({ s }: { s: StandardsState }) {
  const tiers = s.ladder
  const total = ROSTER_NETS.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160)' }}>
          <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Tier Distribution</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: '0 var(--size-160) var(--size-160) var(--size-160)' }}>
          <div style={{ display: 'flex', height: 28, borderRadius: 'var(--radius-small)', overflow: 'hidden' }}>
            {tiers.map((t, i) => {
              const n = countIn(tiers, i)
              return (
                <div
                  key={t.name}
                  data-fx=""
                  tabIndex={0}
                  role="button"
                  onClick={() => s.toastMsg(`Opening Performance Roster · Tier ${t.name}`)}
                  title={`${t.name} · ${bandOf(tiers, i)} · ${n} associates`}
                  style={{
                    // An empty band still gets a sliver so it stays clickable.
                    width: `${Math.max(8, n / total * 100).toFixed(1)}%`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: t.color, cursor: 'pointer',
                  }}
                >
                  <span style={{ ...caption1Strong, color: 'var(--text-inverse)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {t.name} · {n}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)' }}>
            {tiers.map((t, i) => (
              <span key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', ...caption1, color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: t.color }} />
                {t.name} · {countIn(tiers, i)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
          <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Tier Ladder</span>
          <div style={{ flex: 1 }} />
          <Button
            kind="primary"
            onClick={() => {
              s.setTierDlg('new')
              s.setTe({ orig: null, name: '', from: '', color: s.freeSwatch(), risk: false, note: '', lowest: false })
            }}
          >
            + Add Tier
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: LADDER_COLS, columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-160)' }}>
          <span style={HEAD}>Color</span>
          <span style={HEAD}>Name</span>
          <span style={HEAD}>Band</span>
          <span style={{ ...HEAD, textAlign: 'right' }}>From</span>
          <span style={HEAD}>At Risk</span>
          <span style={{ ...HEAD, textAlign: 'right' }}>Associates</span>
          <span />
        </div>

        {tiers.map((t, i) => (
          <div key={t.name} style={{ display: 'grid', gridTemplateColumns: LADDER_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 48, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.color }} />
            <span title={t.note} style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{t.name}</span>
            <span style={{ ...body1, color: 'var(--text-secondary)', ...NUM }}>{bandOf(tiers, i)}</span>
            <FromCell s={s} name={t.name} from={t.from} />
            <div style={{ display: 'flex' }}>
              <Toggle
                on={t.risk}
                tone="risk"
                onClick={() => s.openG('confirm', { kind: 'risk', tier: t.name, lines: riskLines(s, tiers, i) })}
              />
            </div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); s.toastMsg(`Opening Performance Roster · Tier ${t.name}`) }}
              style={{ textAlign: 'right', ...body1, ...NUM }}
            >
              {countIn(tiers, i)}
            </a>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'tierKebab', { tierName: t.name })} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * The From column edits in place: click the number, type, Enter to commit.
 * The bottom tier has no bound, so its cell is inert.
 */
function FromCell({ s, name, from }: { s: StandardsState; name: string; from: number | null }) {
  if (s.tierFromEdit === name) {
    return (
      <div data-field="" style={{ boxSizing: 'border-box', height: 28, display: 'flex', alignItems: 'center', justifySelf: 'end', width: 90, padding: '0 var(--size-80)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-small)', background: 'var(--surface-subtle)' }}>
        <input
          autoFocus
          value={s.tierFromVal}
          onChange={(e) => s.setTierFromVal(e.target.value)}
          onBlur={() => s.setTierFromEdit(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { s.setTierFromEdit(null); return }
            if (e.key !== 'Enter') return
            const v = parseInt(s.tierFromVal, 10)
            if (isNaN(v)) { s.toastMsg('Set a whole number'); return }
            if (s.tiers.some((t) => t.name !== name && t.from === v)) { s.toastMsg(`Another tier already starts at ${v}`); return }
            s.setTiers(s.tiers.map((t) => (t.name === name ? { ...t, from: v } : t)))
            s.setTierFromEdit(null)
            s.toastMsg('Boundary moved - every chip re-renders immediately')
          }}
          style={{ width: '100%', minWidth: 0, textAlign: 'right', border: 'none', background: 'transparent', ...body1, ...NUM }}
        />
      </div>
    )
  }
  const editable = from !== null
  return (
    <span
      data-fx=""
      tabIndex={editable ? 0 : undefined}
      role={editable ? 'button' : undefined}
      onClick={editable ? () => { s.setTierFromEdit(name); s.setTierFromVal(String(from)) } : undefined}
      style={{ textAlign: 'right', ...body1, ...NUM, color: editable ? 'var(--text-primary)' : 'var(--text-disabled)', cursor: editable ? 'text' : 'default' }}
    >
      {from === null ? '-' : signed(from)}
    </span>
  )
}

/** Turning at-risk on or off changes who the whole product treats as at risk. */
function riskLines(s: StandardsState, tiers: typeof s.ladder, i: number) {
  const t = tiers[i]
  const names = namesIn(tiers, i)
  const anyOther = s.tiers.some((x) => x.name !== t.name && x.risk)
  if (t.risk) {
    const lines = [{
      txt: `${names.length} associates no longer count as at risk${names.length ? `: ${names.join(', ')}` : '.'}`,
      color: 'var(--text-primary)',
    }]
    if (!anyOther) {
      lines.push({
        txt: 'No tier will count as at risk - the red dots, the At Risk Only filter and the Overview KPI read empty until one is flagged.',
        color: 'var(--warning-fg)',
      })
    }
    return lines
  }
  return [{
    txt: `${names.length} associates become at risk${names.length ? `: ${names.join(', ')}` : '.'}`,
    color: 'var(--text-primary)',
  }]
}
