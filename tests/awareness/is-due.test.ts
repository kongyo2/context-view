import { describe, expect, test, tier } from 'claude-code/testing'

import Awareness from '../../hooks/awareness'
import Fixtures from '../fixtures'

tier('user')

const notedAt = (tokens: number, window = Fixtures.WINDOW) =>
  Awareness.notedOf(window, Fixtures.fillAt(tokens))

describe('is-due', () => {
  test('Claude not yet told is told', () => {
    expect(
      Awareness.isDue(
        Fixtures.AWARENESS,
        Fixtures.WINDOW,
        Fixtures.fillAt(84_100),
        null,
      ),
    ).toBe(true)
  })

  test('told again once the context has grown by the step', () => {
    const isDueAt = (tokens: number) =>
      Awareness.isDue(
        Fixtures.AWARENESS,
        Fixtures.WINDOW,
        Fixtures.fillAt(tokens),
        notedAt(30_000),
      )

    expect(isDueAt(30_000)).toBe(false)
    expect(isDueAt(49_999)).toBe(false)
    expect(isDueAt(50_000)).toBe(true)
  })

  test('a step of 0: told again whenever the context has grown at all', () => {
    const every = { ...Fixtures.AWARENESS, stepTokens: 0 }
    const isDueAt = (tokens: number) =>
      Awareness.isDue(
        every,
        Fixtures.WINDOW,
        Fixtures.fillAt(tokens),
        notedAt(30_000),
      )

    expect(isDueAt(30_000)).toBe(false)
    expect(isDueAt(30_001)).toBe(true)
  })

  test('told again when the band changes colour, however little it grew', () => {
    const isDueAt = (tokens: number, noted: number) =>
      Awareness.isDue(
        Fixtures.AWARENESS,
        Fixtures.WINDOW,
        Fixtures.fillAt(tokens),
        notedAt(noted),
      )

    expect(isDueAt(100_199, 90_000), 'still calm').toBe(false)
    expect(isDueAt(100_200, 90_000), 'warning').toBe(true)
    expect(isDueAt(147_000, 140_000), 'error').toBe(true)
  })

  test('told again when the context shrank, as after a compaction', () => {
    expect(
      Awareness.isDue(
        Fixtures.AWARENESS,
        Fixtures.WINDOW,
        Fixtures.fillAt(15_900, true),
        notedAt(160_000),
      ),
    ).toBe(true)
  })

  test('told again when the threshold moved, as after /autocompact or a model switch', () => {
    const capped = { ...Fixtures.WINDOW, limit: 150_000 }

    expect(
      Awareness.isDue(
        Fixtures.AWARENESS,
        capped,
        Fixtures.fillAt(84_100),
        notedAt(84_100),
      ),
    ).toBe(true)

    expect(
      Awareness.isDue(
        Fixtures.AWARENESS,
        Fixtures.WIDE_WINDOW,
        Fixtures.fillAt(84_100),
        notedAt(84_100),
      ),
    ).toBe(true)
  })
})
