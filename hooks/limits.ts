/**
 * Cells across the meter: one row of the grid /context draws, ten wide.
 */
export const METER_CELLS = 10

/**
 * Cells across the meter in a narrow band: /context's narrow grid, five wide.
 */
export const NARROW_METER_CELLS = 5

/**
 * The band width under which the meter draws its narrow form.
 */
export const NARROW_COLUMNS = 48

/**
 * The share of a cell from which it draws as a full square (/context draws
 * a square hollow under 0.7).
 */
export const FULL_CELL_SHARE = 0.7

/**
 * The share of a cell under which it draws as free: a floating-point crumb,
 * not a hollow square.
 */
export const EMPTY_CELL_SHARE = 0.01

/**
 * The compaction reserve assumed when no breakdown answers: the 20k Claude
 * Code keeps for the summary's output plus its 13k autocompact buffer.
 */
export const DEFAULT_RESERVE_TOKENS = 33_000

/**
 * Headroom at or under which the band draws in the error colour: where
 * Claude Code's own line under the prompt says the context is low.
 */
export const LOW_HEADROOM_TOKENS = 20_000

/**
 * The share of the compaction threshold from which the band draws in the
 * warning colour.
 */
export const WARNING_SHARE = 0.6

/**
 * Cells of padding on each side of the band.
 */
export const BAND_PADDING = 1
