import type { SessionContextUsage } from 'claude-code'

import type { ContextViewFill, ContextViewWindow } from '../../types'

export function isOutdated(
  context: SessionContextUsage,
  window: ContextViewWindow | null,
  fill: ContextViewFill | null,
): boolean {
  if (!window || window.window !== context.window) {
    return true
  }

  if (context.tokens === undefined) {
    return fill !== null && !fill.isEstimate
  }

  return !fill || fill.isEstimate || fill.tokens !== context.tokens
}
