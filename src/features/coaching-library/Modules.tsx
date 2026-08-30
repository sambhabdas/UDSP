'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1 } from '../../ds/type'
import { GAPS, QUIZZES, VIDEOS, catTone } from './data'
import type { Module } from './data'
import { Button, Chip, Empty, GridHead, HeadCell, IconButton, Pager, SearchField, Toggle } from './parts'
import { CARD, MOD_COLS, NUM, TILE_LABEL } from './style'
import type { LibraryState } from './useCoachingLibrary'

export function Modules({ s }: { s: LibraryState }) {
  const tiles = [
    { label: 'Modules', value: String(s.activeModules.length), color: 'var(--blue-700)' },
    { label: 'Videos', value: String(VIDEOS.length), color: 'var(--text-primary)' },
    { label: 'Quizzes', value: String(QUIZZES.length), color: 'var(--text-primary)' },
    { label: 'Standards Without Module', value: String(GAPS.length), color: 'var(--warning-fg)' },
    { label: 'Completion', value: '80%', color: 'var(--success-fg)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-120)' }}>
        {tiles.map((t) => (
          <div key={t.label} style={{ boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', padding: 'var(--size-160)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--size-40)' }}>
              <span style={{ flex: 1, minWidth: 0, ...TILE_LABEL, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
            </div>
            <span style={{ fontSize: 28, lineHeight: '36px', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.3px', color: t.color, ...NUM }}>{t.value}</span>
          </div>
        ))}
      </div>

      {!s.hideGap && (
        <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--size-80)', padding: 'var(--size-100) var(--size-160)', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-medium)' }}>
          <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', color: 'var(--warning-fg)' }}>{GAPS.length} standards without coaching</span>
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>{GAPS.join(' · ')}</span>
          <a href="#" onClick={(e) => { e.preventDefault(); s.toastMsg('Opening Standards - pair modules to close the gap') }} style={{ ...body1, whiteSpace: 'nowrap' }}>Fix in Standards</a>
          <div style={{ flex: 1 }} />
          <div
            data-fx=""
            tabIndex={0}
            role="button"
            title="Dismiss"
            onClick={() => s.setHideGap(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 'var(--radius-small)', cursor: 'pointer', color: 'var(--warning-fg)' }}
          >
            <Icon name="FnDismiss" size={12} />
          </div>
        </div>
      )}

      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
          <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Modules</span>
          <div style={{ flex: 1 }} />
          <FiltersButton s={s} />
          <SearchField value={s.mq} onChange={s.setMq} placeholder="Search modules" width={220} />
          <Button kind="primary" onClick={() => { s.setDlg('module'); s.setMe({ mode: 'new', idx: -1, name: '', video: null, quiz: null, desc: '', ack: '' }) }}>+ New Module</Button>
        </div>

        <GridHead cols={MOD_COLS}>
          <HeadCell>Module</HeadCell>
          <HeadCell>Video</HeadCell>
          <HeadCell>Quiz</HeadCell>
          <HeadCell>Paired Standards</HeadCell>
          <HeadCell align="right">30 Days</HeadCell>
          <HeadCell align="right">Completion</HeadCell>
          <HeadCell>Active</HeadCell>
          <HeadCell align="center">Actions</HeadCell>
        </GridHead>

        {s.pageModules.slice.map(({ m, i }) => (
          <Row key={m.name} s={s} m={m} i={i} />
        ))}
        {s.modRows.length === 0 && <Empty>No modules match.</Empty>}
        <Pager page={s.pageModules} setPage={s.setMPg} />
      </div>
    </div>
  )
}

export function FiltersButton({ s }: { s: LibraryState }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={s.openFilters}
      style={{
        boxSizing: 'border-box', height: 'var(--control-height)', display: 'flex', alignItems: 'center',
        gap: 'var(--size-60)', padding: '0 var(--size-80)', borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'transparent',
        color: s.filterCount ? 'var(--blue-700)' : 'var(--text-primary)',
        ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}><Icon name="FnFilter" size={16} /></span>
      Filters
      {s.filterCount > 0 && (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 var(--size-40)', borderRadius: 'var(--radius-pill)', background: 'var(--primary)', color: 'var(--text-inverse)', ...caption1, fontWeight: 'var(--weight-semibold)' }}>
          {s.filterCount}
        </span>
      )}
    </div>
  )
}

function Row({ s, m, i }: { s: LibraryState; m: Module; i: number }) {
  // A module whose video source is broken has its assignments paused, unless
  // the source has since been replaced.
  const paused = !s.fixedVideos[m.video ?? ''] && VIDEOS.some((x) => x.title === m.video && x.broken)
  const lockedActive = !!m.draft || m.pairs.length > 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: MOD_COLS, columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 48, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)', opacity: m.retired ? '.55' : '1' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
        <NameLink name={m.name} onClick={() => { s.closeMenu(); s.setDlg('module'); s.setMe({ mode: 'edit', idx: i, name: m.name, video: m.video, quiz: m.quiz, desc: m.desc ?? '', ack: m.ack ?? '' }) }} />
        {m.draft && <Chip small label="Draft" bg="var(--warning-bg)" fg="var(--warning-fg)" />}
        {m.retired && <Chip small label="Retired" bg="var(--surface-subtle)" fg="var(--text-secondary)" border="var(--border-default)" />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', minWidth: 0 }}>
        <span style={{ ...body1, color: m.video ? 'var(--text-primary)' : 'var(--warning-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.video ? `${m.video} · ${m.dur}` : 'None'}
        </span>
        {paused && <Chip label="Paused" bg="var(--warning-bg)" fg="var(--warning-fg)" title="Assignments paused - the video is unavailable" />}
      </div>

      <span style={{ ...body1, color: m.quizMeta ? 'var(--text-primary)' : 'var(--warning-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {m.quizMeta ?? 'None'}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', minWidth: 0, flexWrap: 'wrap' }}>
        {m.pairs.map(([name, cat]) => {
          const t = catTone(cat)
          return <Chip key={name} label={name} bg={t.bg} fg={t.fg} />
        })}
        {m.pairs.length === 0 && <span style={{ ...body1, color: 'var(--text-secondary)' }}>-</span>}
      </div>

      <a href="#" onClick={(e) => { e.preventDefault(); s.toastMsg(`Opening Events · Open · Module ${m.name}`) }} style={{ textAlign: 'right', ...body1, ...NUM }}>{m.d30}</a>

      <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: m.compl === null ? 'var(--text-disabled)' : m.compl >= 80 ? 'var(--success-fg)' : 'var(--warning-fg)', ...NUM }}>
        {m.compl === null ? '-' : `${m.compl}%`}
      </span>

      <div style={{ display: 'flex' }}>
        <Toggle
          on={m.active}
          disabled={lockedActive}
          title={m.draft ? 'Attach a video and a quiz first' : m.pairs.length ? 'Unpair in Standards first' : undefined}
          onClick={() => {
            if (m.draft) { s.toastMsg('Attach a video and a quiz first'); return }
            if (m.pairs.length) { s.toastMsg('Unpair in Standards first - a paired standard never silently loses its coaching'); return }
            s.setModule(i, { ...m, active: !m.active })
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '76px 28px 28px', columnGap: 'var(--size-80)', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          kind="primary"
          small
          onClick={() => {
            if (m.retired) { s.toastMsg(`${m.name} is retired - unretire it before assigning`); return }
            s.closeMenu()
            s.setDlg('assign')
            s.setAsg({ module: m.name, da: null, due: '7' })
          }}
        >
          Assign
        </Button>
        <IconButton
          icon="PgLink"
          color={m.retired ? 'var(--text-disabled)' : 'var(--primary)'}
          title={m.retired ? 'Retired - unretire it to link a standard' : m.pairs.length ? 'Already paired - unpair in Standards first' : 'Link a standard'}
          onClick={(e) => {
            if (m.retired) { s.toastMsg(`${m.name} is retired - unretire it before linking`); return }
            if (m.pairs.length) { s.setDlg('pairs'); s.setPairFor({ name: m.name, pairs: m.pairs }); s.closeMenu(); return }
            s.openMenu(e, 'linkStd', { moduleIndex: i })
          }}
        />
        <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'modKebab', { moduleIndex: i })} />
      </div>
    </div>
  )
}

function NameLink({ name, onClick }: { name: string; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <span
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{ ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', textDecoration: hover ? 'underline' : 'none' }}
      {...hoverProps}
    >
      {name}
    </span>
  )
}
