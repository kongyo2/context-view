import type { ContextViewFill, ContextViewWindow } from '../../types'
import Glyphs from '../glyphs'
import Levels from '../levels'
import Names from '../names'
import { formatCount } from './format-count.js'

export function headroomTextOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): string {
  const left = Levels.headroomOf(window, fill)
  const about = fill.isEstimate ? Glyphs.ESTIMATE_MARK : ''

  if (window.isAutoCompact) {
    return left > 0
      ? `${about}${formatCount(left)} ${Names.UNTIL_COMPACT_TEXT}`
      : Names.COMPACT_NEXT_TEXT
  }

  return left > 0
    ? `${about}${formatCount(left)} ${Names.BEFORE_LIMIT_TEXT}`
    : Names.RUN_COMPACT_TEXT
}
