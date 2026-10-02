import type { SessionUsage } from 'claude-code'

import { MANUAL_RESERVE_TOKENS } from './manual-reserve-tokens.js'
import { RESERVE_TOKENS } from './reserve-tokens.js'
import { WINDOW_TOKENS } from './window-tokens.js'

/**
 * What `$.session.usage({ breakdown: 'summary' })` answers for a session
 * whose context holds `tokens`: the window, its fill once a response has
 * landed (none while `tokens` is left out), and a breakdown with the
 * auto-compact threshold a reserve under the window, or with auto-compact
 * off and a manual buffer row instead.
 *
 * @param tokens the context's tokens; left out before the first response
 * @param options `isAutoCompact`: false for a session with auto-compact off
 * @returns the usage
 */
export function usageOf(
  tokens?: number,
  options: { isAutoCompact?: boolean } = {},
): SessionUsage {
  const { isAutoCompact = true } = options
  const used = tokens ?? 0
  const reserve = isAutoCompact ? RESERVE_TOKENS : MANUAL_RESERVE_TOKENS

  return {
    startedAt: 0,
    rateLimits: [],
    context: {
      window: WINDOW_TOKENS,
      ...(tokens !== undefined && {
        tokens,
        percent: Math.round((tokens / WINDOW_TOKENS) * 100),
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
            tokens: Math.max(0, WINDOW_TOKENS - used - reserve),
            color: 'promptBorder',
            isDeferred: false,
            kind: 'free',
          },
        ],
        totalTokens: used,
        maxTokens: WINDOW_TOKENS,
        rawMaxTokens: WINDOW_TOKENS,
        autocompactSource: 'model-default',
        percentage: Math.round((used / WINDOW_TOKENS) * 100),
        gridRows: [],
        model: 'claude-test',
        memoryFiles: [],
        mcpTools: [],
        agents: [],
        ...(isAutoCompact && {
          autoCompactThreshold: WINDOW_TOKENS - RESERVE_TOKENS,
        }),
        isAutoCompactEnabled: isAutoCompact,
        apiUsage: null,
      },
    },
  }
}
