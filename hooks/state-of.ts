import type { ContextViewFill, ContextViewWindow } from '../types'
import { LOW_HEADROOM_TOKENS, WARNING_SHARE } from './limits'

/**
 * How the band draws: calm while there is room, warning from most of the
 * way to the compaction threshold, error within the last stretch before it.
 */
export type BandState = 'calm' | 'warning' | 'error'

/**
 * The tokens the context may still take before compaction: the window
 * measured against, less its reserve, less the context.
 *
 * @param window the window measured against and its reserve
 * @param fill the context's tokens
 * @returns the headroom, negative past the threshold
 */
export function headroomOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): number {
  return window.limit - window.buffer - fill.tokens
}

/**
 * The band's state for a reading: error with the headroom at or under the
 * stretch where Claude Code's own line says the context is low, warning
 * from a share of the threshold, calm below it.
 *
 * @param window the window measured against and its reserve
 * @param fill the context's tokens
 * @returns the state
 */
export function stateOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): BandState {
  const threshold = Math.max(0, window.limit - window.buffer)

  if (headroomOf(window, fill) <= LOW_HEADROOM_TOKENS) {
    return 'error'
  }

  if (fill.tokens >= threshold * WARNING_SHARE) {
    return 'warning'
  }

  return 'calm'
}
