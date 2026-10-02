import { describe, expect, test, tier } from 'claude-code/testing'

import Readings from '../../hooks/readings'
import Fixtures from '../fixtures'

tier('user')

describe('window-of', () => {
  test("with auto-compact on, the reserve is the breakdown's autocompact buffer, past the threshold", () => {
    expect(Readings.windowOf(Fixtures.usageOf(84_100).context)).toEqual(
      Fixtures.WINDOW,
    )
  })

  test('where compaction waits for the API to refuse a full window, there is no reserve, whatever the threshold says', () => {
    const { context } = Fixtures.usageOf(84_100, { isEnforced: false })

    expect(context.breakdown?.autoCompactThreshold).toBe(167_000)
    expect(Readings.windowOf(context)).toEqual(Fixtures.REACTIVE_WINDOW)
  })

  test("with auto-compact off, the reserve is the compact buffer and Claude Code's room for a reply", () => {
    expect(
      Readings.windowOf(
        Fixtures.usageOf(84_100, { isAutoCompact: false }).context,
      ),
    ).toEqual(Fixtures.MANUAL_WINDOW)
  })

  test('a capped compaction window is the limit', () => {
    expect(
      Readings.windowOf(
        Fixtures.usageOf(84_100, { window: 1_000_000, limit: 150_000 }).context,
      ),
    ).toEqual({
      window: 1_000_000,
      limit: 150_000,
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
