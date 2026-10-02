import { BLOCK_GLYPHS } from './block-glyphs.js'
import type { GlyphSet } from './glyph-set.js'
import { PILL_GLYPHS } from './pill-glyphs.js'

export function glyphsOf(
  term: string | undefined,
  program: string | undefined,
): GlyphSet {
  const isGhostty = term === 'xterm-ghostty' || program === 'ghostty'

  return isGhostty ? BLOCK_GLYPHS : PILL_GLYPHS
}
