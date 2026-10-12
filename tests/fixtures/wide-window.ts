import type { ContextViewWindow } from '../../types'
import { RESERVE_TOKENS } from './reserve-tokens.js'
import { WIDE_WINDOW_TOKENS } from './wide-window-tokens.js'

export const WIDE_WINDOW: ContextViewWindow = {
  window: WIDE_WINDOW_TOKENS,
  limit: WIDE_WINDOW_TOKENS,
  buffer: RESERVE_TOKENS,
  isAutoCompact: true,
}
