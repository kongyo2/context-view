import { describe, expect, test } from 'claude-code/testing'

import Views from '../../hooks/views'
import Fixtures from '../fixtures'

describe('headroom-text-of', () => {
  test('auto-compact on: the tokens left until it, then that it runs next', () => {
    const textAt = (tokens: number) =>
      Views.headroomTextOf(Fixtures.WINDOW, Fixtures.fillAt(tokens))

    expect(textAt(84_100)).toBe('82.9k until auto-compact')
    expect(textAt(166_500)).toBe('500 until auto-compact')
    expect(textAt(167_000)).toBe('auto-compact next')
    expect(textAt(170_000)).toBe('auto-compact next')
  })

  test('auto-compact off: the tokens left before the limit, then the ask to run /compact', () => {
    const textAt = (tokens: number) =>
      Views.headroomTextOf(Fixtures.MANUAL_WINDOW, Fixtures.fillAt(tokens))

    expect(textAt(84_100)).toBe('112.9k before the limit')
    expect(textAt(197_000)).toBe('run /compact to continue')
  })
})
