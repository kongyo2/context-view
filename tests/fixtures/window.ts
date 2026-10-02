import type { ContextViewWindow } from '../../types'
import { RESERVE_TOKENS } from './reserve-tokens.js'
import { WINDOW_TOKENS } from './window-tokens.js'

export const WINDOW: ContextViewWindow = {
  window: WINDOW_TOKENS,
  limit: WINDOW_TOKENS,
  buffer: RESERVE_TOKENS,
  isAutoCompact: true,
}
