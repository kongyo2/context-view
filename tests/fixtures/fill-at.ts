import type { ContextViewFill } from '../../types'
import { WINDOW_TOKENS } from './window-tokens.js'

/**
 * The fill of the fixtures' window at `tokens`, its percentage as the status
 * line rounds it: a response's figure, or the engine's estimate.
 *
 * @param tokens the context's tokens
 * @param isEstimate whether the figure is the engine's estimate
 * @returns the fill
 */
export const fillAt = (
  tokens: number,
  isEstimate = false,
): ContextViewFill => ({
  tokens,
  percent: Math.round((tokens / WINDOW_TOKENS) * 100),
  isEstimate,
})
