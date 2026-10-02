import { describe, expect, test, tier } from 'claude-code/testing'

import Views from '../../hooks/views'
import Fixtures from '../fixtures'

tier('user')

describe('headroom-text-of', () => {
  test('auto-compact on: the tokens left until it, then that it runs next', () => {
    const textAt = (tokens: number) =>
      Views.headroomTextOf(Fixtures.WINDOW, Fixtures.fillAt(tokens))

    expect(textAt(84_100)).toBe('82.9k until auto-compact')
    expect(textAt(166_500)).toBe('500 until auto-compact')
    expect(textAt(167_000)).toBe('auto-compact next')
    expect(textAt(170_000)).toBe('auto-compact next')
  })

  test('auto-compact off: the tokens left before Claude Code stops sending requests, then the ask to run /compact', () => {
    const textAt = (tokens: number) =>
      Views.headroomTextOf(Fixtures.MANUAL_WINDOW, Fixtures.fillAt(tokens))

    expect(textAt(84_100)).toBe('92.9k before the limit')
    expect(textAt(176_500)).toBe('500 before the limit')
    expect(textAt(177_000)).toBe('run /compact to continue')
  })

  test('a count from an estimate is marked as one; the words without a count are not', () => {
    const textAt = (window: typeof Fixtures.WINDOW, tokens: number) =>
      Views.headroomTextOf(window, Fixtures.fillAt(tokens, true))

    expect(textAt(Fixtures.WINDOW, 84_100)).toBe('~82.9k until auto-compact')
    expect(textAt(Fixtures.MANUAL_WINDOW, 84_100)).toBe(
      '~92.9k before the limit',
    )
    expect(textAt(Fixtures.WINDOW, 170_000)).toBe('auto-compact next')
    expect(textAt(Fixtures.MANUAL_WINDOW, 197_000)).toBe(
      'run /compact to continue',
    )
  })

  test('a capped window counts down to its own threshold', () => {
    const capped = { ...Fixtures.WINDOW, window: 1_000_000, limit: 150_000 }

    expect(
      Views.headroomTextOf(capped, {
        tokens: 33_800,
        percent: 3,
        isEstimate: false,
      }),
    ).toBe('83.2k until auto-compact')
  })
})
