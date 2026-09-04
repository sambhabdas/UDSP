// The Fluent web type ramp - Segoe UI · 16 styles (Design System §2ty).
//
// A named style is a COMPLETE decision: size, line-height AND weight travel
// together. That is why nothing here exports a bare weight - composing
// `subtitle1` with a regular weight would invent a 17th style that the ramp
// does not have. Spread one of these and nothing else.
//
//   Name                  Weight    Size / Line-height
//   Caption 2             Regular   10 / 14
//   Caption 2 Strong      Semibold  10 / 14
//   Caption 1             Regular   12 / 16
//   Caption 1 Strong      Semibold  12 / 16
//   Caption 1 Stronger    Bold      12 / 16
//   Body 1                Regular   14 / 20
//   Body 1 Strong         Semibold  14 / 20
//   Body 1 Stronger       Bold      14 / 20
//   Subtitle 2            Semibold  16 / 22
//   Subtitle 2 Stronger   Bold      16 / 22
//   Subtitle 1            Semibold  20 / 26
//   Title 3               Semibold  24 / 32
//   Title 2               Semibold  28 / 36
//   Title 1               Semibold  32 / 40
//   Large Title           Semibold  40 / 52
//   Display               Semibold  68 / 92

const REGULAR = 'var(--weight-regular)'
const SEMIBOLD = 'var(--weight-semibold)'
const BOLD = 'var(--weight-bold)'

export interface TypeStyle {
  readonly fontSize: string
  readonly lineHeight: string
  readonly fontWeight: string
}

const style = (token: string, weight: string): TypeStyle => ({
  fontSize: `var(--${token}-size)`,
  lineHeight: `var(--${token}-lh)`,
  fontWeight: weight,
})

export const caption2 = style('caption-2', REGULAR)
export const caption2Strong = style('caption-2', SEMIBOLD)

export const caption1 = style('caption-1', REGULAR)
export const caption1Strong = style('caption-1', SEMIBOLD)
export const caption1Stronger = style('caption-1', BOLD)

export const body1 = style('body-1', REGULAR)
export const body1Strong = style('body-1', SEMIBOLD)
export const body1Stronger = style('body-1', BOLD)

export const subtitle2 = style('subtitle-2', SEMIBOLD)
export const subtitle2Stronger = style('subtitle-2', BOLD)

export const subtitle1 = style('subtitle-1', SEMIBOLD)

export const title3 = style('title-3', SEMIBOLD)
export const title2 = style('title-2', SEMIBOLD)
export const title1 = style('title-1', SEMIBOLD)
export const largeTitle = style('large-title', SEMIBOLD)
export const display = style('display', SEMIBOLD)

// Section eyebrow - Caption 2 Strong set uppercase with tracking. Uppercase is
// reserved for exactly this and 10px table headers, and always carries the
// letter-spacing; it is a documented composite, not a 17th ramp style.
export const eyebrow = {
  ...caption2Strong,
  letterSpacing: '.5px',
  textTransform: 'uppercase',
  color: 'var(--text-helper)',
} as const

// The same composite one step wider and in the label colour - the section and
// table headings the pages use. Five features had written this one out too.
export const labelEyebrow = {
  ...caption2Strong,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
} as const

// Machine strings - transporter IDs, filenames, column names. The design files
// set these at 11px; borrowing Caption 1's metrics keeps them on the ramp and
// still clears a 12-character ID in its column.
export const mono = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  ...caption1,
} as const
