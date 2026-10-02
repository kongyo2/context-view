import type { SessionUsage } from 'claude-code'

import { COMPACT_BUFFER_TOKENS } from './compact-buffer-tokens.js'
import { RESERVE_TOKENS } from './reserve-tokens.js'
import { WINDOW_TOKENS } from './window-tokens.js'

export function usageOf(
  tokens?: number,
  options: {
    isAutoCompact?: boolean
    isEnforced?: boolean
    estimate?: number
    output?: number
    window?: number
    limit?: number
  } = {},
): SessionUsage {
  const {
    isAutoCompact = true,
    isEnforced = true,
    estimate = 0,
    output = 0,
    window = WINDOW_TOKENS,
    limit = window,
  } = options
  const used = tokens ?? estimate

  const reserve = isAutoCompact
    ? isEnforced
      ? RESERVE_TOKENS
      : 0
    : COMPACT_BUFFER_TOKENS

  const buffers =
    reserve > 0
      ? [
          {
            name: isAutoCompact ? 'Autocompact buffer' : 'Compact buffer',
            tokens: reserve,
            color: 'inactive',
            isDeferred: false,
            kind: 'buffer' as const,
          },
        ]
      : []

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
          ...buffers,
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
        autocompactSource: isEnforced ? 'model-default' : 'auto',
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
        apiUsage:
          tokens === undefined
            ? null
            : {
                input_tokens: tokens,
                output_tokens: output,
                cache_creation_input_tokens: 0,
                cache_read_input_tokens: 0,
              },
      },
    },
  }
}
