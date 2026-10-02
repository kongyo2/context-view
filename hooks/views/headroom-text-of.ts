import type { ContextViewFill, ContextViewWindow } from '../../types'
import Levels from '../levels'
import Names from '../names'
import { formatTokens } from './format-tokens.js'

/**
 * The headroom in words: the tokens left before auto-compact, or that it
 * runs before the next request once none are; where auto-compact is off,
 * the tokens left before the limit, or the ask to run /compact.
 *
 * @param window the window measured against, its reserve and its mode
 * @param fill the context's tokens
 * @returns the text
 */
export function headroomTextOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): string {
  const left = Levels.headroomOf(window, fill)

  if (window.isAutoCompact) {
    return left > 0
      ? `${formatTokens(left)} ${Names.UNTIL_COMPACT_TEXT}`
      : Names.COMPACT_NEXT_TEXT
  }

  return left > 0
    ? `${formatTokens(left)} ${Names.BEFORE_LIMIT_TEXT}`
    : Names.RUN_COMPACT_TEXT
}
