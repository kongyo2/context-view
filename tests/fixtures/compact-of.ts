import type { SessionCompactInput, SessionCompactTrigger } from 'claude-code'

/**
 * A compaction about to run over a one-prompt transcript: the main
 * conversation's, or a subagent's when `agentId` names one.
 *
 * @param trigger what is compacting
 * @param agentId the subagent whose transcript it is, if any
 * @returns the compaction's input
 */
export const compactOf = (
  trigger: SessionCompactTrigger,
  agentId?: string,
): SessionCompactInput => ({
  trigger,
  messages: [{ role: 'user', text: 'Read the hooks.', toolUses: [] }],
  ...(agentId !== undefined && { agentId }),
})
