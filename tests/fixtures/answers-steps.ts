import type { On } from 'claude-code'

export function answersSteps(on: On, tokens: () => number, output = 1): void {
  on('turn.step', async function* ($, e) {
    yield { kind: 'text', index: 0, text: 'ok' }

    return {
      turnId: e.turnId,
      index: e.index,
      answer: 'ok',
      toolUses: [],
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
