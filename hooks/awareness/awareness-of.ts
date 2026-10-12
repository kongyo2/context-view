import type { PluginOptions } from 'claude-code'

import Limits from '../limits'
import type { Awareness } from './awareness.js'
import { placeOf } from './place-of.js'
import { tokensOptionOf } from './tokens-option-of.js'

export function awarenessOf(options: PluginOptions): Awareness | null {
  if (options.awareness !== true) {
    return null
  }

  const place = placeOf(options.awarenessAt)

  return {
    fromTokens: tokensOptionOf(options.awarenessFrom, 0),
    withinTokens: tokensOptionOf(options.awarenessWithin, 0),
    stepTokens: tokensOptionOf(
      options.awarenessStep,
      Limits.AWARENESS_STEP_TOKENS,
    ),
    isOnPrompts: place !== 'tool-results',
    isOnToolResults: place !== 'prompts',
  }
}
