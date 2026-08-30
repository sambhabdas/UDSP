'use client'

import { Toast } from '../../ds/components/Overlay'
import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { KPIS, STATUS_TONE } from './data'
import { SendDialog } from './SendDialog'
import { SurveyMaker } from './SurveyMaker'
import { Button, Card, KpiGrid, RowAction, RowMenu, SearchField } from './parts'
import { TABLE_EYEBROW } from './ui'
import type { Survey } from './data'
import type { SurveysState } from './useSurveys'
import { useSurveys } from './useSurveys'

// Below this the type, question count and the two row actions collide, so the
// table scrolls sideways in its own box rather than taking the page with it.
const MIN_WIDTH = 940

export function SurveysPage() {
  const s = useSurveys()

  // The maker is the page while it is open — a survey is built, not dialogued.
  if (s.makerFor) {
    return <SurveyMaker survey={s.makerSurvey} onBack={s.closeMaker} />
  }

  return (
    <div
      data-screen-label="Surveys"
      onClick={s.closeOverlays}
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
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-toolbar-gap)', flexWrap: 'wrap' }}>
        <SearchField value={s.query} onChange={(e) => s.setQuery(e.target.value)} placeholder="Search surveys" />
        <div style={{ flex: 1 }} />
        <Button primary onClick={() => s.openMaker('new')}>
          + New survey
        </Button>
        <Button
          onClick={() => s.toast('Export · CSV of every answer the post can see')}
          trailing={
            <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
              <Icon name="SvChevron" size={12} />
            </span>
          }
        >
          <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
            <Icon name="SvExport" size={16} />
          </span>
          Export
        </Button>
      </div>

      <KpiGrid items={KPIS} />

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: MIN_WIDTH }}>
            <div
              style={{
                display: 'flex',
                gap: 'var(--size-120)',
                padding: 'var(--size-80) var(--size-160)',
                background: 'var(--surface-subtle)',
                borderBottom: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-medium) var(--radius-medium) 0 0',
                ...TABLE_EYEBROW,
              }}
            >
              <div style={{ flex: 2, minWidth: 120 }}>Survey</div>
              <div style={{ width: 76, flexShrink: 0 }}>Type</div>
              <div style={{ flex: 2.4, minWidth: 110 }}>When it sends</div>
              <div style={{ width: 30, flexShrink: 0, textAlign: 'right' }}>Qs</div>
              <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>Resp · 7 d</div>
              <div style={{ width: 72, flexShrink: 0 }}>Status</div>
              <div style={{ width: 196, flexShrink: 0 }} />
              <div style={{ width: 28, flexShrink: 0 }} />
            </div>

            {s.visible.map((v, i) => (
              <SurveyRow key={v.id} v={v} s={s} flip={i >= s.visible.length - 1 && s.visible.length > 2} />
            ))}

            {s.visible.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-320)' }}>
                <span style={{ ...caption1, color: 'var(--text-secondary)' }}>No surveys match these filters</span>
                <span onClick={() => s.setQuery('')} style={{ ...caption1, color: 'var(--text-link)', cursor: 'pointer' }}>
                  Clear filters
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {s.sendFor && <SendDialog s={s} />}
      {s.toastText && <Toast>{s.toastText}</Toast>}
    </div>
  )
}

function SurveyRow({ v, s, flip }: { v: Survey; s: SurveysState; flip: boolean }) {
  const [hover, hoverProps] = useHover()
  const tone = STATUS_TONE[v.status]

  // Only an active survey can be sent, and only one with answers can be read.
  const canSend = v.status === 'Active'
  const canView = v.responses > 0
  // A survey holding answers is archived, never deleted.
  const canDelete = v.status === 'Draft' && v.responses === 0

  const items = [
    { label: 'Edit', act: () => s.openMaker(v.id) },
    { label: 'Duplicate', act: () => { s.setMenuFor(null); s.toast(`Duplicate: ${v.name}`) } },
    { label: 'Preview on my phone', act: () => { s.setMenuFor(null); s.toast(`Preview on my phone: ${v.name}`) } },
    { label: v.status === 'Active' ? 'Pause' : 'Activate', act: () => { s.setMenuFor(null); s.toast(`${v.status === 'Active' ? 'Pause' : 'Activate'}: ${v.name}`) } },
    { label: 'Archive', act: () => { s.setMenuFor(null); s.toast(`Archive: ${v.name}`) } },
    canDelete
      ? { label: 'Delete', danger: true, act: () => { s.setMenuFor(null); s.toast(`Delete: ${v.name}`) } }
      : { label: 'Delete', why: `Archive instead. This survey holds ${v.responses} answers.` },
  ]

  return (
    <div
      onClick={() => s.openMaker(v.id)}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-120)',
        minHeight: 40,
        padding: '0 var(--space-cell-x)',
        borderBottom: '1px solid var(--border-subtle)',
        ...body1,
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <div
        title={v.hoverNote || v.name}
        style={{
          flex: 2,
          minWidth: 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 'var(--weight-semibold)',
          color: v.status === 'Active' ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {v.name}
      </div>
      <div style={{ width: 76, flexShrink: 0, color: 'var(--text-secondary)' }}>{v.type}</div>
      <div style={{ flex: 2.4, minWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.fires}</div>
      <div style={{ width: 30, flexShrink: 0, textAlign: 'right' }}>{v.qs}</div>
      <div style={{ width: 80, flexShrink: 0, textAlign: 'right', color: v.respMuted ? 'var(--text-helper)' : 'var(--text-primary)' }}>
        {v.resp}
      </div>
      <div style={{ width: 72, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-40)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-circle)', background: tone.dot, flexShrink: 0 }} />
        <span style={{ color: tone.fg }}>{v.status}</span>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 196, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--size-60)' }}
      >
        <RowAction
          label="Send now"
          enabled={canSend}
          tone={{ bg: 'var(--primary-soft)', border: 'var(--blue-200)', fg: 'var(--text-link)', hoverBg: 'var(--blue-100)', strong: true }}
          title={canSend ? `Send ${v.name} now` : v.status === 'Draft' ? 'Activate it first. Drafts cannot be sent' : 'Archived. Activate it first'}
          onClick={() => s.openSend(v.id)}
        />
        <RowAction
          label="View answers"
          enabled={canView}
          tone={{ bg: 'var(--surface-card)', border: 'var(--border-default)', fg: 'var(--text-primary)', hoverBg: 'var(--surface-subtle)' }}
          title={canView ? `${v.responses} answers` : 'Has not been sent yet'}
          onClick={() => s.toast(`View answers: ${v.name}`)}
        />
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex' }}>
        <RowMenu
          flip={flip}
          open={s.menuFor === v.id}
          onToggle={(e) => {
            e.stopPropagation()
            s.setMenuFor(s.menuFor === v.id ? null : v.id)
          }}
          items={items}
        />
      </div>
    </div>
  )
}
