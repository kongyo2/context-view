import type { ContextViewFill, ContextViewWindow } from '../../types'
import Glyphs from '../glyphs'
import Levels from '../levels'
import Names from '../names'
import { formatTokens } from './format-tokens.js'

/**
 * The headroom in words: the tokens left before auto-compact, or that it
 * runs before the next request once none are; where auto-compact is off,
 * the tokens left before the limit, or the ask to run /compact. A count
 * from an estimate is marked as one.
 *
 * @param window the window measured against, its reserve and its mode
 * @param fill the context's tokens, and whether they are an estimate
 * @returns the text
 */
export function headroomTextOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): string {
  const left = Levels.headroomOf(window, fill)
  const about = fill.isEstimate ? Glyphs.ESTIMATE_MARK : ''

  if (window.isAutoCompact) {
    return left > 0
      ? `${about}${formatTokens(left)} ${Names.UNTIL_COMPACT_TEXT}`
      : Names.COMPACT_NEXT_TEXT
  }

  return left > 0
    ? `${about}${formatTokens(left)} ${Names.BEFORE_LIMIT_TEXT}`
    : Names.RUN_COMPACT_TEXT
}
