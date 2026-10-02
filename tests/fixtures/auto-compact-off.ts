import type { ConfigSetInput } from 'claude-code'

/**
 * The person turning auto-compact off in `/config`.
 */
export const AUTO_COMPACT_OFF: ConfigSetInput = {
  key: 'autoCompact',
  value: false,
  previous: true,
  provider: { plugin: 'engine', tier: 'core' },
  origin: { kind: 'composer' },
}
