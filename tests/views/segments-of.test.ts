import { describe, expect, test } from 'claude-code/testing'

import Views from '../../hooks/views'
import Fixtures from '../fixtures'

describe('segments-of', () => {
  test('calm: the percentage in colour, the tokens and the headroom dim', () => {
    expect(Views.segmentsOf(Fixtures.WINDOW, Fixtures.fillAt(84_100))).toEqual([
      { text: '42%', isDim: false },
      { text: '84.1k/200k tokens', isDim: true },
      { text: '82.9k until auto-compact', isDim: true },
    ])
  })

  test('warning and error: the headroom in colour too', () => {
    expect(
      Views.segmentsOf(Fixtures.WINDOW, Fixtures.fillAt(134_400))[2],
    ).toEqual({ text: '32.6k until auto-compact', isDim: false })

    expect(
      Views.segmentsOf(Fixtures.WINDOW, Fixtures.fillAt(160_000))[2],
    ).toEqual({ text: '7k until auto-compact', isDim: false })
  })

  test('a window of a million prints as Claude Code prints it', () => {
    const wide = { ...Fixtures.WINDOW, window: 1_000_000, limit: 1_000_000 }

    expect(
      Views.segmentsOf(wide, { tokens: 250_000, percent: 25 })[1]?.text,
    ).toBe('250k/1m tokens')
  })
})
