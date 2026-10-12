import { describe, expect, test, tier } from 'claude-code/testing'

import Awareness from '../../hooks/awareness'

tier('user')

describe('tokens-option-of', () => {
  test('a count of tokens stands, whole', () => {
    expect(Awareness.tokensOptionOf(400_000, 0)).toBe(400_000)
    expect(Awareness.tokensOptionOf(0, 20_000)).toBe(0)
    expect(Awareness.tokensOptionOf(1_500.7, 0)).toBe(1_500)
  })

  test('anything else is the default', () => {
    for (const value of [-1, Number.NaN, Infinity, '400000', true, undefined]) {
      expect(Awareness.tokensOptionOf(value, 20_000)).toBe(20_000)
    }
  })
})
