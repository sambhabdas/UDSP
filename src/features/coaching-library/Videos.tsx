'use client'

import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong } from '../../ds/type'
import { addedOf, catTone, initialsOf, thumbCss, usedLabel } from './data'
import type { Video } from './data'
import { Button, Chip, DotChip, Empty, GridHead, HeadCell, IconButton, Pager, PlayBadge, SearchField } from './parts'
import { CARD, NUM, VID_COLS } from './style'
import { FiltersButton } from './Modules'
import type { LibraryState } from './useCoachingLibrary'
import { Icon } from '../../ds/icons/Icon'

/** Videos — the same library seen as a table or as poster-frame cards. */
export function Videos({ s }: { s: LibraryState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
          <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Videos</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', height: 'var(--control-height)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
            <ViewButton icon="PgGrid" title="Gallery" on={s.vView === 'gallery'} onClick={() => s.setVView('gallery')} />
            <div style={{ width: 1, background: 'var(--border-default)' }} />
            <ViewButton icon="PgTable" title="List" on={s.vView === 'list'} onClick={() => s.setVView('list')} />
          </div>
          <FiltersButton s={s} />
          <SearchField value={s.vq} onChange={s.setVq} placeholder="Search videos" width={220} />
          <Button kind="primary" onClick={() => { s.setDlg('video'); s.setV({ file: '', title: '', cat: 'Safety', url: '' }) }}>+ Add Video</Button>
        </div>

        {s.vView === 'gallery' && (
          <div style={{ padding: 'var(--size-120) var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
            <UploadStrip onClick={() => { s.setDlg('video'); s.setV({ file: '', title: '', cat: 'Safety', url: '' }) }} />
          </div>
        )}

        {s.vView === 'list' && (
          <>
            <GridHead cols={VID_COLS}>
              <HeadCell>Video</HeadCell>
              <HeadCell>Title</HeadCell>
              <HeadCell>Category</HeadCell>
              <HeadCell align="right">Duration</HeadCell>
              <HeadCell>Added</HeadCell>
              <HeadCell>Used In</HeadCell>
              <HeadCell>Status</HeadCell>
              <HeadCell align="center">Actions</HeadCell>
            </GridHead>
            {s.pageVideos.slice.map((x) => <ListRow key={x.title} s={s} v={x} />)}
            {s.videosShown.length === 0 && <Empty>No videos match.</Empty>}
            <Pager page={s.pageVideos} setPage={s.setVPg} />
          </>
        )}
      </div>

      {s.vView === 'gallery' && s.videoGroups.map((g) => (
        <div key={g.label} style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-120) var(--size-160)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: catTone(g.label).fg }} />
            <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>{g.label}</span>
            <span style={{ ...caption1, color: 'var(--text-secondary)', ...NUM }}>{g.cards.length}</span>
          </div>
          <div data-rsp-kpi="" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-120)', padding: 'var(--size-120) var(--size-160) var(--size-160) var(--size-160)', borderTop: '1px solid var(--border-default)' }}>
            {g.cards.map((x) => <Card key={x.title} s={s} v={x} />)}
          </div>
        </div>
      ))}

      {s.vView === 'gallery' && s.videosShown.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, ...CARD }}>
          <span style={{ ...body1, color: 'var(--text-secondary)' }}>No videos match.</span>
        </div>
      )}
    </div>
  )
}

function ViewButton({ icon, title, on, onClick }: { icon: string; title: string; on: boolean; onClick: () => void }) {
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      title={title}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36,
        background: on ? 'var(--blue-50)' : 'var(--surface-card)',
        color: on ? 'var(--blue-700)' : 'var(--text-secondary)', cursor: 'pointer',
      }}
    >
      <Icon name={icon} size={16} />
    </div>
  )
}

function UploadStrip({ onClick }: { onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--size-80)', minHeight: 44, border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-medium)', color: 'var(--text-secondary)', cursor: 'pointer',
        background: hover ? 'var(--surface-subtle)' : undefined,
      }}
      {...hoverProps}
    >
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>+ Upload or Link Video</span>
      <span style={caption1}>MP4 · YouTube · Vimeo</span>
    </div>
  )
}

function ListRow({ s, v }: { s: LibraryState; v: Video }) {
  const [hover, hoverProps] = useHover()
  const t = catTone(v.cat)
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={() => s.openVideoDetail(v)}
      style={{
        display: 'grid', gridTemplateColumns: VID_COLS, columnGap: 'var(--size-100)', alignItems: 'center',
        minHeight: 56, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer', background: hover ? 'var(--surface-subtle)' : undefined,
      }}
      {...hoverProps}
    >
      <div style={{ position: 'relative', width: 72, aspectRatio: '16/9', borderRadius: 'var(--radius-small)', background: thumbCss(v.cat, s.thumbs[v.title] ?? 0), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ width: 0, height: 0, borderLeft: '9px solid rgba(255,255,255,.92)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: 2 }} />
      </div>
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</span>
      <span><Chip label={v.cat} bg={t.bg} fg={t.fg} /></span>
      <span style={{ textAlign: 'right', ...body1, ...NUM }}>{v.dur}</span>
      <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{addedOf(v.title)}</span>
      <span style={{ ...body1, color: v.used ? 'var(--text-secondary)' : 'var(--warning-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{usedLabel(v.used)}</span>
      <span>
        {v.broken
          ? <DotChip label="Unavailable" bg="var(--danger-bg)" fg="var(--danger-fg)" dot="var(--danger-accent)" />
          : <DotChip label="Ready" bg="var(--success-bg)" fg="var(--success-fg)" dot="var(--success-accent)" />}
      </span>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--size-40)' }}>
        <IconButton icon="FnEdit" title="Edit title and tags" onClick={(e) => { e.stopPropagation(); s.openVideoDetail(v) }} />
        <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'vidKebab', { title: v.title })} />
      </div>
    </div>
  )
}

function Card({ s, v }: { s: LibraryState; v: Video }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={() => s.openVideoDetail(v)}
      style={{
        boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
        border: `1px solid ${hover ? 'var(--primary)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-medium)', overflow: 'hidden', cursor: 'pointer', background: 'var(--surface-card)',
      }}
      {...hoverProps}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: thumbCss(v.cat, s.thumbs[v.title] ?? 0), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', left: 8, top: 4, fontSize: 28, lineHeight: '36px', fontWeight: 'var(--weight-semibold)', color: 'rgba(255,255,255,.28)' }}>{initialsOf(v.title)}</span>
        <PlayBadge size={30} />
        <span style={{ position: 'absolute', right: 6, bottom: 6, padding: '1px 5px', borderRadius: 'var(--radius-small)', background: 'rgba(17,24,39,.8)', color: 'var(--text-inverse)', ...caption1, ...NUM }}>{v.dur}</span>
        {v.broken && (
          <span style={{ position: 'absolute', left: 6, bottom: 6, display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 var(--size-60)', borderRadius: 'var(--radius-medium)', background: 'var(--danger-bg)', color: 'var(--danger-fg)', ...caption1Strong }}>
            Unavailable
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-40)', padding: 'var(--size-80) var(--size-100)' }}>
        <span style={{ flex: 1, minWidth: 0, ...caption1Strong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</span>
        <IconButton icon="FnEdit" size={24} title="Edit title and tags" onClick={(e) => { e.stopPropagation(); s.openVideoDetail(v) }} />
        <IconButton icon="FnMore" size={24} onClick={(e) => s.openMenu(e, 'vidKebab', { title: v.title })} />
      </div>
    </div>
  )
}
