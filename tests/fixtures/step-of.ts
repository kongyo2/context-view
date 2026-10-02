import type { TurnStepInput } from 'claude-code'

export function stepOf(agentId?: string): TurnStepInput {
  return {
    turnId: agentId === undefined ? 't1' : 'a1',
    index: 0,
    model: 'claude-test',
    messageCount: 1,
    ...(agentId !== undefined && { agentId }),
  }
}
