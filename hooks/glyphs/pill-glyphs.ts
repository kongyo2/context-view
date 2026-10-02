import type { GlyphSet } from './glyph-set.js'

/**
 * The marks Claude Code's own meters are drawn with (its ProgressBar's
 * `pill` variant): `▰` for a filled cell, `▱` for an empty one, each one
 * cell wide in every locale.
 */
export const PILL_GLYPHS: GlyphSet = { fill: '▰', empty: '▱' }
