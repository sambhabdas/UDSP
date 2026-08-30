'use client'

import { body1 } from '../../ds/type'
import { Toast } from './parts'
import { Setup } from './Setup'
import { Result } from './Result'
import { Dialogs } from './dialogs'
import { useAutoSchedule } from './useAutoSchedule'
import type { Tab } from './useAutoSchedule'

const TABS: Tab[] = ['Setup', 'Result']

export function AutoSchedulePage() {
  const s = useAutoSchedule()
  return (
    <div
      data-screen-label="Auto Schedule"
      onClick={() => { if (s.drop) s.setDrop(null) }}
      style={{
        boxSizing: 'border-box', position: 'relative', height: 'calc(100vh - var(--header-height))',
        minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)', color: 'var(--text-primary)', overflow: 'hidden auto',
      }}
    >
      <div
        data-rsp-page=""
        style={{
          position: 'sticky', top: 0, zIndex: 20, boxSizing: 'border-box', display: 'flex',
          alignItems: 'center', gap: 'var(--size-40)',
          padding: 'var(--size-120) var(--size-200) 0 var(--size-200)', background: 'var(--surface-page)',
        }}
      >
        {TABS.map((t) => {
          const on = s.tab === t
          return (
            <div
              key={t}
              onClick={() => s.setTab(t)}
              onMouseDown={(e) => e.preventDefault()}
              style={{
                boxSizing: 'border-box', height: 36, display: 'flex', alignItems: 'center',
                padding: '0 var(--size-120)', borderRadius: 'var(--radius-small) var(--radius-small) 0 0',
                ...body1, fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${on ? 'var(--primary)' : 'transparent'}`,
                cursor: 'pointer', transition: 'color var(--motion-hover)',
              }}
            >
              {t}
            </div>
          )
        })}
        <div style={{ flex: 1 }} />
      </div>

      {s.tab === 'Setup' ? <Setup s={s} /> : <Result s={s} />}

      <Dialogs s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}
