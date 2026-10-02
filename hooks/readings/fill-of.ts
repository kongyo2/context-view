import type { SessionContextUsage } from 'claude-code'

import type { ContextViewFill } from '../../types'
import { percentOf } from './percent-of.js'

export function fillOf(context: SessionContextUsage): ContextViewFill | null {
  if (context.tokens !== undefined) {
    return {
      tokens: context.tokens,
      percent: context.percent ?? percentOf(context.tokens, context.window),
      isEstimate: false,
      output: context.breakdown?.apiUsage?.output_tokens ?? 0,
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
