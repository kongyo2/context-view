import { describe, expect, test } from 'claude-code/testing'

import { headroomOf, stateOf } from '../hooks/state-of'

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

describe('state-of', () => {
  test('the headroom is the threshold less the context', () => {
    expect(headroomOf(WINDOW, fillOf(84_100))).toBe(82_900)
    expect(headroomOf(WINDOW, fillOf(170_000))).toBe(-3_000)
  })

  test('calm while there is room', () => {
    expect(stateOf(WINDOW, fillOf(0))).toBe('calm')
    expect(stateOf(WINDOW, fillOf(84_100))).toBe('calm')
    expect(stateOf(WINDOW, fillOf(100_199))).toBe('calm')
  })

  test('warning from six tenths of the threshold', () => {
    expect(stateOf(WINDOW, fillOf(100_200))).toBe('warning')
    expect(stateOf(WINDOW, fillOf(134_400))).toBe('warning')
    expect(stateOf(WINDOW, fillOf(146_999))).toBe('warning')
  })

  test("error within the stretch where Claude Code's own line says the context is low", () => {
    expect(stateOf(WINDOW, fillOf(147_000))).toBe('error')
    expect(stateOf(WINDOW, fillOf(167_000))).toBe('error')
    expect(stateOf(WINDOW, fillOf(199_000))).toBe('error')
  })

  test('a capped compaction window moves the states down with it', () => {
    const capped = { ...WINDOW, limit: 100_000 }

    expect(stateOf(capped, fillOf(40_000))).toBe('calm')
    expect(stateOf(capped, fillOf(40_200))).toBe('warning')
    expect(stateOf(capped, fillOf(47_000))).toBe('error')
  })
})
