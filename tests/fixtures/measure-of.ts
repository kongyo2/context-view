import type { SessionMeasureInput } from 'claude-code'

import { WINDOW_TOKENS } from './window-tokens.js'

/**
 * The measurement the engine raises after a turn whose last response was
 * answered over `tokens` of the fixtures' window.
 *
 * @param tokens the context's tokens
 * @returns the measurement, its context the one unit that moved
 */
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
