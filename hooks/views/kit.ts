import type { ElementTable } from 'claude-code'

import type Glyphs from '../glyphs'

export type Kit = {
  ui: Pick<ElementTable<'terminal' | 'desktop'>, 'Box' | 'Text'>
  columns: number
  glyphs: Glyphs.GlyphSet
}
