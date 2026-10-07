import type { TurnStepResult } from 'claude-code'
import { describe, expect, test, tier } from 'claude-code/testing'

import Readings from '../../hooks/readings'
import Fixtures from '../fixtures'

tier('user')

const STEP: TurnStepResult = {
  turnId: 't1',
  index: 0,
  answer: 'ok',
  toolUses: [],
  stopReason: 'end_turn',
  usage: {
    input_tokens: 10_000,
    output_tokens: 500,
    cache_read_input_tokens: 90_000,
    cache_creation_input_tokens: 0,
    model: 'claude-test',
  },
}

describe('is-loop-total', () => {
  test('a request the API answered by itself reports its own window', () => {
    expect(Readings.isLoopTotal(STEP)).toBe(false)
    expect(Readings.isLoopTotal({ ...STEP, serverToolUses: [] })).toBe(false)
  })

  test('a request in which the API ran a tool of its own, the advisor, reports its loop summed', () => {
    expect(
      Readings.isLoopTotal({ ...STEP, serverToolUses: [Fixtures.ADVISOR_USE] }),
    ).toBe(true)
  })
})
