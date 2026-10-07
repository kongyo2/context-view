import type { TurnStepResult } from 'claude-code'

export function isLoopTotal(step: TurnStepResult): boolean {
  return (step.serverToolUses?.length ?? 0) > 0
}
