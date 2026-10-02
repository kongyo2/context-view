import { describe, expect, test } from 'claude-code/testing'

import { fillOf, percentOf } from '../hooks/fill-of'
import { tokensOf } from '../hooks/tokens-of'
import { windowOf } from '../hooks/window-of'
import { usageOf } from './fixtures'

describe('window-of', () => {
  test("the reserve is the window above the engine's auto-compact threshold", () => {
    expect(windowOf(usageOf(84_100).context)).toEqual({
      window: 200_000,
      limit: 200_000,
      buffer: 33_000,
      isAutoCompact: true,
    })
  })

  test('with auto-compact off, the buffer rows are the reserve', () => {
    expect(windowOf(usageOf(84_100, { isAutoCompact: false }).context)).toEqual(
      {
        window: 200_000,
        limit: 200_000,
        buffer: 3_000,
        isAutoCompact: false,
      },
    )
  })

  test('a capped compaction window is the limit', () => {
    const { context } = usageOf(84_100)

    const capped = {
      ...context,
      breakdown: {
        ...context.breakdown!,
        rawMaxTokens: 100_000,
        maxTokens: 100_000,
        autoCompactThreshold: 67_000,
      },
    }

    expect(windowOf(capped)).toEqual({
      window: 200_000,
      limit: 100_000,
      buffer: 33_000,
      isAutoCompact: true,
    })
  })

  test('without a breakdown the usual reserve stands in', () => {
    expect(windowOf({ window: 200_000, tokens: 84_100, percent: 42 })).toEqual({
      window: 200_000,
      limit: 200_000,
      buffer: 33_000,
      isAutoCompact: true,
    })

    expect(windowOf({ window: 20_000 }).buffer).toBe(20_000)
  })

  test('the fill waits for the first response', () => {
    expect(fillOf({ window: 200_000 })).toBeNull()

    expect(fillOf({ window: 200_000, tokens: 84_100, percent: 42 })).toEqual({
      tokens: 84_100,
      percent: 42,
    })

    expect(fillOf({ window: 200_000, tokens: 84_100 })).toEqual({
      tokens: 84_100,
      percent: 42,
    })
  })

  test('the percentage is whole and within 0 to 100', () => {
    expect(percentOf(84_100, 200_000)).toBe(42)
    expect(percentOf(260_000, 200_000)).toBe(100)
    expect(percentOf(10, 0)).toBe(0)
  })

  test("a request's input is its three input counts together", () => {
    expect(
      tokensOf({
        input_tokens: 10_000,
        output_tokens: 500,
        cache_read_input_tokens: 90_000,
        cache_creation_input_tokens: 2_000,
      }),
    ).toBe(102_000)
  })
})
