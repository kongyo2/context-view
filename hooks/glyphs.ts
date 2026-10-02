/**
 * The squares /context draws its grid with, one per cell of the meter: a
 * full square for a cell the context fills, a hollow one for a cell it
 * part fills, a frame for the window left, a crossed square for the
 * compaction reserve.
 *
 * Plain symbols, one cell wide, not emoji; each is drawn with a space after
 * it, as /context draws them.
 */
export const GLYPHS = {
  used: '⛁',
  partial: '⛀',
  free: '⛶',
  buffer: '⛝',
} as const

/**
 * What a cell of the meter stands for.
 */
export type CellKind = keyof typeof GLYPHS
