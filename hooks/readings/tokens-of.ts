import type { ModelUsage } from 'claude-code'

/**
 * The input tokens one request was answered over: uncached, read from the
 * prompt cache and written to it together, which is the context's size at
 * that request (the status line's `total_input_tokens`).
 *
 * @param usage what the API reported for the request
 * @returns the tokens
 */
export function tokensOf(usage: ModelUsage): number {
  return (
    usage.input_tokens +
    usage.cache_read_input_tokens +
    usage.cache_creation_input_tokens
  )
}
