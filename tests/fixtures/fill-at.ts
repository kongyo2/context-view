import type { ContextViewFill } from '../../types'
import { WINDOW_TOKENS } from './window-tokens.js'

/**
 * The fill of the fixtures' window at `tokens`, its percentage as the status
 * line rounds it.
 *
 * @param tokens the context's tokens
 * @returns the fill
 */
export const fillAt = (tokens: number): ContextViewFill => ({
  tokens,
  percent: Math.round((tokens / WINDOW_TOKENS) * 100),
})
