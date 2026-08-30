// Persona tinting, shared by every avatar and monogram in the product.
// Shell.dc.html and the Inbox both hash the name across the same four ramps —
// "the same rule as the DS Avatar component" — so it lives at the DS layer
// rather than being written out twice.

const TINTS: readonly (readonly [string, string])[] = [
  ['var(--blue-100)', 'var(--blue-700)'],
  ['var(--green-100)', 'var(--green-700)'],
  ['var(--yellow-100)', 'var(--yellow-700)'],
  ['var(--red-100)', 'var(--red-700)'],
]

export function tint(name: string): readonly [string, string] {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return TINTS[hash % TINTS.length]
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}
