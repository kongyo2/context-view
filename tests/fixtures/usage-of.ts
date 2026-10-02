import type { SessionUsage } from 'claude-code'

import { MANUAL_RESERVE_TOKENS } from './manual-reserve-tokens.js'
import { RESERVE_TOKENS } from './reserve-tokens.js'
import { WINDOW_TOKENS } from './window-tokens.js'

/**
 * What `$.session.usage({ breakdown: 'summary' })` answers for a session
 * whose context holds `tokens`: the window, its fill once a response has
 * landed (none while `tokens` is left out), and a breakdown totalling the
 * same, or the engine's estimate before then; with the auto-compact
 * threshold a reserve under the window (or under the window a setting caps
 * it to), or with auto-compact off and a manual buffer row instead.
 *
 * @param tokens the context's tokens; left out before the first response
 * @param options `isAutoCompact`: false for a session with auto-compact off;
 *   `estimate`: the breakdown's total while no response has landed;
 *   `window`: the model's window, the fixtures' when left out; `limit`: the
 *   window compaction measures against, when a setting caps it
 * @returns the usage
 */
export function usageOf(
  tokens?: number,
  options: {
    isAutoCompact?: boolean
    estimate?: number
    window?: number
    limit?: number
  } = {},
): SessionUsage {
  const {
    isAutoCompact = true,
    estimate = 0,
    window = WINDOW_TOKENS,
    limit = window,
  } = options
  const used = tokens ?? estimate
  const reserve = isAutoCompact ? RESERVE_TOKENS : MANUAL_RESERVE_TOKENS

  return {
    startedAt: 0,
    rateLimits: [],
    context: {
      window,
      ...(tokens !== undefined && {
        tokens,
        percent: Math.round((tokens / window) * 100),
      }),
      breakdown: {
        categories: [
          {
            name: 'Messages',
            tokens: used,
            color: 'purple_FOR_SUBAGENTS_ONLY',
            isDeferred: false,
            kind: 'used',
          },
          {
            name: isAutoCompact ? 'Autocompact buffer' : 'Compact buffer',
            tokens: reserve,
            color: 'inactive',
            isDeferred: false,
            kind: 'buffer',
          },
          {
            name: 'Free space',
            tokens: Math.max(0, limit - used - reserve),
            color: 'promptBorder',
            isDeferred: false,
            kind: 'free',
          },
        ],
        totalTokens: used,
        maxTokens: limit,
        rawMaxTokens: limit,
        autocompactSource: 'model-default',
        percentage: Math.round((used / limit) * 100),
        gridRows: [],
        model: 'claude-test',
        memoryFiles: [],
        mcpTools: [],
        agents: [],
        ...(isAutoCompact && {
          autoCompactThreshold: limit - RESERVE_TOKENS,
        }),
        isAutoCompactEnabled: isAutoCompact,
        apiUsage: null,
      },
    },
  }
}
