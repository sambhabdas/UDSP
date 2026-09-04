'use client'

import { useCallback, useMemo, useState } from 'react'
import { useToast, anchorTo, paginate } from '../../ds/hooks'
import {
  CATS, PAGE_SIZE, QUIZZES, SEED_ARCHIVED, SEED_MODULES, VIDEOS, statusOf,
} from './data'
import type { Module, Quiz, Video } from './data'

export type Tab = 'modules' | 'videos' | 'quizzes'
export type DialogKind = 'module' | 'video' | 'retire' | 'vdetail' | 'assign' | 'pairs'

export interface MenuState {
  kind: 'modKebab' | 'linkStd' | 'asgDa' | 'vidKebab' | 'quizKebab' | 'meVideo' | 'meQuiz' | 'vdCat' | 'vCat'
  x: number
  y: number
  w: number
  moduleIndex?: number
  title?: string
  quizName?: string
}

export interface ModuleForm {
  mode: 'new' | 'edit'
  idx: number
  name: string
  video: string | null
  quiz: string | null
  desc: string
  ack: string
}

export interface VideoDetail {
  title: string
  newTitle: string
  cat: string
  dur: string
  used: number
  broken: boolean
  thumb: number
  removed: Record<number, boolean>
  upName?: string
}

/** The quiz being edited in the full-page maker; null means "a new one". */
export interface MakerQuiz {
  name: string
  pass: number
  questions: { text: string; options: { t: string }[]; correct: number }[]
}

export interface Filters {
  sts: Record<string, boolean>
  cats: Record<string, boolean>
  use: Record<string, boolean>
}

const EMPTY: Filters = { sts: {}, cats: {}, use: {} }

export function useCoachingLibrary() {
  const [tab, setTab] = useState<Tab>('modules')
  const [mq, setMq] = useState('')
  const [vq, setVq] = useState('')
  const [qq, setQq] = useState('')

  const [modules, setModules] = useState<Module[]>(SEED_MODULES)
  const [archived, setArchived] = useState<Record<string, boolean>>(SEED_ARCHIVED)
  /** Videos whose broken source has been replaced, which un-pauses their module. */
  const [fixedVideos, setFixedVideos] = useState<Record<string, boolean>>({})
  const [thumbs, setThumbs] = useState<Record<string, number>>({})

  const [applied, setApplied] = useState<Filters>(EMPTY)
  const [pf, setPf] = useState<Filters | null>(null)
  const [fpOpen, setFpOpen] = useState(false)
  const [fpSec, setFpSec] = useState<Record<string, boolean>>({ g0: true })

  const [vView, setVView] = useState<'gallery' | 'list'>('list')
  const [mPg, setMPg] = useState(1)
  const [vPg, setVPg] = useState(1)
  const [qPg, setQPg] = useState(1)

  const [hideGap, setHideGap] = useState(false)

  const [dlg, setDlg] = useState<DialogKind | null>(null)
  const [me, setMe] = useState<ModuleForm | null>(null)
  /** The module editor parked while you go and make its video or quiz. */
  const [meStash, setMeStash] = useState<ModuleForm | null>(null)
  const [retireIdx, setRetireIdx] = useState<number | null>(null)
  const [retireCancel, setRetireCancel] = useState(false)
  const [vd, setVd] = useState<VideoDetail | null>(null)
  const [pairFor, setPairFor] = useState<{ name: string; pairs: [string, string][] } | null>(null)
  const [v, setV] = useState({ file: '', title: '', cat: 'Safety', url: '' })
  const [asg, setAsg] = useState({ module: '', da: null as string | null, due: '7' })

  const [makerOpen, setMakerOpen] = useState(false)
  const [makerQuiz, setMakerQuiz] = useState<MakerQuiz | null>(null)

  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuQuery, setMenuQuery] = useState('')

  const { toast, toastMsg } = useToast(2600)

  const openMenu = useCallback((e: React.MouseEvent, kind: MenuState['kind'], extra?: Partial<MenuState>) => {
    e.stopPropagation()
    setMenu({ kind, ...anchorTo(e, 230), ...extra })
    setMenuQuery('')
  }, [])
  const closeMenu = useCallback(() => setMenu(null), [])
  /** Swap what an already-open menu is listing, keeping its position. */
  const setMenuKind = useCallback((kind: MenuState['kind']) => {
    setMenu((m) => (m ? { ...m, kind } : m))
    setMenuQuery('')
  }, [])

  const closeDlg = useCallback(() => {
    setDlg(null)
    setMe(null)
    setMeStash(null)
    setRetireIdx(null)
    setVd(null)
    setPairFor(null)
    setMenu(null)
  }, [])

  const activeModules = useMemo(() => modules.filter((m) => !m.retired && !m.draft), [modules])

  const modRows = useMemo(() => {
    const q = mq.trim().toLowerCase()
    const sel = Object.keys(applied.sts)
    return modules
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => (!q || m.name.toLowerCase().includes(q)) && (!sel.length || applied.sts[statusOf(m)]))
  }, [modules, mq, applied.sts])

  const videosShown = useMemo(() => {
    const q = vq.trim().toLowerCase()
    const cats = Object.keys(applied.cats)
    return VIDEOS.filter((x) =>
      // "Archived" is a category in the drawer, and picking it shows only those.
      (applied.cats.Archived ? !!archived[x.title] : !archived[x.title] && (!cats.length || applied.cats[x.cat])) &&
      (!q || x.title.toLowerCase().includes(q)))
  }, [vq, applied.cats, archived])

  const quizRows = useMemo(() => {
    const q = qq.trim().toLowerCase()
    const sel = Object.keys(applied.use)
    return QUIZZES.filter((z) => (!q || z.name.toLowerCase().includes(q)) && (!sel.length || applied.use[z.used ? 'In Use' : 'Unused']))
  }, [qq, applied.use])

  const pageModules = useMemo(() => paginate(modRows, mPg, PAGE_SIZE), [modRows, mPg])
  const pageVideos = useMemo(() => paginate(videosShown, vPg, PAGE_SIZE), [videosShown, vPg])
  const pageQuizzes = useMemo(() => paginate(quizRows, qPg, PAGE_SIZE), [quizRows, qPg])

  /** Videos grouped by category - the gallery view's layout. */
  const videoGroups = useMemo(
    () => CATS
      .map((c) => ({ label: c, dot: c === 'Safety' ? 'var(--danger-fg)' : undefined, cards: videosShown.filter((x) => x.cat === c) }))
      .filter((g) => g.cards.length > 0),
    [videosShown],
  )

  const pending = useMemo(() => pf ?? applied, [pf, applied])
  const filterCount =
    Object.keys(applied.sts).length + Object.keys(applied.cats).length + Object.keys(applied.use).length

  const openFilters = useCallback(() => { setFpOpen(true); setMenu(null); setPf(applied) }, [applied])
  const applyFilters = useCallback(() => {
    setFpOpen(false)
    setApplied(pending)
    setVPg(1)
    toastMsg('Filters applied')
  }, [pending, toastMsg])

  const setModule = useCallback((i: number, next: Module) => {
    setModules((ms) => ms.map((m, mi) => (mi === i ? next : m)))
  }, [])

  /** A module is a draft until it has both a video and a quiz. */
  const openMaker = useCallback((z: Quiz | null, seed: MakerQuiz['questions']) => {
    setMakerOpen(true)
    setMenu(null)
    setMakerQuiz(z ? { name: z.name, pass: parseInt(z.pass, 10) || 4, questions: seed } : null)
  }, [])

  const openVideoDetail = useCallback((x: Video) => {
    setMenu(null)
    setDlg('vdetail')
    setVd({ title: x.title, newTitle: x.title, cat: x.cat, dur: x.dur, used: x.used, broken: !!x.broken, thumb: thumbs[x.title] ?? 0, removed: {} })
  }, [thumbs])

  return {
    tab, setTab, mq, setMq, vq, setVq, qq, setQq,
    modules, setModules, setModule, archived, setArchived, fixedVideos, setFixedVideos, thumbs, setThumbs,
    applied, pending, setPf, fpOpen, setFpOpen, fpSec, setFpSec, filterCount, openFilters, applyFilters,
    vView, setVView, mPg, setMPg, vPg, setVPg, qPg, setQPg,
    hideGap, setHideGap,
    dlg, setDlg, me, setMe, meStash, setMeStash, retireIdx, setRetireIdx, retireCancel, setRetireCancel,
    vd, setVd, pairFor, setPairFor, v, setV, asg, setAsg, closeDlg,
    makerOpen, setMakerOpen, makerQuiz, openMaker,
    menu, openMenu, closeMenu, setMenuKind, menuQuery, setMenuQuery,
    activeModules, modRows, videosShown, quizRows, pageModules, pageVideos, pageQuizzes, videoGroups,
    openVideoDetail,
    toast, toastMsg,
  }
}

export type LibraryState = ReturnType<typeof useCoachingLibrary>
