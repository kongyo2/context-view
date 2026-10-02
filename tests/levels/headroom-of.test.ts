import { describe, expect, test } from 'claude-code/testing'

import Levels from '../../hooks/levels'
import Fixtures from '../fixtures'

describe('headroom-of', () => {
  test('the threshold less the context', () => {
    expect(Levels.headroomOf(Fixtures.WINDOW, Fixtures.fillAt(84_100))).toBe(
      82_900,
    )
  })

  test('negative past the threshold', () => {
    expect(Levels.headroomOf(Fixtures.WINDOW, Fixtures.fillAt(170_000))).toBe(
      -3_000,
    )
  })

  test('with auto-compact off, the limit less its buffer less the context', () => {
    expect(
      Levels.headroomOf(Fixtures.MANUAL_WINDOW, Fixtures.fillAt(84_100)),
    ).toBe(112_900)
  })
})
