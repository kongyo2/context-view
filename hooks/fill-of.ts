import type { SessionContextUsage } from 'claude-code'

import type { ContextViewFill } from '../types'

/**
 * How full the window is, from the context the engine reports: nothing
 * until a response has been answered over the live window.
 *
 * @param context the context, its tokens absent before the first response
 * @returns the fill, or null while there is no reading
 */
export function fillOf(context: SessionContextUsage): ContextViewFill | null {
  if (context.tokens === undefined) {
    return null
  }

  return {
    tokens: context.tokens,
    percent: context.percent ?? percentOf(context.tokens, context.window),
  }
}

/**
 * Tokens over the window as a whole percentage, 0 to 100, as the status line
 * figures it.
 *
 * @param tokens the context's tokens
 * @param window the model's window
 * @returns the percentage
 */
export function percentOf(tokens: number, window: number): number {
  if (window <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((tokens / window) * 100)))
}
