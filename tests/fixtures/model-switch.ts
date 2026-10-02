import type { ClassicFields } from 'claude-code/testing'

export const MODEL_SWITCH: ClassicFields<'PostModelSwitch'> = {
  from_model: 'claude-test',
  to_model: 'claude-test-wide',
  requested_model: 'claude-test-wide',
  source: 'command',
  context_tokens: 84_100,
  prompt_cache_warm: true,
  cache_ttl: '5m',
  estimated_cache_write_usd: 0.3,
  pricing: 'catalog',
}
