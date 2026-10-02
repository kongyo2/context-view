import { describe, expect, test } from 'claude-code/testing'

import Readings from '../../hooks/readings'

describe('tokens-of', () => {
  test("a request's input is its three input counts together", () => {
    expect(
      Readings.tokensOf({
        input_tokens: 10_000,
        output_tokens: 500,
        cache_read_input_tokens: 90_000,
        cache_creation_input_tokens: 2_000,
      }),
    ).toBe(102_000)
  })
})
