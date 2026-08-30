'use client'

import { caption1 } from '../../../ds/type'
import { CardHead, Cell, DotPill, Pill, SectionTitle, SmallButton } from '../parts'
import { CARD, ROW } from '../style'
import { DOC_ROWS } from '../data'
import type { GaState } from '../useGeneralAssociates'

/**
 * Documents — what has been signed, and what they are qualified to drive.
 *
 * A Manual row is one the Owner closed without a DA acknowledgement, so it is
 * toned as neutral rather than green: it is filed, not agreed to.
 */
export function DocsTab({ s }: { s: GaState }) {
  return (
    <>
      <div style={CARD}>
        <CardHead>
          <SectionTitle flex>Coaching And Acknowledgements</SectionTitle>
          <Pill>Total: {DOC_ROWS.length}</Pill>
        </CardHead>

        {DOC_ROWS.map((d) => (
          <div key={d.date + d.state} style={{ ...ROW, display: 'flex', gap: 'var(--size-120)' }}>
            <span style={{ width: 88, ...caption1, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {d.date}
            </span>
            <Cell body flex ellipsis>{d.txt}</Cell>
            <DotPill tone={d.tone} label={d.state} />
          </div>
        ))}
      </div>

      <div style={CARD}>
        <CardHead>
          <SectionTitle flex>Qualifications</SectionTitle>
          <SmallButton onClick={() => s.editDa(s.cur)}>Edit</SmallButton>
        </CardHead>
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-60)',
            padding: 'var(--size-120) var(--size-160)',
            flexWrap: 'wrap',
          }}
        >
          {s.cur.quals.map((q) => (
            <Pill key={q} radius="var(--radius-small)" padding="var(--size-100)">
              {q}
            </Pill>
          ))}
        </div>
      </div>
    </>
  )
}
