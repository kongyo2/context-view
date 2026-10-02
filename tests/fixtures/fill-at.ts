import type { ContextViewFill } from '../../types'
import { WINDOW_TOKENS } from './window-tokens.js'

export const fillAt = (
  tokens: number,
  isEstimate = false,
): ContextViewFill => ({
  tokens,
  percent: Math.round((tokens / WINDOW_TOKENS) * 100),
  isEstimate,
})
