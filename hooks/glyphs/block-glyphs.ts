import type { GlyphSet } from './glyph-set.js'

/**
 * The marks Claude Code's meter falls back to where the terminal bleeds the
 * pills' ink into the next cell: `█` for a filled cell, `░` for an empty one.
 */
export const BLOCK_GLYPHS: GlyphSet = { fill: '█', empty: '░' }
