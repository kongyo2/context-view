import type { ContextViewFill, ContextViewWindow } from '../../types'
import Glyphs from '../glyphs'
import Levels from '../levels'
import Names from '../names'
import { formatTokens } from './format-tokens.js'
import { headroomTextOf } from './headroom-text-of.js'
import type { Segment } from './segment.js'

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
