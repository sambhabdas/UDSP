import type { ComponentPropsWithoutRef, CSSProperties } from 'react'
import { resolveGlyph } from './glyphs'

// The .dc.html pages get a `window.Icon` factory installed by the page helmet
// and poll for it to land. Here the same factory is a real React component, so
// there is nothing to wait for.
export interface IconProps extends ComponentPropsWithoutRef<'span'> {
  name: string
  size?: number
  color?: string
}

export function Icon({ name, size = 20, color = 'currentColor', style, ...rest }: IconProps) {
  const glyph = resolveGlyph(name)
  const base: CSSProperties = {
    display: 'inline-flex',
    lineHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    color,
    flexShrink: 0,
    ...style,
  }
  if (!glyph) return <span style={base} {...rest} />
  return (
    <span
      style={base}
      {...rest}
      // Glyph bodies are emitter-controlled <path>/<g> markup — geometry only.
      dangerouslySetInnerHTML={{
        __html:
          `<svg width="${size}" height="${size}" shape-rendering="geometricPrecision" ` +
          `viewBox="${glyph.viewBox}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">` +
          `${glyph.body}</svg>`,
      }}
    />
  )
}

export default Icon
