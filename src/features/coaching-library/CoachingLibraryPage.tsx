'use client'

import { Dialogs } from './dialogs'
import { FilterPanel } from './FilterPanel'
import { FloatingMenu } from './FloatingMenu'
import { Modules } from './Modules'
import { QuizMaker } from './QuizMaker'
import { Quizzes } from './Quizzes'
import { Videos } from './Videos'
import { Toast } from './parts'
import { useCoachingLibrary, type Tab } from './useCoachingLibrary'

const TABS: [Tab, string][] = [['modules', 'Modules'], ['videos', 'Videos'], ['quizzes', 'Quizzes']]

/**
 * Coaching Library.
 *
 * What a coaching assignment actually delivers: modules, and the videos and
 * quizzes they are assembled from. The quiz editor takes over the page rather
 * than opening in a dialog.
 */
export function CoachingLibraryPage() {
  const s = useCoachingLibrary()
  return (
    <div
      data-screen-label="Coaching Library"
      onClick={() => { if (s.menu) s.closeMenu() }}
      style={{
        position: 'relative', boxSizing: 'border-box', height: 'calc(100vh - var(--header-height))',
        minHeight: 0, display: 'flex', flexDirection: 'column', gap: 'var(--size-120)',
        padding: 'var(--size-200)', background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)', color: 'var(--text-primary)', overflow: 'hidden',
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
          {s.tab === 'modules' && <Modules s={s} />}
          {s.tab === 'videos' && <Videos s={s} />}
          {s.tab === 'quizzes' && <Quizzes s={s} />}
        </div>
      </div>

      {s.makerOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'var(--surface-page)' }}>
          <QuizMaker
            quiz={s.makerQuiz}
            onBack={() => {
              s.setMakerOpen(false)
              // A quiz built from inside the module editor hands control back.
              if (s.meStash) {
                const stash = s.meStash
                s.setTab('modules')
                s.setDlg('module')
                s.setMe({ ...stash, quiz: 'Seatbelt Basics Quiz' })
                s.setMeStash(null)
                s.toastMsg('Quiz saved and picked for the module')
              }
            }}
          />
        </div>
      )}

      <FilterPanel s={s} />
      <Dialogs s={s} />
      <FloatingMenu s={s} />
      {s.toast && <Toast>{s.toast}</Toast>}
    </div>
  )
}
