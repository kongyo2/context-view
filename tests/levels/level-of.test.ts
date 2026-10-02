import { describe, expect, test } from 'claude-code/testing'

import Levels from '../../hooks/levels'
import Fixtures from '../fixtures'

describe('level-of', () => {
  test('calm while there is room', () => {
    for (const tokens of [0, 84_100, 100_199]) {
      expect(Levels.levelOf(Fixtures.WINDOW, Fixtures.fillAt(tokens))).toBe(
        'calm',
      )
    }
  })

  test('warning from six tenths of the threshold', () => {
    for (const tokens of [100_200, 134_400, 146_999]) {
      expect(Levels.levelOf(Fixtures.WINDOW, Fixtures.fillAt(tokens))).toBe(
        'warning',
      )
    }
  })

  test("error within the stretch where Claude Code's own line says the context is low", () => {
    for (const tokens of [147_000, 167_000, 199_000]) {
      expect(Levels.levelOf(Fixtures.WINDOW, Fixtures.fillAt(tokens))).toBe(
        'error',
      )
    }
  })

  test('a capped compaction window moves the levels down with it', () => {
    const capped = { ...Fixtures.WINDOW, limit: 100_000 }

    expect(Levels.levelOf(capped, Fixtures.fillAt(40_000))).toBe('calm')
    expect(Levels.levelOf(capped, Fixtures.fillAt(40_200))).toBe('warning')
    expect(Levels.levelOf(capped, Fixtures.fillAt(47_000))).toBe('error')
  })

  test("each level draws in one of Claude Code's own theme keys", () => {
    expect(Levels.LEVEL_COLORS).toEqual({
      calm: 'permission',
      warning: 'warning',
      error: 'error',
    })
  })
})
