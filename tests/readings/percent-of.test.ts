import { describe, expect, test, tier } from 'claude-code/testing'

import Readings from '../../hooks/readings'

tier('user')

describe('percent-of', () => {
  test('whole, as the status line rounds it', () => {
    expect(Readings.percentOf(84_100, 200_000)).toBe(42)
    expect(Readings.percentOf(197_500, 200_000)).toBe(99)
  })

  test('within 0 to 100', () => {
    expect(Readings.percentOf(260_000, 200_000)).toBe(100)
    expect(Readings.percentOf(-10, 200_000)).toBe(0)
  })

  test('nothing over no window', () => {
    expect(Readings.percentOf(10, 0)).toBe(0)
  })
})
