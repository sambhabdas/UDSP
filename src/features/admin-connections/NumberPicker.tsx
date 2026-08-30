import { caption1, caption2 } from '../../ds/type'
import { Dropdown, EmptyRow, OptionRow } from './parts'

/** Whichever form owns this picker — reserve, or add-line. */
export interface PickerState {
  number: string | null
  query: string
  area: string
  areaQuery: string
}

// Two fields in one box: an area-code filter and the number search. Picking an
// area narrows the list and hands focus straight to it, so the common path is
// "815" then pick.
export function NumberPicker({
  pool,
  state,
  patch,
  openKey,
  openDrop,
  setOpenDrop,
  reservedNumbers,
  filterNumbers,
  areaOptions,
}: {
  pool: string[]
  /** Whichever form owns this picker — reserve or add-line. */
  state: PickerState
  patch: (p: Partial<PickerState>) => void
  openKey: string
  openDrop: string | null
  setOpenDrop: (v: string | null) => void
  reservedNumbers: string[]
  filterNumbers: (pool: string[], area: string, query: string) => string[]
  areaOptions: (pool: string[], areaQuery: string) => string[]
}) {
  const areas = areaOptions(pool, state.areaQuery)
  const numbers = filterNumbers(pool, state.area, state.query)
  const areaOpen = openDrop === `${openKey}-area`
  const numOpen = openDrop === `${openKey}-num`

  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <span
        data-field=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: 28,
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--size-100)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-small)',
          background: 'var(--surface-card)',
        }}
      >
        <input
          value={state.areaQuery}
          onChange={(e) => {
            patch({ areaQuery: e.target.value.replace(/[^0-9]/g, '') })
            setOpenDrop(`${openKey}-area`)
          }}
          onFocus={() => setOpenDrop(`${openKey}-area`)}
          placeholder={state.area === 'All' ? 'Area' : state.area}
          style={{ width: 52, flexShrink: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-family)', ...caption1, color: 'var(--text-primary)', padding: 0 }}
        />
        <span style={{ width: 1, height: 16, background: 'var(--border-default)', margin: '0 var(--size-80)', flexShrink: 0 }} />
        <input
          value={state.query}
          onChange={(e) => {
            patch({ query: e.target.value })
            setOpenDrop(`${openKey}-num`)
          }}
          onFocus={() => setOpenDrop(`${openKey}-num`)}
          placeholder={state.number || 'Search phone numbers'}
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-family)', ...caption1, color: 'var(--text-primary)', padding: 0 }}
        />
      </span>

      {areaOpen && (
        <Dropdown width={120}>
          {areas.map((a) => (
            <OptionRow
              key={a}
              on={state.area === a}
              onPick={() => {
                patch({ area: a, areaQuery: '' })
                setOpenDrop(`${openKey}-num`)
              }}
            >
              {a}
            </OptionRow>
          ))}
          {areas.length === 0 && <EmptyRow>No match</EmptyRow>}
        </Dropdown>
      )}

      {numOpen && (
        <Dropdown width="100%">
          {numbers.map((n) => (
            <OptionRow
              key={n}
              on={state.number === n}
              onPick={() => {
                patch({ number: n, query: '' })
                setOpenDrop(null)
              }}
              trailing={
                // A number already reserved is the one you meant to use.
                reservedNumbers && reservedNumbers.includes(n) ? (
                  <span style={{ ...caption2, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>Reserved</span>
                ) : null
              }
            >
              {n}
            </OptionRow>
          ))}
          {numbers.length === 0 && <EmptyRow>No match</EmptyRow>}
        </Dropdown>
      )}
    </span>
  )
}
