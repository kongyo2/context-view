import type { SessionMeasureInput } from 'claude-code'

import { WINDOW } from './usage-of'

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
      window: WINDOW,
      percent: Math.round((tokens / WINDOW) * 100),
    },
    rateLimits: [],
    changed: ['context'],
  }
}
