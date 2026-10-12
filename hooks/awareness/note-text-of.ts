import type { ContextViewFill, ContextViewWindow } from '../../types'
import Glyphs from '../glyphs'
import Names from '../names'
import Views from '../views'

export function noteTextOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): string {
  const about = fill.isEstimate ? Glyphs.ESTIMATE_MARK : ''
  const used = Views.formatCount(fill.tokens)
  const size = Views.formatCount(window.window)
  const headroom = Views.headroomTextOf(window, fill)

  const left = window.isAutoCompact
    ? headroom
    : `${Names.AUTO_COMPACT_OFF_TEXT}, ${headroom}`

  return (
    `${Names.NOTE_LEAD_TEXT} ${about}${used}/${size} ` +
    Names.TOKENS_TEXT +
    ` (${about}${fill.percent}%); ${left}`
  )
}
