import type { SessionMeasureInput } from 'claude-code'

import { WINDOW_TOKENS } from './window-tokens.js'

export function measureOf(
  tokens: number,
  window = WINDOW_TOKENS,
): SessionMeasureInput {
  return {
    context: {
      tokens,
      window,
      percent: Math.round((tokens / window) * 100),
    },
    rateLimits: [],
    changed: ['context'],
  }
}
