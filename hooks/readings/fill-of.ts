import type { SessionContextUsage } from 'claude-code'

import type { ContextViewFill } from '../../types'
import { percentOf } from './percent-of.js'

/**
 * How full the window is, from the context the engine reports: its live
 * figure once a response has been answered over the window; before then (a
 * new session, or the window after `/clear` or a compaction), the total the
 * breakdown estimates locally, marked as an estimate.
 *
 * @param context the context, with its breakdown when one was asked for
 * @returns the fill, or null with neither a figure nor an estimate
 */
export function fillOf(context: SessionContextUsage): ContextViewFill | null {
  if (context.tokens !== undefined) {
    return {
      tokens: context.tokens,
      percent: context.percent ?? percentOf(context.tokens, context.window),
      isEstimate: false,
    }
  }

  const estimate = context.breakdown?.totalTokens

  if (estimate === undefined || estimate <= 0) {
    return null
  }

  return {
    tokens: estimate,
    percent: percentOf(estimate, context.window),
    isEstimate: true,
  }
}
