import type { ModelUsage } from 'claude-code'

export function tokensOf(usage: ModelUsage): number {
  return (
    usage.input_tokens +
    usage.cache_read_input_tokens +
    usage.cache_creation_input_tokens
  )
}
