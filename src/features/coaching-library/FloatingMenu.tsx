'use client'

import { Icon } from '../../ds/icons/Icon'
import { useHover } from '../../ds/useHover'
import { body1 } from '../../ds/type'
import { CATS, DAS, QUIZZES, STD_POOL, VIDEOS, makerSeed } from './data'
import type { LibraryState } from './useCoachingLibrary'

interface Item {
  label: string
  selected?: boolean
  pick: () => void
}

export function FloatingMenu({ s }: { s: LibraryState }) {
  const m = s.menu
  if (!m) return null
  const items = itemsFor(s)
  return (
    <div
      data-pop=""
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', left: m.x, top: m.y, width: m.w, boxSizing: 'border-box',
        maxHeight: 300, overflow: 'hidden auto', padding: 'var(--size-40)',
        background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-medium)', boxShadow: 'var(--elevation-menu)', zIndex: 90,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {items.map((it, i) => <Row key={`${it.label}-${i}`} item={it} />)}
    </div>
  )
}

function Row({ item }: { item: Item }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={(e) => { e.stopPropagation(); item.pick() }}
      style={{
        boxSizing: 'border-box', minHeight: 'var(--row-height)', flexShrink: 0, display: 'flex',
        alignItems: 'center', gap: 'var(--size-80)', padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : item.selected ? 'var(--blue-50)' : 'transparent',
        ...body1,
        fontWeight: item.selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: item.selected ? 'var(--blue-700)' : 'var(--text-primary)',
        cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ width: 16, flexShrink: 0, display: 'inline-flex', color: 'var(--blue-700)' }}>
        {item.selected && <Icon name="FnCheck" size={16} />}
      </span>
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
    </div>
  )
}

function itemsFor(s: LibraryState): Item[] {
  const m = s.menu
  if (!m) return []

  if (m.kind === 'modKebab') return moduleItems(s)

  if (m.kind === 'linkStd') {
    const i = m.moduleIndex!
    const mod = s.modules[i]
    // A standard can only carry one module, so anything already paired is out.
    const taken: Record<string, boolean> = {}
    s.modules.forEach((x) => x.pairs.forEach((p) => { taken[p[0]] = true }))
    const opts = STD_POOL.filter((p) => !taken[p[0]])
    if (!opts.length) return [{ label: 'No unlinked standards', pick: () => s.closeMenu() }]
    return opts.map(([name, cat]) => ({
      label: name,
      pick: () => {
        s.setModule(i, { ...mod, pairs: [[name, cat]] })
        s.closeMenu()
        s.toastMsg(`${name} linked to ${mod.name} - auto coach rules live in Standards`)
      },
    }))
  }

  if (m.kind === 'asgDa') {
    const sel = s.asg.da
    let opts = DAS.slice()
    if (sel) opts = [sel, ...opts.filter((o) => o !== sel)]
    return opts.map((d) => ({ label: d, selected: sel === d, pick: () => { s.setAsg({ ...s.asg, da: d }); s.closeMenu() } }))
  }

  if (m.kind === 'vidKebab') return videoItems(s)

  if (m.kind === 'quizKebab') {
    const name = m.quizName!
    return [
      { label: 'Edit', pick: () => { const z = QUIZZES.find((x) => x.name === name)!; s.closeMenu(); s.openMaker(z, makerSeed()) } },
      { label: 'Duplicate', pick: () => { s.closeMenu(); s.toastMsg(`${name} duplicated`) } },
      { label: 'Delete', pick: () => { s.closeMenu(); s.toastMsg('Blocked - this quiz is used in a module') } },
    ]
  }

  if (m.kind === 'meVideo') {
    return VIDEOS.map((v) => ({
      label: v.title,
      selected: s.me?.video === v.title,
      pick: () => { if (s.me) s.setMe({ ...s.me, video: v.title }); s.closeMenu() },
    }))
  }

  if (m.kind === 'meQuiz') {
    return QUIZZES.map((z) => ({
      label: z.name,
      selected: s.me?.quiz === z.name,
      pick: () => { if (s.me) s.setMe({ ...s.me, quiz: z.name }); s.closeMenu() },
    }))
  }

  if (m.kind === 'vdCat') {
    return CATS.map((c) => ({ label: c, selected: s.vd?.cat === c, pick: () => { if (s.vd) s.setVd({ ...s.vd, cat: c }); s.closeMenu() } }))
  }

  if (m.kind === 'vCat') {
    return CATS.map((c) => ({ label: c, selected: s.v.cat === c, pick: () => { s.setV({ ...s.v, cat: c }); s.closeMenu() } }))
  }

  return []
}

function moduleItems(s: LibraryState): Item[] {
  const i = s.menu!.moduleIndex!
  const m = s.modules[i]

  const items: Item[] = [
    { label: 'Edit', pick: () => { s.closeMenu(); s.setDlg('module'); s.setMe({ mode: 'edit', idx: i, name: m.name, video: m.video, quiz: m.quiz, desc: m.desc ?? '', ack: m.ack ?? '' }) } },
    { label: 'Preview', pick: () => { s.closeMenu(); s.toastMsg(m.draft ? 'Attach a video and a quiz first' : 'Preview - video, quiz, then the acknowledgement screen') } },
    {
      label: 'Duplicate',
      pick: () => {
        const next = s.modules.slice()
        // A copy starts unpaired and inactive - the original keeps the pairing.
        next.splice(i + 1, 0, { ...m, name: `${m.name} (Copy)`, pairs: [], d30: 0, compl: null, active: false })
        s.setModules(next)
        s.closeMenu()
        s.toastMsg(`${m.name} duplicated`)
      },
    },
    {
      label: 'Assign to Associate',
      pick: () => {
        if (m.retired) { s.closeMenu(); s.toastMsg(`${m.name} is retired - unretire it before assigning`); return }
        s.closeMenu()
        s.setDlg('assign')
        s.setAsg({ module: m.name, da: null, due: '7' })
      },
    },
  ]

  if (!m.pairs.length && !m.retired) {
    items.push({ label: 'Link Standard', pick: () => s.setMenuKind('linkStd') })
  }

  if (m.retired) {
    items.push({
      label: 'Unretire',
      pick: () => {
        s.setModule(i, { ...m, retired: false, active: false })
        s.closeMenu()
        s.toastMsg(`${m.name} unretired - turn Active on to use it again`)
      },
    })
  } else {
    items.push({ label: 'Retire', pick: () => { s.closeMenu(); s.setDlg('retire'); s.setRetireIdx(i); s.setRetireCancel(false) } })
  }

  // Deleting is only offered while nothing is in flight against it.
  if (m.d30 === 0) {
    items.push({
      label: 'Delete',
      pick: () => {
        s.setModules(s.modules.filter((_, mi) => mi !== i))
        s.closeMenu()
        s.toastMsg(`${m.name} deleted`)
      },
    })
  }

  return items
}

function videoItems(s: LibraryState): Item[] {
  const title = s.menu!.title!
  const isArchived = !!s.archived[title]
  return [
    { label: 'Preview', pick: () => { s.closeMenu(); s.toastMsg(`Playing ${title}`) } },
    { label: 'Edit Title and Tags', pick: () => { const v = VIDEOS.find((x) => x.title === title)!; s.openVideoDetail(v) } },
    { label: 'Replace Source', pick: () => { s.closeMenu(); s.setDlg('video'); s.setV({ file: '', title, cat: 'Safety', url: '' }) } },
    isArchived
      ? {
        label: 'Unarchive',
        pick: () => {
          const next = { ...s.archived }
          delete next[title]
          s.setArchived(next)
          s.closeMenu()
          s.toastMsg(`${title} restored to the library`)
        },
      }
      : {
        label: 'Archive',
        pick: () => {
          const v = VIDEOS.find((x) => x.title === title)
          // Archiving a video a module still uses would break that module.
          if (v?.used) { s.closeMenu(); s.toastMsg('Blocked - unlink it from its module first'); return }
          s.setArchived({ ...s.archived, [title]: true })
          s.closeMenu()
          s.toastMsg(`${title} archived`)
        },
      },
  ]
}
