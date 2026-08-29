import { Toast } from '../../ds/components/Overlay.jsx'
import { Icon } from '../../ds/icons/Icon.jsx'
import { useHover } from '../../ds/useHover.js'
import { body1, caption1, caption1Strong, caption2Strong, subtitle1, subtitle2 } from '../../ds/type.js'
import {
  ACCESS_UNTIL,
  CANCEL_BODY,
  CARD,
  COMPANY_LEGAL_NAME,
  INFO,
  PERIODS,
  PERIOD_KEYS,
  PLAN,
} from './data.js'
import { Invoices } from './Invoices.jsx'
import {
  BigNumber,
  Cell,
  CellGrid,
  CellLabel,
  Helper,
  InfoDot,
  Meter,
  Section,
  Sub,
  TinyButton,
} from './parts.jsx'
import { FOCUS_RING, useFocusRing } from './ui.js'
import { useAdminBilling } from './useAdminBilling.js'

// The DSP's own bill, in the DSP's own product. Usage is metered but never
// blocked — passing an allowance bills the overage, it never stops a dispatcher
// texting a driver at 6am. The one hard stop is the seat cap, and that stops an
// invite, not a day's work.
export function AdminBillingPage() {
  const s = useAdminBilling()
  const seatPct = Math.round((PLAN.seatsUsed / PLAN.seatCap) * 100)
  const seatsLeft = PLAN.seatCap - PLAN.seatsUsed
  const atCap = seatsLeft <= 0

  return (
    <div
      data-screen-label="Admin Billing"
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
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-toolbar-gap)',
          padding: 'var(--size-200) var(--size-200)',
          background: 'var(--surface-page)',
          boxShadow: 'var(--shadow-2)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1 }} />
        {/* The accruing number, so it is never met for the first time on the
            invoice. */}
        {s.overageChip && (
          <span
            style={{
              boxSizing: 'border-box',
              height: 24,
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--size-80)',
              borderRadius: 'var(--radius-small)',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              ...caption1Strong,
              color: 'var(--warning-fg)',
              whiteSpace: 'nowrap',
            }}
          >
            {s.overageChip}
          </span>
        )}
        <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.periodRange}</span>
        <PeriodPicker s={s} />
      </div>

      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: 980,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--size-200)',
          padding: 'var(--size-200) var(--size-200) var(--size-320) var(--size-200)',
        }}
      >
        {/* Cancelled but still inside the paid period: the whole product keeps
            working, and this banner is the only change. */}
        {s.cancelled && (
          <div
            role="status"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-100)',
              padding: 'var(--size-80) var(--size-120)',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-medium)',
              ...caption1,
              color: 'var(--warning-fg)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ flex: 1, minWidth: 0, textWrap: 'pretty' }}>
              Cancelled — access continues to {ACCESS_UNTIL}. Nothing has been deleted.
            </span>
            <TinyButton onClick={s.resume}>Resume subscription</TinyButton>
          </div>
        )}

        <Section label="Plan">
          <CellGrid min={215}>
            <Cell>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
                <span style={subtitle1}>{PLAN.name}</span>
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
                  Current
                </span>
              </div>
              <span style={{ ...caption1, color: 'var(--text-secondary)' }}>{PLAN.line}</span>
              <div style={{ marginTop: 'var(--size-40)' }}>
                <TinyButton
                  inline
                  onClick={() => s.toast('Plan chooser - a downgrade below 8 used seats is blocked')}
                >
                  Change plan
                </TinyButton>
              </div>
            </Cell>

            <Cell>
              <CellLabel info={INFO.nextInvoice}>Next invoice</CellLabel>
              <BigNumber>${PLAN.fee.toFixed(2)}</BigNumber>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-60)' }}>
                <span style={{ ...caption1, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {PLAN.nextInvoiceOn}
                </span>
                <InfoDot title={INFO.nextInvoice} />
              </span>
            </Cell>

            <Cell>
              <CellLabel info={INFO.seats}>Seats</CellLabel>
              <BigNumber color={atCap ? 'var(--warning-fg)' : undefined}>
                {PLAN.seatsUsed} of {PLAN.seatCap}
              </BigNumber>
              <Meter pct={`${seatPct}%`} fill={atCap ? 'var(--warning-accent)' : 'var(--blue-300)'} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-80)' }}>
                <span
                  style={{
                    ...caption1,
                    color: atCap ? 'var(--warning-fg)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {seatsLeft} available
                </span>
                <div style={{ flex: 1 }} />
                <TinyButton onClick={() => s.toast('Add seats - the prorated charge is shown before commit')}>
                  Add seats
                </TinyButton>
              </div>
            </Cell>
          </CellGrid>
        </Section>

        <Section label="Telephony uses">
          <CellGrid min={200}>
            <Cell>
              <CellLabel info={INFO.telcoBill}>Telephony bill</CellLabel>
              <BigNumber color={s.telco.color}>{s.telco.bill}</BigNumber>
              <Sub color={s.telco.subColor}>{s.telco.sub}</Sub>
            </Cell>
            {s.meters.map((m) => (
              <Cell key={m.key}>
                <CellLabel info={m.info}>{m.label}</CellLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--size-40)' }}>
                  <BigNumber color={m.color}>{m.value}</BigNumber>
                  <span style={{ ...caption1, color: 'var(--text-helper)', whiteSpace: 'nowrap' }}>/ {m.capLabel}</span>
                </div>
                <Meter pct={m.pct} fill={m.fill} />
                <Sub color={m.subColor}>{m.sub}</Sub>
              </Cell>
            ))}
          </CellGrid>
        </Section>

        <Section label="Payment method" info={INFO.card}>
          <div
            style={{
              boxSizing: 'border-box',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--size-160)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-100)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                boxSizing: 'border-box',
                width: 40,
                height: 26,
                borderRadius: 'var(--radius-small)',
                background: 'var(--surface-inverse)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...caption2Strong,
                letterSpacing: '.5px',
                flexShrink: 0,
              }}
            >
              {CARD.brand}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...body1, fontWeight: 'var(--weight-semibold)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                •••• {CARD.last4}
              </span>
              <Helper>{CARD.exp}</Helper>
            </div>
            <TinyButton onClick={() => s.toast("The processor's own hosted form opens - the number never touches UDSP")}>
              Update
            </TinyButton>
          </div>
        </Section>

        <Invoices s={s} />

        <div
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--size-120) var(--size-160)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-100)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ flex: 1, minWidth: 0, ...caption1Strong, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Need help
          </span>
          <InfoDot title={INFO.help} />
          <TinyButton onClick={() => s.toast('Support thread opened · help@udsp.com')}>Contact support</TinyButton>
        </div>

        {/* Danger zone. Disabled-not-hidden is the rule elsewhere on this page's
            role gating; here the control is live because there is no auth layer
            to read a post from. */}
        {!s.cancelled && (
          <div
            style={{
              boxSizing: 'border-box',
              background: 'var(--surface-card)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--size-120) var(--size-160)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-100)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={caption1Strong}>Cancel subscription</span>
              <Sub>Access continues to the end of the paid period. No data is deleted.</Sub>
            </div>
            <InfoDot title={INFO.cancel} />
            <DangerButton onClick={s.openCancel}>Cancel subscription</DangerButton>
          </div>
        )}
      </div>

      {s.cancelOpen && <CancelDialog s={s} />}
      {s.toastText && <Toast>{s.toastText}</Toast>}
    </div>
  )
}

function PeriodPicker({ s }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <div
        onClick={(e) => {
          e.stopPropagation()
          s.setPeriodOpen(!s.periodOpen)
        }}
        style={{
          boxSizing: 'border-box',
          width: 160,
          maxWidth: '100%',
          height: 'var(--control-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-60)',
          padding: '0 var(--size-120)',
          borderRadius: 'var(--radius-medium)',
          background: 'var(--surface-card)',
          border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-default)'}`,
          ...body1,
          fontWeight: 'var(--weight-semibold)',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: focus ? FOCUS_RING : 'none',
          transition: 'border-color var(--motion-hover)',
        }}
        {...hoverProps}
        {...focusProps}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.period}</span>
        <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          <Icon name="SvChevron" size={12} />
        </span>
      </div>
      {s.periodOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 36,
            right: 0,
            boxSizing: 'border-box',
            width: 160,
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
          {PERIOD_KEYS.map((k) => (
            <PeriodRow
              key={k}
              label={k}
              tag={PERIODS[k].tag}
              on={s.period === k}
              onPick={() => {
                s.setPeriod(k)
                s.setPeriodOpen(false)
              }}
            />
          ))}
        </div>
      )}
    </span>
  )
}

function PeriodRow({ label, tag, on, onPick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onPick}
      style={{
        boxSizing: 'border-box',
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-60)',
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
      <span style={{ flex: 1, minWidth: 0 }}>{label}</span>
      <Helper>{tag}</Helper>
    </div>
  )
}

function DangerButton({ children, onClick }) {
  const [hover, hoverProps] = useHover()
  const [focus, focusProps] = useFocusRing()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-80)',
        borderRadius: 'var(--radius-small)',
        background: hover ? 'var(--danger-bg)' : 'var(--surface-card)',
        border: '1px solid var(--danger-border)',
        ...caption1Strong,
        color: 'var(--danger-fg)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: focus ? FOCUS_RING : 'none',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
      {...focusProps}
    >
      {children}
    </div>
  )
}

function CancelDialog({ s }) {
  return (
    <div
      onClick={() => s.setCancelOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,.32)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--size-160)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Cancel the subscription?"
        style={{
          boxSizing: 'border-box',
          width: 480,
          maxWidth: '100%',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xlarge)',
          boxShadow: 'var(--elevation-dialog)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 'var(--size-200) var(--size-240) var(--size-120) var(--size-240)' }}>
          <span style={subtitle2}>Cancel the subscription?</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-100)', padding: '0 var(--size-240) var(--size-160) var(--size-240)' }}>
          {/* What cancelling does, before the act rather than after it. */}
          <span style={{ ...caption1, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{CANCEL_BODY}</span>
          <div
            data-field=""
            style={{
              boxSizing: 'border-box',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--size-80) var(--size-120)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-20)',
            }}
          >
            <Helper>Type the company&apos;s legal name to confirm</Helper>
            <input
              placeholder={COMPANY_LEGAL_NAME}
              value={s.cancelText}
              onChange={(e) => s.setCancelText(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-family)',
                ...body1,
                color: 'var(--text-primary)',
                padding: 0,
              }}
            />
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-default)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-120)', padding: 'var(--size-160) var(--size-240) var(--size-200) var(--size-240)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }} />
          <KeepButton onClick={() => s.setCancelOpen(false)} />
          <div
            onClick={s.canCancel ? s.commitCancel : undefined}
            style={{
              boxSizing: 'border-box',
              height: 32,
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--size-120)',
              borderRadius: 'var(--radius-medium)',
              background: s.canCancel ? 'var(--danger-accent)' : 'var(--surface-subtle)',
              border: `1px solid ${s.canCancel ? 'var(--danger-accent)' : 'var(--border-default)'}`,
              color: s.canCancel ? 'var(--text-inverse)' : 'var(--text-disabled)',
              ...body1,
              fontWeight: 'var(--weight-semibold)',
              whiteSpace: 'nowrap',
              cursor: s.canCancel ? 'pointer' : 'default',
            }}
          >
            Cancel subscription
          </div>
        </div>
      </div>
    </div>
  )
}

function KeepButton({ onClick }) {
  const [hover, hoverProps] = useHover()
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--size-120)',
        borderRadius: 'var(--radius-medium)',
        background: hover ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        ...body1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--motion-hover)',
      }}
      {...hoverProps}
    >
      Keep the subscription
    </div>
  )
}
