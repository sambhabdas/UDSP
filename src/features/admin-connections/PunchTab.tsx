import type { ConnectionsState } from './useConnections'
import { caption1, caption1Strong } from '../../ds/type'
import { API_ONLY_FIELDS, ENVIRONMENTS, INFO, INTERVALS, PROVIDERS, PUNCH_FIELDS, PUNCH_READS } from './data'
import {
  Card,
  ChipRow,
  Field,
  Helper,
  InfoDot,
  Labelled,
  OptionRow,
  Section,
  Select,
  SmallButton,
  TestResult,
} from './parts'
import { mono as MONO } from '../../ds/type'

export function PunchTab({ s }: { s: ConnectionsState }) {
  return (
    <>
      <Section label="Provider">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
            <ChipRow options={PROVIDERS} value={s.provider} onPick={s.pickProvider} />
            <InfoDot title={INFO.provider} />
          </div>

          {/* Everything below the provider only exists once there is one. */}
          {s.punchConnected && (
            <>
              <span style={caption1Strong}>Credentials</span>
              <div style={{ display: 'flex', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
                <Labelled label="Client ID" flex={1} min={180}>
                  <Field
                    value={s.clientId}
                    onChange={(e) => s.setClientId(e.target.value)}
                    sample={s.sampleProps('clientId', s.clientId, s.setClientId)}
                  />
                </Labelled>
                {/* Write-only: it renders as dots and can be replaced, never
                    read back. */}
                <Labelled label="API key" info={INFO.apiKey} flex={1} min={180}>
                  <Field
                    type="password"
                    value={s.apiKey}
                    onChange={(e) => s.setApiKey(e.target.value)}
                    sample={s.sampleProps('apiKey', s.apiKey, s.setApiKey)}
                  />
                </Labelled>
                <Labelled label="Environment" min={180}>
                  <ChipRow options={ENVIRONMENTS} value={s.env} onPick={s.setEnv} />
                </Labelled>
              </div>

              <span style={caption1Strong}>Sync</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', flexWrap: 'wrap' }}>
                <SmallButton onClick={s.testConnection}>Test connection</SmallButton>
                {s.testResult && <TestResult>{s.testResult}</TestResult>}
                <div style={{ flex: 1 }} />
                <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  Last sync {s.lastSync}
                </span>
                <Select
                  label={s.interval}
                  open={s.openDrop === 'interval'}
                  onToggle={(e) => {
                    e.stopPropagation()
                    s.setMenuFor(null)
                    s.setOpenDrop(s.openDrop === 'interval' ? null : 'interval')
                  }}
                >
                  {INTERVALS.map((i) => (
                    <OptionRow
                      key={i}
                      on={s.interval === i}
                      onPick={() => {
                        s.setIntervalValue(i)
                        s.setOpenDrop(null)
                      }}
                    >
                      {i}
                    </OptionRow>
                  ))}
                </Select>
              </div>
            </>
          )}
        </Card>
      </Section>

      {s.punchConnected && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 'var(--grid-gutter)' }}>
          <Card gap="var(--size-120)">
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
              <span style={caption1Strong}>Field contract</span>
              <InfoDot title={INFO.fields} />
            </span>
            <div style={{ display: 'flex', gap: 'var(--size-60)', flexWrap: 'wrap' }}>
              {PUNCH_FIELDS.map((f) => (
                <span
                  key={f}
                  style={{
                    boxSizing: 'border-box',
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 var(--size-80)',
                    borderRadius: 'var(--radius-small)',
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    ...MONO,
                    // The two the file import cannot supply.
                    color: API_ONLY_FIELDS.includes(f) ? 'var(--warning-fg)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </Card>

          {/* Same store, two questions — the boards never disagree because they
              are not separate copies. */}
          <Card gap="var(--size-120)">
            <span style={caption1Strong}>One store, two reads</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)' }}>
              {PUNCH_READS.map((r) => (
                <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-20)' }}>
                  <span style={caption1Strong}>{r.label}</span>
                  <Helper>{r.text}</Helper>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
