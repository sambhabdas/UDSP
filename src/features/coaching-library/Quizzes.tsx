'use client'

import { useHover } from '../../ds/useHover'
import { body1 } from '../../ds/type'
import { makerSeed } from './data'
import type { Quiz } from './data'
import { Button, GridHead, HeadCell, IconButton, Pager, SearchField } from './parts'
import { CARD, NUM, QUIZ_COLS } from './style'
import { FiltersButton } from './Modules'
import type { LibraryState } from './useCoachingLibrary'

export function Quizzes({ s }: { s: LibraryState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', padding: 'var(--size-160)' }}>
          <span style={{ fontSize: 'var(--subtitle-2-size)', lineHeight: 'var(--subtitle-2-lh)', fontWeight: 'var(--weight-semibold)' }}>Quizzes</span>
          <div style={{ flex: 1 }} />
          <FiltersButton s={s} />
          <SearchField value={s.qq} onChange={s.setQq} placeholder="Search quizzes" width={220} />
          <Button kind="primary" onClick={() => s.openMaker(null, makerSeed())}>+ New Quiz</Button>
        </div>

        <GridHead cols={QUIZ_COLS}>
          <HeadCell>Quiz</HeadCell>
          <HeadCell align="right">Questions</HeadCell>
          <HeadCell align="right">Pass Mark</HeadCell>
          <HeadCell>Used In</HeadCell>
          <HeadCell align="right">Average Score</HeadCell>
          <span />
        </GridHead>

        {s.pageQuizzes.slice.map((z) => <Row key={z.name} s={s} z={z} />)}
        <Pager page={s.pageQuizzes} setPage={s.setQPg} />
      </div>
    </div>
  )
}

function Row({ s, z }: { s: LibraryState; z: Quiz }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      data-fx=""
      tabIndex={0}
      role="button"
      onClick={() => s.openMaker(z, makerSeed())}
      style={{
        display: 'grid', gridTemplateColumns: QUIZ_COLS, columnGap: 'var(--size-100)', alignItems: 'center',
        minHeight: 48, padding: 'var(--size-60) var(--size-160)', borderBottom: '1px solid var(--border-subtle)',
        background: hover ? 'var(--surface-subtle)' : 'transparent', cursor: 'pointer',
      }}
      {...hoverProps}
    >
      <span style={{ ...body1, fontWeight: 'var(--weight-semibold)' }}>{z.name}</span>
      <span style={{ textAlign: 'right', ...body1, ...NUM }}>{z.questions}</span>
      <span style={{ textAlign: 'right', ...body1, ...NUM }}>{z.pass}</span>
      <span style={{ ...body1, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{z.used}</span>
      <span style={{ textAlign: 'right', ...body1, fontWeight: 'var(--weight-semibold)', color: z.avg >= 80 ? 'var(--success-fg)' : 'var(--warning-fg)', ...NUM }}>{z.avg}%</span>
      <IconButton icon="FnMore" onClick={(e) => s.openMenu(e, 'quizKebab', { quizName: z.name })} />
    </div>
  )
}
