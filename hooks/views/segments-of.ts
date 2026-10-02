import type { ContextViewFill, ContextViewWindow } from '../../types'
import Glyphs from '../glyphs'
import Levels from '../levels'
import Names from '../names'
import { formatTokens } from './format-tokens.js'
import { headroomTextOf } from './headroom-text-of.js'
import type { Segment } from './segment.js'

/**
 * The band's text, left to right: the percentage in the level's colour, the
 * tokens over the window dim, and the headroom before compaction, dim while
 * there is room and in the level's colour once there is not. Each figure
 * from an estimate is marked as one.
 *
 * @param window the window measured against, its reserve and its mode
 * @param fill the context's tokens and percentage
 * @returns the segments
 */
export function segmentsOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): Segment[] {
  const isCalm = Levels.levelOf(window, fill) === 'calm'
  const about = fill.isEstimate ? Glyphs.ESTIMATE_MARK : ''

  const tokens =
    `${about}${formatTokens(fill.tokens)}/${formatTokens(window.window)} ` +
    Names.TOKENS_TEXT

  return [
    { text: `${about}${fill.percent}%`, isDim: false },
    { text: tokens, isDim: true },
    { text: headroomTextOf(window, fill), isDim: isCalm },
  ]
}
