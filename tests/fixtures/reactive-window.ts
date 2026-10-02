import type { ContextViewWindow } from '../../types'
import { WINDOW_TOKENS } from './window-tokens.js'

export const REACTIVE_WINDOW: ContextViewWindow = {
  window: WINDOW_TOKENS,
  limit: WINDOW_TOKENS,
  buffer: 0,
  isAutoCompact: true,
}
