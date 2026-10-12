import type {
  ContextViewFill,
  ContextViewNoted,
  ContextViewWindow,
} from '../../types'
import Levels from '../levels'

export function notedOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): ContextViewNoted {
  return {
    tokens: fill.tokens,
    level: Levels.levelOf(window, fill),
    threshold: Math.max(0, window.limit - window.buffer),
  }
}
