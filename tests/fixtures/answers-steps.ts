import type { On } from 'claude-code'

/**
 * Answers each request of a turn beneath the plugin as the API would: one
 * piece of text, then usage whose input side totals what `tokens` reads at
 * that moment.
 *
 * @param on the test's `on`
 * @param tokens the context's tokens at each request
 */
export function answersSteps(on: On, tokens: () => number): void {
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
        output_tokens: 1,
        cache_read_input_tokens: tokens() - 10_000,
        cache_creation_input_tokens: 0,
        model: 'claude-test',
      },
    }
  })
}
