import { describe, expect, test, tier } from 'claude-code/testing'

import Levels from '../../hooks/levels'
import Fixtures from '../fixtures'

tier('user')

describe('headroom-of', () => {
  test('the threshold less the context', () => {
    expect(Levels.headroomOf(Fixtures.WINDOW, Fixtures.fillAt(84_100))).toBe(
      82_900,
    )
  })

  test('the last reply counts too, as the next request carries it', () => {
    expect(
      Levels.headroomOf(Fixtures.WINDOW, {
        ...Fixtures.fillAt(84_100),
        output: 1_200,
      }),
    ).toBe(81_700)
  })

  test('negative past the threshold', () => {
    expect(Levels.headroomOf(Fixtures.WINDOW, Fixtures.fillAt(170_000))).toBe(
      -3_000,
    )
  })

  test('with auto-compact off, the window less the reply room and the compact buffer, less the context', () => {
    expect(
      Levels.headroomOf(Fixtures.MANUAL_WINDOW, Fixtures.fillAt(84_100)),
    ).toBe(92_900)
  })

  test("without a reserve, the window's end", () => {
    expect(
      Levels.headroomOf(Fixtures.REACTIVE_WINDOW, Fixtures.fillAt(160_000)),
    ).toBe(40_000)
  })
})
