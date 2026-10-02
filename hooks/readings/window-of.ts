import type { SessionContextUsage } from 'claude-code'

import type { ContextViewWindow } from '../../types'
import Limits from '../limits'

export function windowOf(context: SessionContextUsage): ContextViewWindow {
  const { breakdown } = context

  if (!breakdown) {
    return {
      window: context.window,
      limit: context.window,
      buffer: Math.min(context.window, Limits.DEFAULT_RESERVE_TOKENS),
      isAutoCompact: true,
    }
  }

  const limit =
    breakdown.rawMaxTokens > 0 ? breakdown.rawMaxTokens : context.window

  const isAutoCompact = breakdown.isAutoCompactEnabled

  const rows = breakdown.categories
    .filter(row => row.kind === 'buffer')
    .reduce((sum, row) => sum + row.tokens, 0)

  const reserved = isAutoCompact ? rows : rows + Limits.REPLY_RESERVE_TOKENS

  return {
    window: context.window,
    limit,
    buffer: Math.min(limit, Math.max(0, reserved)),
    isAutoCompact,
  }
}
