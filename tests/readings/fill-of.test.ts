import { describe, expect, test, tier } from 'claude-code/testing'

import Readings from '../../hooks/readings'
import Fixtures from '../fixtures'

tier('user')

describe('fill-of', () => {
  test("the engine's tokens and percentage", () => {
    expect(
      Readings.fillOf({ window: 200_000, tokens: 84_100, percent: 42 }),
    ).toEqual({ tokens: 84_100, percent: 42, isEstimate: false, output: 0 })
  })

  test('a percentage the engine left out is figured from the tokens', () => {
    expect(Readings.fillOf({ window: 200_000, tokens: 84_100 })).toEqual({
      tokens: 84_100,
      percent: 42,
      isEstimate: false,
      output: 0,
    })
  })

  test("what the last response wrote, from the breakdown's record of it", () => {
    const { context } = Fixtures.usageOf(84_100, { output: 1_200 })

    expect(Readings.fillOf(context)?.output).toBe(1_200)
  })

  test("a live figure wins over the breakdown's total", () => {
    const { context } = Fixtures.usageOf(84_100)

    expect(context.breakdown).toBeDefined()

    if (!context.breakdown) {
      return
    }

    expect(
      Readings.fillOf({
        ...context,
        breakdown: { ...context.breakdown, totalTokens: 90_000 },
      }),
    ).toEqual({ tokens: 84_100, percent: 42, isEstimate: false, output: 0 })
  })

  test("before the window's first response, the breakdown's estimate, marked as one", () => {
    const { context } = Fixtures.usageOf(undefined, { estimate: 15_900 })

    expect(Readings.fillOf(context)).toEqual({
      tokens: 15_900,
      percent: 8,
      isEstimate: true,
    })
  })

  test('nothing with neither a figure nor an estimate', () => {
    expect(Readings.fillOf({ window: 200_000 })).toBeNull()

    expect(Readings.fillOf(Fixtures.usageOf().context)).toBeNull()
  })
})
