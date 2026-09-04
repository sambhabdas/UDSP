'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1, caption1, caption1Strong, subtitle1 } from '../../ds/type'
import { catTone, initialsOf, thumbCss, usedLabel } from './data'
import { Button, Checkbox, Chip, Field, IconButton, Input, PickerField, PlayBadge, TextArea } from './parts'
import { FIELD_LABEL, HEAD, NUM } from './style'
import type { LibraryState } from './useCoachingLibrary'

const TITLES: Record<string, string> = {
  retire: 'Retire Module', vdetail: 'Video', pairs: 'Paired Standard', assign: 'Assign Coaching', video: 'Add Video',
}

const SAVES: Record<string, string> = {
  retire: 'Retire', vdetail: 'Save', pairs: 'Open in Standards', assign: 'Assign', video: 'Add Video',
}

export function Dialogs({ s }: { s: LibraryState }) {
  if (!s.dlg) return null
  const isModule = s.dlg === 'module'
  const title = isModule ? (s.me?.mode === 'new' ? 'New Module' : 'Edit Module') : TITLES[s.dlg]
  const save = isModule ? 'Save Module' : SAVES[s.dlg]

  return (
    <div onClick={s.closeDlg} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
      <div
        data-dialog-card=""
        onClick={(e) => e.stopPropagation()}
        style={{ boxSizing: 'border-box', width: 560, maxHeight: '84vh', background: 'var(--surface-raised)', borderRadius: 'var(--radius-large)', boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ flexShrink: 0, boxSizing: 'border-box', height: 48, display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: '0 var(--size-200)' }}>
          <span style={subtitle1}>{title}</span>
          <div style={{ flex: 1 }} />
          <IconButton icon="FnDismiss" onClick={s.closeDlg} size={32} />
        </div>

        <div data-rsp-page="" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--size-200)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
          {isModule && <ModuleForm s={s} />}
          {s.dlg === 'retire' && <Retire s={s} />}
          {s.dlg === 'assign' && <Assign s={s} />}
          {s.dlg === 'pairs' && <Pairs s={s} />}
          {s.dlg === 'vdetail' && <VideoDetail s={s} />}
          {s.dlg === 'video' && <AddVideo s={s} />}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160) var(--size-200)', borderTop: '1px solid var(--border-subtle)' }}>
          {s.dlg === 'vdetail' && (
            <>
              <Button onClick={() => replaceSource(s)}>Replace Source</Button>
              <Button danger onClick={() => archiveFromDetail(s)}>{s.vd && s.archived[s.vd.title] ? 'Unarchive' : 'Archive'}</Button>
              <div style={{ width: 1, height: 20, background: 'var(--border-default)' }} />
            </>
          )}
          <div style={{ flex: 1 }} />
          {s.dlg === 'pairs'
            ? (
              <>
                <Button onClick={() => { const p = s.pairFor; s.closeDlg(); if (p) s.toastMsg(`Opening Standards · ${p.pairs[0][0]}`) }}>Open in Standards</Button>
                <Button kind="primary" onClick={s.closeDlg}>Close</Button>
              </>
            )
            : (
              <>
                <Button onClick={s.closeDlg}>Cancel</Button>
                <Button kind="primary" onClick={() => saveDialog(s)}>{save}</Button>
              </>
            )}
        </div>
      </div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div data-rsp-c2="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--size-160)' }}>{children}</div>
}

/** A module is a draft until it has both a video and a quiz. */
function ModuleForm({ s }: { s: LibraryState }) {
  const me = s.me
  if (!me) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
      <Field label="Name">
        <Input value={me.name} onChange={(v) => s.setMe({ ...me, name: v })} placeholder="Module name" />
      </Field>
      <Row>
        <Field
          label="Video"
          action={
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); s.setMeStash(me); s.setDlg('video'); s.setV({ file: '', title: '', cat: 'Safety', url: '' }) }}
              style={caption1}
            >
              + Add Video
            </a>
          }
        >
          <PickerField label={me.video ?? 'Pick a video'} color={me.video ? 'var(--text-primary)' : 'var(--text-helper)'} onClick={(e) => s.openMenu(e, 'meVideo')} />
        </Field>
        <Field
          label="Quiz"
          action={
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                s.setMeStash(me)
                s.setDlg(null)
                s.setTab('quizzes')
                s.openMaker(null, [])
                s.toastMsg('Build the quiz - saving returns you to the module editor')
              }}
              style={caption1}
            >
              + New Quiz
            </a>
          }
        >
          <PickerField label={me.quiz ?? 'Pick a quiz'} color={me.quiz ? 'var(--text-primary)' : 'var(--text-helper)'} onClick={(e) => s.openMenu(e, 'meQuiz')} />
        </Field>
      </Row>
      <Field label="Description">
        <TextArea value={me.desc} onChange={(v) => s.setMe({ ...me, desc: v })} placeholder="Shown with the assignment" />
      </Field>
      <Field label="Acknowledgement Statement">
        <TextArea value={me.ack} onChange={(v) => s.setMe({ ...me, ack: v })} placeholder="Blank uses the product default statement" height={76} />
      </Field>
    </div>
  )
}

function Retire({ s }: { s: LibraryState }) {
  const m = s.retireIdx !== null ? s.modules[s.retireIdx] : null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-160)' }}>
      <span style={body1}>{m ? `${m.name} will be unpaired everywhere and auto coach turned off on its standards.` : ''}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)' }}>
        <Checkbox on={s.retireCancel} onClick={() => s.setRetireCancel(!s.retireCancel)} />
        <span style={body1}>Cancel its {m ? m.d30 : 0} open assignments too</span>
      </div>
    </div>
  )
}

function Assign({ s }: { s: LibraryState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{s.asg.module}</span>
      <Row>
        <Field label="Associate">
          <PickerField label={s.asg.da ?? 'Pick an associate'} color={s.asg.da ? 'var(--text-primary)' : 'var(--text-helper)'} onClick={(e) => s.openMenu(e, 'asgDa')} />
        </Field>
        <Field label="Due Within">
          <Input value={s.asg.due} onChange={(v) => s.setAsg({ ...s.asg, due: v })} suffix="days" numeric />
        </Field>
      </Row>
    </div>
  )
}

function Pairs({ s }: { s: LibraryState }) {
  const p = s.pairFor
  if (!p) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{p.name}</span>
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 120px 90px 100px', columnGap: 'var(--size-100)', alignItems: 'center', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', padding: 'var(--size-60) var(--size-120)' }}>
          {['Standard', 'Category', 'Auto Coach', 'Due'].map((h) => <span key={h} style={HEAD}>{h}</span>)}
        </div>
        {p.pairs.map(([name, cat]) => {
          const t = catTone(cat)
          return (
            <div key={name} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 120px 90px 100px', columnGap: 'var(--size-100)', alignItems: 'center', minHeight: 44, padding: 'var(--size-60) var(--size-120)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{name}</span>
              <span><Chip label={cat} bg={t.bg} fg={t.fg} /></span>
              <span style={{ ...body1, color: 'var(--success-fg)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap' }}>On</span>
              <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>3 days</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * The video record: a poster frame you can swap, the title and category, and
 * what depends on it.
 */
function VideoDetail({ s }: { s: LibraryState }) {
  const vd = s.vd
  if (!vd) return null
  const frames = [0, 1, 2, 3].filter((i) => !vd.removed[i])
  // Removing a frame adds another upload tile in its place.
  const uploadTiles = 1 + Object.keys(vd.removed).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
      <div
        data-fx=""
        tabIndex={0}
        role="button"
        onClick={() => s.toastMsg(`Playing ${vd.title}`)}
        style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 'var(--radius-medium)', background: thumbCss(vd.cat, vd.thumb), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
      >
        <span style={{ position: 'absolute', left: 16, top: 10, fontSize: 56, lineHeight: '64px', fontWeight: 'var(--weight-semibold)', color: 'rgba(255,255,255,.28)', letterSpacing: '-1px' }}>
          {initialsOf(vd.newTitle || vd.title)}
        </span>
        <PlayBadge size={56} />
        <span style={{ position: 'absolute', right: 10, bottom: 10, padding: '2px 8px', borderRadius: 'var(--radius-small)', background: 'rgba(17,24,39,.8)', color: 'var(--text-inverse)', ...caption1, ...NUM }}>{vd.dur}</span>
      </div>

      <Row>
        <Field label="Title">
          <Input value={vd.newTitle} onChange={(v) => s.setVd({ ...vd, newTitle: v })} />
        </Field>
        <Field label="Category">
          <PickerField label={vd.cat} onClick={(e) => s.openMenu(e, 'vdCat')} />
        </Field>
      </Row>

      <Field label="Thumbnail">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--size-100)' }}>
          {frames.map((i) => (
            <div
              key={i}
              data-fx=""
              tabIndex={0}
              role="button"
              onClick={() => s.setVd({ ...vd, thumb: i })}
              style={{ position: 'relative', boxSizing: 'border-box', aspectRatio: '16/9', borderRadius: 'var(--radius-small)', background: thumbCss(vd.cat, i), border: `2px solid ${vd.thumb === i ? 'var(--primary)' : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'flex-end', padding: 'var(--size-40) var(--size-60)' }}
            >
              <div
                data-fx=""
                tabIndex={0}
                role="button"
                title="Remove frame"
                onClick={(e) => {
                  e.stopPropagation()
                  const removed = { ...vd.removed, [i]: true }
                  let thumb = vd.thumb
                  if (thumb === i) {
                    const left = [0, 1, 2, 3].filter((x) => !removed[x])
                    thumb = left.length ? left[0] : 4
                  }
                  s.setVd({ ...vd, removed, thumb })
                  s.toastMsg('Frame removed - upload a thumbnail in its place')
                }}
                style={{ position: 'absolute', top: 4, right: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: 'rgba(17,24,39,.75)', color: 'var(--text-inverse)', cursor: 'pointer' }}
              >
                <Icon name="FnDismiss" size={10} />
              </div>
              {vd.thumb === i && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: 'var(--primary)', color: 'var(--text-inverse)' }}>
                  <Icon name="FnCheck" size={12} />
                </span>
              )}
            </div>
          ))}
          {Array.from({ length: uploadTiles }, (_, idx) => {
            const uploaded = idx === 0 && vd.thumb === 4
            return (
              <UploadTile
                key={idx}
                label={uploaded ? vd.upName ?? 'Uploaded' : 'Upload'}
                uploaded={uploaded}
                onClick={() => { s.setVd({ ...vd, thumb: 4, upName: 'thumbnail-01.jpg' }); s.toastMsg('thumbnail-01.jpg uploaded - selected as the thumbnail') }}
              />
            )
          })}
        </div>
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-100)', padding: 'var(--size-100) var(--size-120)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)' }}>
        <span style={FIELD_LABEL}>Used In</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...body1, color: vd.used ? 'var(--text-primary)' : 'var(--warning-fg)' }}>{usedLabel(vd.used)}</span>
      </div>
    </div>
  )
}

function UploadTile({ label, uploaded, onClick }: { label: string; uploaded: boolean; onClick: () => void }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={onClick}
      style={{
        boxSizing: 'border-box', aspectRatio: '16/9', borderRadius: 'var(--radius-small)',
        border: `2px ${uploaded ? 'solid' : 'dashed'} ${uploaded ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: hover ? 'var(--surface-subtle)' : uploaded ? 'var(--blue-50)' : 'var(--surface-card)',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2, color: 'var(--text-secondary)',
      }}
      {...hoverProps}
    >
      <span style={{ display: 'flex' }}><Icon name="FnUpload" size={16} /></span>
      <span style={caption1Strong}>{label}</span>
    </div>
  )
}

function AddVideo({ s }: { s: LibraryState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-200)' }}>
      <div
        data-fx=""
        tabIndex={0}
        role="button"
        onClick={() => s.setV({ ...s.v, file: 'seatbelt-training-v2.mp4 · 48 MB' })}
        style={{ boxSizing: 'border-box', height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--size-60)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-medium)', background: 'var(--surface-subtle)', cursor: 'pointer' }}
      >
        <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>Drop an MP4 here - or browse</span>
        <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{s.v.file || 'MP4 up to 500 MB'}</span>
      </div>
      <Row>
        <Field label="Title">
          <Input value={s.v.title} onChange={(x) => s.setV({ ...s.v, title: x })} placeholder="Video title" />
        </Field>
        <Field label="Category">
          <PickerField label={s.v.cat} onClick={(e) => s.openMenu(e, 'vCat')} />
        </Field>
      </Row>
      <Field label="Or Link">
        <Input value={s.v.url} onChange={(x) => s.setV({ ...s.v, url: x })} placeholder="YouTube or Vimeo URL" />
      </Field>
    </div>
  )
}

/** Replacing a broken source resumes the assignments it had paused. */
function replaceSource(s: LibraryState) {
  const vd = s.vd
  if (!vd) return
  if (vd.broken) s.setFixedVideos({ ...s.fixedVideos, [vd.title]: true })
  s.setDlg('video')
  s.setV({ file: '', title: vd.title, cat: vd.cat, url: '' })
  s.setVd(null)
  if (vd.broken) s.toastMsg(`${vd.title} replaced - paused assignments have resumed`)
}

function archiveFromDetail(s: LibraryState) {
  const vd = s.vd
  if (!vd) return
  const next = { ...s.archived }
  const on = !next[vd.title]
  if (on) next[vd.title] = true
  else delete next[vd.title]
  s.setArchived(next)
  s.closeDlg()
  s.toastMsg(`${vd.title}${on ? ' archived' : ' unarchived'}`)
}

function saveDialog(s: LibraryState) {
  if (s.dlg === 'assign') {
    if (!s.asg.da) { s.toastMsg('Pick an associate'); return }
    const { module, da, due } = s.asg
    s.closeDlg()
    s.toastMsg(`${module} assigned to ${da} · due in ${due} days - visible in Events · Open`)
    return
  }

  if (s.dlg === 'vdetail') {
    const vd = s.vd
    if (!vd || !vd.newTitle.trim()) { s.toastMsg('Title the video first'); return }
    s.setThumbs({ ...s.thumbs, [vd.title]: vd.thumb })
    s.closeDlg()
    s.toastMsg('Video saved')
    return
  }

  if (s.dlg === 'retire') {
    const i = s.retireIdx
    if (i === null) return
    const m = s.modules[i]
    s.setModule(i, { ...m, retired: true, active: false, pairs: [] })
    const cancelled = s.retireCancel
    s.closeDlg()
    s.toastMsg(`${m.name} retired${cancelled ? ` - ${m.d30} open assignments cancelled` : ' - in-flight assignments continue'}`)
    return
  }

  if (s.dlg === 'module') {
    const me = s.me
    if (!me) return
    if (me.name.trim().length < 2) { s.toastMsg('Name the module first'); return }
    const draft = !me.video || !me.quiz
    if (me.mode === 'new') {
      s.setModules(s.modules.concat([{
        name: me.name.trim(), video: me.video, dur: '0:00', quiz: me.quiz,
        quizMeta: me.quiz ? '5 questions · Pass 4/5' : null,
        pairs: [], d30: 0, compl: null, active: false, draft, desc: me.desc, ack: me.ack,
      }]))
    } else {
      const old = s.modules[me.idx]
      s.setModule(me.idx, {
        ...old,
        name: me.name.trim(), video: me.video, quiz: me.quiz,
        quizMeta: me.quiz ? old.quizMeta ?? '5 questions · Pass 4/5' : null,
        draft, desc: me.desc, ack: me.ack,
      })
    }
    s.closeDlg()
    s.toastMsg(draft ? 'Saved as draft - a module needs a video and a quiz to go active' : 'Module saved')
    return
  }

  // Add Video - which may have been reached from inside the module editor.
  if (!s.v.title.trim()) { s.toastMsg('Title the video first'); return }
  const title = s.v.title.trim()
  if (s.meStash) {
    const stash = s.meStash
    s.setDlg('module')
    s.setMe({ ...stash, video: title })
    s.setMeStash(null)
    s.toastMsg(`${title} added and picked for the module`)
    return
  }
  s.setDlg(null)
  s.toastMsg(`${title} added to the library`)
}
