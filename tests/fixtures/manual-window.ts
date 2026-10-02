import type { ContextViewWindow } from '../../types'
import { MANUAL_RESERVE_TOKENS } from './manual-reserve-tokens.js'
import { WINDOW_TOKENS } from './window-tokens.js'

export const MANUAL_WINDOW: ContextViewWindow = {
  window: WINDOW_TOKENS,
  limit: WINDOW_TOKENS,
  buffer: MANUAL_RESERVE_TOKENS,
  isAutoCompact: false,
}
