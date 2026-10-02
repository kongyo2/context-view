import type { SessionMeasureInput } from 'claude-code'

import { WINDOW_TOKENS } from './window-tokens.js'

export function measureOf(tokens: number): SessionMeasureInput {
  return {
    context: {
      tokens,
      window: WINDOW_TOKENS,
      percent: Math.round((tokens / WINDOW_TOKENS) * 100),
    },
    rateLimits: [],
    changed: ['context'],
  }
}
