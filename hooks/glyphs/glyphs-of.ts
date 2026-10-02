import { BLOCK_GLYPHS } from './block-glyphs.js'
import type { GlyphSet } from './glyph-set.js'
import { PILL_GLYPHS } from './pill-glyphs.js'

/**
 * The marks a terminal draws the meter with: the pills, or the blocks in
 * Ghostty, which Claude Code tells by its `TERM` or its `TERM_PROGRAM` and
 * draws its own meters in blocks for.
 *
 * @param term the `TERM` variable, when set
 * @param program the `TERM_PROGRAM` variable, when set
 * @returns the marks
 */
export function glyphsOf(
  term: string | undefined,
  program: string | undefined,
): GlyphSet {
  const isGhostty = term === 'xterm-ghostty' || program === 'ghostty'

  return isGhostty ? BLOCK_GLYPHS : PILL_GLYPHS
}
