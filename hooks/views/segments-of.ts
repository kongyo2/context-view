import type { ContextViewFill, ContextViewWindow } from '../../types'
import Glyphs from '../glyphs'
import Levels from '../levels'
import Names from '../names'
import { formatCount } from './format-count.js'
import { headroomTextOf } from './headroom-text-of.js'
import type { Segment } from './segment.js'

export function segmentsOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): Segment[] {
  const isCalm = Levels.levelOf(window, fill) === 'calm'
  const about = fill.isEstimate ? Glyphs.ESTIMATE_MARK : ''
  const used = formatCount(fill.tokens)
  const size = formatCount(window.window)

  return [
    { text: `${about}${fill.percent}%`, isDim: false },
    { text: `${about}${used}/${size} ` + Names.TOKENS_TEXT, isDim: true },
    { text: headroomTextOf(window, fill), isDim: isCalm },
  ]
}
