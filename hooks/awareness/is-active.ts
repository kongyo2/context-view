import type { ContextViewFill, ContextViewWindow } from '../../types'
import Levels from '../levels'
import type { Awareness } from './awareness.js'

export function isActive(
  awareness: Awareness,
  window: ContextViewWindow,
  fill: ContextViewFill,
): boolean {
  const isFromSet = awareness.fromTokens > 0
  const isWithinSet = awareness.withinTokens > 0

  if (!isFromSet && !isWithinSet) {
    return true
  }

  const isFrom = isFromSet && fill.tokens >= awareness.fromTokens
  const isWithin =
    isWithinSet && Levels.headroomOf(window, fill) <= awareness.withinTokens

  return isFrom || isWithin
}
