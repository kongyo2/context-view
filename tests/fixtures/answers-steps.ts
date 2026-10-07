import type { On, TurnStepServerToolUse } from 'claude-code'

export function answersSteps(
  on: On,
  tokens: () => number,
  output = 1,
  serverToolUses: () => readonly TurnStepServerToolUse[] = () => [],
): void {
  on('turn.step', async function* ($, e) {
    yield { kind: 'text', index: 0, text: 'ok' }

    const uses = serverToolUses()

    return {
      turnId: e.turnId,
      index: e.index,
      answer: 'ok',
      toolUses: [],
      ...(uses.length > 0 && { serverToolUses: uses }),
      stopReason: 'end_turn',
      usage: {
        input_tokens: 10_000,
        output_tokens: output,
        cache_read_input_tokens: tokens() - 10_000,
        cache_creation_input_tokens: 0,
        model: 'claude-test',
      },
    }
  })
}
