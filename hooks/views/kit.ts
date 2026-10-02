import type { ElementTable } from 'claude-code'

import type Glyphs from '../glyphs'

/**
 * What the band is drawn with: the surface's Box and Text, the cells across
 * the band (`props.bodyColumns`), and the marks the surface draws the meter
 * in.
 */
export type Kit = {
  ui: Pick<ElementTable<'terminal' | 'desktop'>, 'Box' | 'Text'>
  columns: number
  glyphs: Glyphs.GlyphSet
}
