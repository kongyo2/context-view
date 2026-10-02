import type { TurnStepInput } from 'claude-code'

/**
 * The first request of a turn: the main loop's, or a subagent's when
 * `agentId` names one.
 *
 * @param agentId the subagent the request is made in, if any
 * @returns the step
 */
export function stepOf(agentId?: string): TurnStepInput {
  return {
    turnId: agentId === undefined ? 't1' : 'a1',
    index: 0,
    model: 'claude-test',
    messageCount: 1,
    ...(agentId !== undefined && { agentId }),
  }
}
