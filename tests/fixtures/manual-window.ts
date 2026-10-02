import type { ContextViewWindow } from '../../types'
import { MANUAL_RESERVE_TOKENS } from './manual-reserve-tokens.js'
import { WINDOW_TOKENS } from './window-tokens.js'

/**
 * A 200k window with auto-compact off: only a manual /compact's buffer is
 * kept at its end.
 */
export const MANUAL_WINDOW: ContextViewWindow = {
  window: WINDOW_TOKENS,
  limit: WINDOW_TOKENS,
  buffer: MANUAL_RESERVE_TOKENS,
  isAutoCompact: false,
}
