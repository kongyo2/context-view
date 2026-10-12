import type {
  ContextViewFill,
  ContextViewNoted,
  ContextViewWindow,
} from '../../types'
import type { Awareness } from './awareness.js'
import { notedOf } from './noted-of.js'

export function isDue(
  awareness: Awareness,
  window: ContextViewWindow,
  fill: ContextViewFill,
  noted: ContextViewNoted | null,
): boolean {
  if (!noted) {
    return true
  }

  const now = notedOf(window, fill)

  const isMoved =
    now.threshold !== noted.threshold ||
    now.level !== noted.level ||
    now.tokens < noted.tokens

  if (isMoved) {
    return true
  }

  return now.tokens - noted.tokens >= Math.max(1, awareness.stepTokens)
}
