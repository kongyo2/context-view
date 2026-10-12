import type { PromptSubmitInput } from 'claude-code'

export const promptOf = (
  context?: readonly string[],
  text = 'Carry on.',
): PromptSubmitInput => ({
  text,
  wait: false,
  origin: { kind: 'composer' },
  ...(context !== undefined && { context }),
})
