import type { SessionCompactInput, SessionCompactTrigger } from 'claude-code'

export const compactOf = (
  trigger: SessionCompactTrigger,
  agentId?: string,
): SessionCompactInput => ({
  trigger,
  messages: [{ role: 'user', text: 'Read the hooks.', toolUses: [] }],
  ...(agentId !== undefined && { agentId }),
})
