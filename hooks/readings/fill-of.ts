import type { SessionContextUsage } from 'claude-code'

import type { ContextViewFill } from '../../types'
import { percentOf } from './percent-of.js'

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
