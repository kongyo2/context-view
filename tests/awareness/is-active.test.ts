import { describe, expect, test, tier } from 'claude-code/testing'

import Awareness from '../../hooks/awareness'
import Fixtures from '../fixtures'

tier('user')

describe('is-active', () => {
  test('with neither count set, from the start', () => {
    for (const tokens of [1, 84_100, 199_000]) {
      expect(
        Awareness.isActive(
          Fixtures.AWARENESS,
          Fixtures.WINDOW,
          Fixtures.fillAt(tokens),
        ),
      ).toBe(true)
    }
  })

  test('from a count of tokens: once the context holds it', () => {
    const from = { ...Fixtures.AWARENESS, fromTokens: 400_000 }
    const isActiveAt = (tokens: number) =>
      Awareness.isActive(from, Fixtures.WIDE_WINDOW, Fixtures.fillAt(tokens))

    expect(isActiveAt(399_999)).toBe(false)
    expect(isActiveAt(400_000)).toBe(true)
    expect(isActiveAt(612_000)).toBe(true)
  })

  test('within a count of auto-compact: once that much or less is left, the last reply counted', () => {
    const within = { ...Fixtures.AWARENESS, withinTokens: 50_000 }
    const isActiveAt = (tokens: number, output = 0) =>
      Awareness.isActive(within, Fixtures.WINDOW, {
        ...Fixtures.fillAt(tokens),
        output,
      })

    expect(isActiveAt(116_999)).toBe(false)
    expect(isActiveAt(117_000)).toBe(true)
    expect(isActiveAt(116_000, 1_000)).toBe(true)
  })

  test('with both set, whichever is reached first', () => {
    const both = {
      ...Fixtures.AWARENESS,
      fromTokens: 400_000,
      withinTokens: 50_000,
    }

    expect(
      Awareness.isActive(both, Fixtures.WINDOW, Fixtures.fillAt(120_000)),
      'a 200k window never holds 400k',
    ).toBe(true)

    expect(
      Awareness.isActive(both, Fixtures.WIDE_WINDOW, Fixtures.fillAt(400_000)),
    ).toBe(true)

    expect(
      Awareness.isActive(both, Fixtures.WIDE_WINDOW, Fixtures.fillAt(300_000)),
    ).toBe(false)
  })
})
