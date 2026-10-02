import { describe, expect, test } from 'claude-code/testing'

import { meterOf } from '../hooks/meter-of'

const WINDOW = {
  window: 200_000,
  limit: 200_000,
  buffer: 33_000,
  isAutoCompact: true,
}

const fillOf = (tokens: number) => ({
  tokens,
  percent: Math.round((tokens / WINDOW.window) * 100),
})

describe('meter-of', () => {
  test('the reserve takes the last cells, rounded, at least one', () => {
    expect(meterOf(WINDOW, fillOf(0), 10)).toEqual([
      ...Array<'free'>(8).fill('free'),
      'buffer',
      'buffer',
    ])

    expect(meterOf({ ...WINDOW, buffer: 3_000 }, fillOf(0), 10)).toEqual([
      ...Array<'free'>(9).fill('free'),
      'buffer',
    ])

    expect(meterOf({ ...WINDOW, buffer: 0 }, fillOf(0), 10)).toEqual(
      Array<'free'>(10).fill('free'),
    )
  })

  test('a cell part filled draws hollow, and full from seven tenths', () => {
    expect(meterOf(WINDOW, fillOf(84_100), 10)).toEqual([
      'used',
      'used',
      'used',
      'used',
      'partial',
      'free',
      'free',
      'free',
      'buffer',
      'buffer',
    ])

    expect(meterOf(WINDOW, fillOf(134_400), 10)).toEqual([
      ...Array<'used'>(7).fill('used'),
      'free',
      'buffer',
      'buffer',
    ])
  })

  test('the smallest context still shows as one hollow cell', () => {
    expect(meterOf(WINDOW, fillOf(1), 10)[0]).toBe('partial')
    expect(meterOf(WINDOW, fillOf(0), 10)[0]).toBe('free')
  })

  test('a floating-point crumb does not draw a hollow cell', () => {
    expect(meterOf(WINDOW, fillOf(60_000), 10)).toEqual([
      'used',
      'used',
      'used',
      ...Array<'free'>(5).fill('free'),
      'buffer',
      'buffer',
    ])
  })

  test('a context past the threshold eats into the reserve, never past the meter', () => {
    expect(meterOf(WINDOW, fillOf(175_000), 10)).toEqual([
      ...Array<'used'>(9).fill('used'),
      'buffer',
    ])

    expect(meterOf(WINDOW, fillOf(200_000), 10)).toEqual(
      Array<'used'>(10).fill('used'),
    )

    expect(meterOf(WINDOW, fillOf(260_000), 10)).toEqual(
      Array<'used'>(10).fill('used'),
    )
  })

  test('the narrow meter keeps the same shape over five cells', () => {
    expect(meterOf(WINDOW, fillOf(84_100), 5)).toEqual([
      'used',
      'used',
      'partial',
      'free',
      'buffer',
    ])
  })

  test('a window of a million tokens measures the same way', () => {
    const wide = { ...WINDOW, window: 1_000_000, limit: 1_000_000 }

    expect(meterOf(wide, fillOf(500_000), 10)).toEqual([
      ...Array<'used'>(5).fill('used'),
      ...Array<'free'>(4).fill('free'),
      'buffer',
    ])
  })
})
