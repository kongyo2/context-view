import type { ContextViewFill, ContextViewWindow } from '../../types'
import Limits from '../limits'
import { headroomOf } from './headroom-of.js'
import type { Level } from './level.js'

export function levelOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): Level {
  const threshold = Math.max(0, window.limit - window.buffer)
  const headroom = headroomOf(window, fill)

  if (headroom <= Limits.LOW_HEADROOM_TOKENS) {
    return 'error'
  }

  if (threshold - headroom >= threshold * Limits.WARNING_SHARE) {
    return 'warning'
  }

  return 'calm'
}
