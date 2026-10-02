import type { ContextViewFill, ContextViewWindow } from '../../types'
import Limits from '../limits'
import { headroomOf } from './headroom-of.js'
import type { Level } from './level.js'

/**
 * The band's level for a reading: error with the headroom at or under the
 * stretch where Claude Code's own line says the context is low, warning
 * from a share of the threshold, calm below it.
 *
 * @param window the window measured against and its reserve
 * @param fill the context's tokens
 * @returns the level
 */
export function levelOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): Level {
  const threshold = Math.max(0, window.limit - window.buffer)

  if (headroomOf(window, fill) <= Limits.LOW_HEADROOM_TOKENS) {
    return 'error'
  }

  if (fill.tokens >= threshold * Limits.WARNING_SHARE) {
    return 'warning'
  }

  return 'calm'
}
