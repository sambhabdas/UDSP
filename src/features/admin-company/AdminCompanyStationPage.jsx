import { Toast } from '../../ds/components/Overlay.jsx'
import { Icon } from '../../ds/icons/Icon.jsx'
import { useHover } from '../../ds/useHover.js'
import { body1, caption1, caption1Strong, caption2, subtitle2, subtitle2Stronger } from '../../ds/type.js'
import { BrandPreview } from './BrandPreview.jsx'
import { DEFAULT_DEFS, INFO, TZ_CONFIRM, WEEK_STARTS } from './data.js'
import { Card, ChipRow, Field, Helper, InfoDot, Labelled, Section, SmallButton } from './parts.jsx'
import { MONO, SUB_EYEBROW } from './ui.js'
import { useCompanyStation } from './useCompanyStation.js'

// The company is the legal entity that signs and gets paid; the station is the
// building Amazon dispatches from. Documents carry the legal name — the display
// name is only what the product wears.
export function AdminCompanyStationPage() {
  const s = useCompanyStation()
  const f = s.form

  return (
    <div
      data-screen-label="Admin Company Station"
      onClick={s.closeOverlays}
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        overflow: 'hidden auto',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: 760,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-200)',
          padding: 'var(--size-200) var(--size-200) var(--size-320) var(--size-200)',
        }}
      >
        <Section label="Company">
          <Card>
            <Row>
              <Labelled label="Legal name" flex={1} min={180}>
                <Field value={f.legalName} onChange={(e) => s.set('legalName', e.target.value)} sample={s.sampleProps('legalName')} />
              </Labelled>
              <Labelled label="DSP code" info={INFO.dspCode} width={120}>
                <Field
                  uppercase
                  maxLength={5}
                  value={f.dspCode}
                  onChange={(e) => s.set('dspCode', e.target.value.toUpperCase())}
                  sample={s.sampleProps('dspCode')}
                />
              </Labelled>
            </Row>
            <Row>
              <Labelled label="Support email" flex={1} min={180}>
                <Field placeholder="help@company.com" value={f.supportEmail} onChange={(e) => s.set('supportEmail', e.target.value)} />
              </Labelled>
              <Labelled label="Support phone" flex={1} min={180}>
                <Field placeholder="+1" value={f.supportPhone} onChange={(e) => s.set('supportPhone', e.target.value)} />
              </Labelled>
            </Row>
            <Labelled label="Address">
              <Field value={f.address} onChange={(e) => s.set('address', e.target.value)} sample={s.sampleProps('address')} />
            </Labelled>
          </Card>
        </Section>

        <Section label="Branding">
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--size-200)',
              display: 'flex',
              flexWrap: 'wrap',
              rowGap: 'var(--size-200)',
            }}
          >
            <div
              data-brand-fields=""
              style={{ flex: 1.2, minWidth: 'min(280px, 100%)', display: 'flex', flexDirection: 'column', gap: 'var(--size-200)', paddingRight: 'var(--size-240)' }}
            >
              <SubSection label="Brand identity">
                <Labelled label="Display name" info={INFO.displayName}>
                  <Field
                    maxLength={20}
                    value={f.displayName}
                    onChange={(e) => s.set('displayName', e.target.value)}
                    sample={s.sampleProps('displayName')}
                  />
                </Labelled>
                <Labelled label="Slogan" info={INFO.slogan}>
                  <Field maxLength={60} placeholder="Optional" value={f.slogan} onChange={(e) => s.set('slogan', e.target.value)} />
                </Labelled>
              </SubSection>

              <SubSection label="Brand colors">
                <Labelled label="Brand color" info={INFO.brand}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
                    <label
                      style={{
                        position: 'relative',
                        display: 'block',
                        boxSizing: 'border-box',
                        width: 36,
                        height: 28,
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-small)',
                        // The sanitized value, so a half-typed hex never blanks
                        // the swatch out.
                        background: s.rail.hex,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <input
                        type="color"
                        aria-label="Brand color"
                        value={s.rail.hex}
                        onChange={(e) => s.set('brand', e.target.value)}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', padding: 0, cursor: 'pointer' }}
                      />
                    </label>
                    <Field width={100} value={f.brand} onChange={(e) => s.set('brand', e.target.value)} />
                  </div>
                </Labelled>
              </SubSection>

              <SubSection label="Logo">
                {!f.logo ? (
                  <DropZone onPick={() => s.setLogo(true)} />
                ) : (
                  <>
                    <div
                      style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        height: 96,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--size-100)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-medium)',
                        background: 'var(--surface-card)',
                      }}
                    >
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-medium)',
                          background: s.rail.hex,
                          color: s.rail.fg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ...subtitle2Stronger,
                        }}
                      >
                        {s.initial}
                      </span>
                      <span style={{ ...MONO, color: 'var(--text-secondary)' }}>logo.svg</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <SmallButton onClick={() => s.setLogo(false)}>Remove logo</SmallButton>
                    </div>
                  </>
                )}
              </SubSection>
            </div>

            <div
              data-brand-preview=""
              style={{
                flex: 1,
                minWidth: 'min(300px, 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--size-120)',
                borderLeft: '1px solid var(--border-subtle)',
                paddingLeft: 'var(--size-240)',
              }}
            >
              <span style={SUB_EYEBROW}>Live preview</span>
              <BrandPreview s={s} />
            </div>
          </div>
        </Section>

        <Section label="Station">
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)', flexWrap: 'wrap' }}>
              <span
                style={{
                  boxSizing: 'border-box',
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 var(--size-80)',
                  borderRadius: 'var(--radius-medium)',
                  background: 'var(--blue-100)',
                  border: '1px solid var(--blue-200)',
                  ...caption1Strong,
                  color: 'var(--blue-700)',
                }}
              >
                {f.stationCode}
              </span>
              <div style={{ flex: 1 }} />
              {/* The station is locked by default: its code is the one on
                  validated invoices, so it is not a field you edit in passing. */}
              <SmallButton primary={s.stationEditing} onClick={s.stationAction}>
                {s.stationEditing ? 'Save' : 'Edit'}
              </SmallButton>
            </div>

            <Row>
              <Labelled label="Station name" flex={1} min={180}>
                <Field
                  readOnly={!s.stationEditing}
                  value={f.stationName}
                  onChange={(e) => s.set('stationName', e.target.value)}
                  sample={s.sampleProps('stationName')}
                />
              </Labelled>
              <Labelled label="Station code" info={INFO.stationCode} width={120}>
                <Field
                  uppercase
                  maxLength={5}
                  readOnly={!s.stationEditing}
                  value={f.stationCode}
                  onChange={(e) => s.set('stationCode', e.target.value.toUpperCase())}
                  sample={s.sampleProps('stationCode')}
                />
              </Labelled>
            </Row>

            <Labelled label="Station address">
              <Field
                readOnly={!s.stationEditing}
                value={f.stationAddress}
                onChange={(e) => s.set('stationAddress', e.target.value)}
                sample={s.sampleProps('stationAddress')}
              />
            </Labelled>

            <Labelled label="Week starts" info={INFO.weekStart}>
              <ChipRow options={WEEK_STARTS} value={f.weekStart} onPick={(v) => s.set('weekStart', v)} />
            </Labelled>
          </Card>
        </Section>

        <Section label="Defaults">
          <Card grid="repeat(auto-fit, minmax(min(300px, 100%), 1fr))">
            {DEFAULT_DEFS.map((d) => (
              <DefaultCell key={d.key} label={d.label} info={d.info}>
                <ChipRow options={d.options} value={f[d.key]} onPick={(v) => s.set(d.key, v)} />
                <Helper>{d.sample(f[d.key])}</Helper>
              </DefaultCell>
            ))}
            <DefaultCell label="Time zone" info={INFO.tz}>
              <TimeZonePicker s={s} />
            </DefaultCell>
          </Card>
        </Section>
      </div>

      {s.tzPending && <TzConfirm s={s} />}
      {s.toastText && <Toast>{s.toastText}</Toast>}
    </div>
  )
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: 'var(--size-120)', flexWrap: 'wrap' }}>{children}</div>
}

function SubSection({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-120)' }}>
      <span style={SUB_EYEBROW}>{label}</span>
      {children}
    </div>
  )
}

// Each cell owns its left and top hairline and pulls back by a pixel, so the
// rules stay correct however many columns the grid resolves to.
function DefaultCell({ label, info, children }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--size-160)',
        borderLeft: '1px solid var(--border-subtle)',
        borderTop: '1px solid var(--border-subtle)',
        margin: '-1px 0 0 -1px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-80)',
        minWidth: 0,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
        <span style={caption1Strong}>{label}</span>
        <InfoDot title={info} />
      </span>
      {children}
    </div>
  )
}

function DropZone({ onPick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: 96,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--size-40)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-card)' : 'var(--surface-subtle)',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      <span style={caption1Strong}>Upload logo</span>
      <span style={{ ...caption2, color: 'var(--text-helper)' }}>PNG or SVG · Max 2MB</span>
    </div>
  )
}

function TimeZonePicker({ s }) {
  const [hover, hoverProps] = useHover()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <span
        data-field=""
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width: 300,
          maxWidth: '100%',
          height: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-100)',
          borderRadius: 'var(--radius-small)',
          background: 'var(--surface-card)',
          border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
          cursor: 'text',
          transition: 'border-color var(--motion-hover)',
        }}
        {...hoverProps}
      >
        <input
          value={s.tzQuery}
          onChange={(e) => {
            s.setTzQuery(e.target.value)
            s.setTzOpen(true)
          }}
          onFocus={() => s.setTzOpen(true)}
          // Closed, the field shows the zone in force; open, it invites a search.
          placeholder={s.tzOpen ? 'Search time zones' : s.form.tz}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-family)',
            ...caption1,
            color: 'var(--text-primary)',
            padding: 0,
          }}
        />
        <span
          onClick={(e) => {
            e.stopPropagation()
            s.setTzOpen(!s.tzOpen)
          }}
          style={{ display: 'flex', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <Icon name="SvChevron" size={12} />
        </span>
      </span>

      {s.tzOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 31,
            left: 0,
            boxSizing: 'border-box',
            width: 300,
            maxWidth: '100%',
            padding: 'var(--size-40)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--elevation-menu)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {s.tzMatches.map((z) => (
            <ZoneRow key={z} label={z} on={s.form.tz === z} onPick={() => s.pickZone(z)} />
          ))}
          {s.tzMatches.length === 0 && (
            <div style={{ boxSizing: 'border-box', padding: 'var(--size-60) var(--size-80)', ...caption1, color: 'var(--text-secondary)' }}>
              No match
            </div>
          )}
        </div>
      )}
    </span>
  )
}

function ZoneRow({ label, on, onPick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: on ? 'var(--blue-50)' : hover ? 'var(--surface-subtle)' : 'transparent',
        ...caption1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {label}
    </div>
  )
}

// Changing the zone re-renders every timestamp in the product, so it asks —
// and says plainly that nothing which already happened actually moves.
function TzConfirm({ s }) {
  return (
    <div
      onClick={() => s.setTzPending(null)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.32)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto',
        padding: 'var(--size-320) var(--size-160)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Change the time zone?"
        style={{
          boxSizing: 'border-box',
          width: 440,
          maxWidth: '92vw',
          marginBlock: 'auto',
          flexShrink: 0,
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-medium)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-160)',
          padding: 'var(--size-240)',
        }}
      >
        <span style={subtitle2}>Change the time zone?</span>
        <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>
          {TZ_CONFIRM(s.tzPending)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-160)', paddingTop: 'var(--size-120)', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }} />
          <DialogButton onClick={() => s.setTzPending(null)}>Cancel</DialogButton>
          <DialogButton primary onClick={s.commitZone}>
            Change time zone
          </DialogButton>
        </div>
      </div>
    </div>
  )
}

function DialogButton({ children, onClick, primary }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 'var(--control-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: primary
          ? hover ? 'var(--primary-hover)' : 'var(--primary)'
          : hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `1px solid ${primary ? 'var(--primary)' : 'var(--border-default)'}`,
        color: primary ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...body1,
        fontWeight: 'var(--weight-semibold)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      {children}
    </div>
  )
}
