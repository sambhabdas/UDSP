'use client'

import { Catalog } from './Catalog'
import { CategoryDialog, GeneralDialog, StandardDialog, TierDialog } from './dialogs'
import { FilterPanel } from './FilterPanel'
import { FloatingMenu } from './FloatingMenu'
import { Tiers } from './Tiers'
import { Toast } from './parts'
import { useStandards, type Tab } from './useStandards'

const TABS: [Tab, string][] = [['catalog', 'Standards'], ['tiers', 'Performance Tiers']]

/**
 * Standards.
 *
 * The rulebook behind every other Scorecard page: what scores, by how much,
 * what coaching it triggers, and where the tier boundaries sit.
 */
export function StandardsPage() {
  const s = useStandards()
  return (
    <div
      data-screen-label="Standards"
      onClick={() => { if (s.menu) s.closeMenu() }}
      style={{
        boxSizing: 'border-box', height: 'calc(100vh - var(--header-height))', minHeight: 0,
        display: 'flex', flexDirection: 'column', gap: 'var(--size-120)', padding: 'var(--size-200)',
        background: 'var(--surface-page)', fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)', overflow: 'hidden',
      }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-200)' }}>
        {TABS.map(([id, label]) => {
          const on = s.tab === id
          return (
            <div
              key={id}
              data-fx=""
              tabIndex={0}
              role="button"
              onClick={() => { s.setTab(id); s.closeMenu() }}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--size-40)', cursor: 'pointer', paddingBottom: 'var(--size-40)' }}
            >
              <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {label}
              </span>
              {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, borderRadius: 'var(--radius-pill)', background: 'var(--primary)' }} />}
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div data-rsp-minw0="" style={{ minWidth: 1120, display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
          {s.tab === 'catalog' ? <Catalog s={s} /> : <Tiers s={s} />}
        </div>
      </div>

      <StandardDialog s={s} />
      <CategoryDialog s={s} />
      <TierDialog s={s} />
      <GeneralDialog s={s} />
      <FilterPanel s={s} />
      <FloatingMenu s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}
