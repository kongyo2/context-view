import { describe, expect, test } from 'claude-code/testing'

import Readings from '../../hooks/readings'
import Fixtures from '../fixtures'

describe('window-of', () => {
  test("the reserve is the window above the engine's auto-compact threshold", () => {
    expect(Readings.windowOf(Fixtures.usageOf(84_100).context)).toEqual(
      Fixtures.WINDOW,
    )
  })

  test("with auto-compact off, the buffer rows' tokens are the reserve", () => {
    expect(
      Readings.windowOf(
        Fixtures.usageOf(84_100, { isAutoCompact: false }).context,
      ),
    ).toEqual(Fixtures.MANUAL_WINDOW)
  })

  test('a capped compaction window is the limit', () => {
    const { context } = Fixtures.usageOf(84_100)
    const breakdown = context.breakdown

    expect(breakdown).toBeDefined()

    if (!breakdown) {
      return
    }

    expect(
      Readings.windowOf({
        ...context,
        breakdown: {
          ...breakdown,
          rawMaxTokens: 100_000,
          maxTokens: 100_000,
          autoCompactThreshold: 67_000,
        },
      }),
    ).toEqual({
      window: 200_000,
      limit: 100_000,
      buffer: 33_000,
      isAutoCompact: true,
    })
  })

  test('without a breakdown the usual reserve stands in, never past the window', () => {
    expect(
      Readings.windowOf({ window: 200_000, tokens: 84_100, percent: 42 }),
    ).toEqual(Fixtures.WINDOW)

    expect(Readings.windowOf({ window: 20_000 }).buffer).toBe(20_000)
  })
})
