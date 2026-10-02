import type { SessionContextUsage } from 'claude-code'

import type { ContextViewWindow } from '../../types'
import Limits from '../limits'

/**
 * The window as the band measures it, from the context `$.session.usage()`
 * answers.
 *
 * With a breakdown: the window compaction measures against, and the reserve
 * above the engine's own auto-compact threshold, or the tokens its buffer
 * rows keep where auto-compact is off. Without one: the model's window and
 * the reserve Claude Code usually keeps.
 *
 * @param context the context, with its breakdown when one was asked for
 * @returns the window, its compaction limit, its reserve and its mode
 */
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
  const { autoCompactThreshold } = breakdown

  const reserved =
    isAutoCompact && typeof autoCompactThreshold === 'number'
      ? limit - autoCompactThreshold
      : breakdown.categories
          .filter(row => row.kind === 'buffer')
          .reduce((sum, row) => sum + row.tokens, 0)

  return {
    window: context.window,
    limit,
    buffer: Math.min(limit, Math.max(0, reserved)),
    isAutoCompact,
  }
}
