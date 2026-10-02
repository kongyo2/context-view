import { describe, expect, test } from 'claude-code/testing'

import Readings from '../../hooks/readings'

describe('fill-of', () => {
  test('nothing before the first response of the window', () => {
    expect(Readings.fillOf({ window: 200_000 })).toBeNull()
  })

  test("the engine's tokens and percentage", () => {
    expect(
      Readings.fillOf({ window: 200_000, tokens: 84_100, percent: 42 }),
    ).toEqual({ tokens: 84_100, percent: 42 })
  })

  test('a percentage the engine left out is figured from the tokens', () => {
    expect(Readings.fillOf({ window: 200_000, tokens: 84_100 })).toEqual({
      tokens: 84_100,
      percent: 42,
    })
  })
})
