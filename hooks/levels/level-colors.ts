import type { Level } from './level.js'

/**
 * The theme key each level draws the context's cells and the percentage in.
 *
 * Calm is the blue Claude Code fills its usage meters with: the value of
 * `rate_limit_fill` in every full-colour theme, and still blue in the ANSI
 * themes, where that key turns the yellow of `warning`. Then its warning and
 * error colours.
 */
export const LEVEL_COLORS: Readonly<Record<Level, string>> = {
  calm: 'permission',
  warning: 'warning',
  error: 'error',
}
