import { describe, expect, test, tier } from 'claude-code/testing'

import Readings from '../../hooks/readings'
import Fixtures from '../fixtures'

tier('user')

const liveAt = (tokens?: number) => ({
  window: 200_000,
  ...(tokens !== undefined && { tokens }),
})

describe('is-outdated', () => {
  test('the same window and the same figure need no reading', () => {
    expect(
      Readings.isOutdated(
        liveAt(84_100),
        Fixtures.WINDOW,
        Fixtures.fillAt(84_100),
      ),
    ).toBe(false)
  })

  test('another window, or none held, needs one', () => {
    expect(
      Readings.isOutdated(
        { ...liveAt(84_100), window: 1_000_000 },
        Fixtures.WINDOW,
        Fixtures.fillAt(84_100),
      ),
    ).toBe(true)

    expect(Readings.isOutdated(liveAt(84_100), null, null)).toBe(true)
  })

  test("a response's figure where the band holds another, an estimate, or none needs one", () => {
    expect(
      Readings.isOutdated(
        liveAt(100_000),
        Fixtures.WINDOW,
        Fixtures.fillAt(84_100),
      ),
    ).toBe(true)

    expect(
      Readings.isOutdated(
        liveAt(84_100),
        Fixtures.WINDOW,
        Fixtures.fillAt(84_100, true),
      ),
    ).toBe(true)

    expect(Readings.isOutdated(liveAt(84_100), Fixtures.WINDOW, null)).toBe(
      true,
    )
  })

  test("no figure where the band holds a response's needs one: a rewound conversation", () => {
    expect(
      Readings.isOutdated(liveAt(), Fixtures.WINDOW, Fixtures.fillAt(160_000)),
    ).toBe(true)
  })

  test('an estimate, or nothing, stands while no response has landed', () => {
    expect(
      Readings.isOutdated(
        liveAt(),
        Fixtures.WINDOW,
        Fixtures.fillAt(15_900, true),
      ),
    ).toBe(false)

    expect(Readings.isOutdated(liveAt(), Fixtures.WINDOW, null)).toBe(false)
  })
})
