import type { SessionUsage } from 'claude-code'

/**
 * The window every fixture measures against: 200k tokens.
 */
export const WINDOW = 200_000

/**
 * The reserve the fixtures' breakdown keeps at the window's end where
 * auto-compact is on: the threshold sits that far under the window.
 */
export const RESERVE = 33_000

/**
 * The reserve the fixtures' breakdown keeps where auto-compact is off: the
 * small buffer a manual /compact needs.
 */
export const MANUAL_RESERVE = 3_000

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
  const reserve = isAutoCompact ? RESERVE : MANUAL_RESERVE

  return {
    startedAt: 0,
    rateLimits: [],
    context: {
      window: WINDOW,
      ...(tokens !== undefined && {
        tokens,
        percent: Math.round((tokens / WINDOW) * 100),
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
            tokens: Math.max(0, WINDOW - used - reserve),
            color: 'promptBorder',
            isDeferred: false,
            kind: 'free',
          },
        ],
        totalTokens: used,
        maxTokens: WINDOW,
        rawMaxTokens: WINDOW,
        autocompactSource: 'model-default',
        percentage: Math.round((used / WINDOW) * 100),
        gridRows: [],
        model: 'claude-test',
        memoryFiles: [],
        mcpTools: [],
        agents: [],
        ...(isAutoCompact && { autoCompactThreshold: WINDOW - RESERVE }),
        isAutoCompactEnabled: isAutoCompact,
        apiUsage: null,
      },
    },
  }
}
