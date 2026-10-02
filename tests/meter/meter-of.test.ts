import { describe, expect, test } from 'claude-code/testing'

import Meter from '../../hooks/meter'
import Fixtures from '../fixtures'

/**
 * Cells of one kind, `count` of them.
 *
 * @param cell the kind
 * @param count how many
 * @returns the cells
 */
const cells = (cell: Meter.Cell, count: number): Meter.Cell[] =>
  Array.from({ length: count }, () => cell)

describe('meter-of', () => {
  test('the reserve takes the last cells, rounded, at least one', () => {
    expect(Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(0), 20)).toEqual([
      ...cells('free', 17),
      ...cells('reserve', 3),
    ])

    expect(
      Meter.meterOf(Fixtures.MANUAL_WINDOW, Fixtures.fillAt(0), 20),
    ).toEqual([...cells('free', 19), 'reserve'])

    expect(
      Meter.meterOf({ ...Fixtures.WINDOW, buffer: 0 }, Fixtures.fillAt(0), 20),
    ).toEqual(cells('free', 20))
  })

  test('a cell part filled is hollow, and filled from seven tenths', () => {
    expect(Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(84_100), 20)).toEqual(
      [
        ...cells('used', 8),
        'partial',
        ...cells('free', 8),
        ...cells('reserve', 3),
      ],
    )

    expect(
      Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(138_000), 20),
    ).toEqual([
      ...cells('used', 14),
      ...cells('free', 3),
      ...cells('reserve', 3),
    ])
  })

  test('the smallest context still shows as one hollow cell', () => {
    expect(Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(1), 20)[0]).toBe(
      'partial',
    )

    expect(Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(0), 20)[0]).toBe(
      'free',
    )
  })

  test('a floating-point crumb draws no hollow cell', () => {
    expect(Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(60_000), 20)).toEqual(
      [...cells('used', 6), ...cells('free', 11), ...cells('reserve', 3)],
    )
  })

  test('past the threshold the context takes the reserve, never past the meter', () => {
    expect(
      Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(170_000), 20),
    ).toEqual([...cells('used', 17), ...cells('reserve', 3)])

    expect(
      Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(200_000), 20),
    ).toEqual(cells('used', 20))

    expect(
      Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(260_000), 20),
    ).toEqual(cells('used', 20))
  })

  test('the 12- and 8-cell meters keep the same shape', () => {
    expect(Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(84_100), 12)).toEqual(
      [
        ...cells('used', 5),
        'partial',
        ...cells('free', 4),
        ...cells('reserve', 2),
      ],
    )

    expect(Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(84_100), 8)).toEqual([
      ...cells('used', 3),
      'partial',
      ...cells('free', 3),
      'reserve',
    ])
  })

  test('a window of a million tokens measures the same way', () => {
    const wide = { ...Fixtures.WINDOW, window: 1_000_000, limit: 1_000_000 }
    const fill = { tokens: 500_000, percent: 50, isEstimate: false }

    expect(Meter.meterOf(wide, fill, 20)).toEqual([
      ...cells('used', 10),
      ...cells('free', 9),
      'reserve',
    ])
  })

  test("a window capped below the model's spans the whole window, all past its threshold reserve", () => {
    const capped = { ...Fixtures.WINDOW, window: 1_000_000, limit: 150_000 }
    const fillAt = (tokens: number) => ({
      tokens,
      percent: 0,
      isEstimate: false,
    })

    expect(Meter.meterOf(capped, fillAt(33_800), 20)).toEqual([
      'partial',
      'free',
      ...cells('reserve', 18),
    ])

    expect(Meter.meterOf(capped, fillAt(100_000), 20)).toEqual([
      ...cells('used', 2),
      ...cells('reserve', 18),
    ])

    expect(Meter.meterOf(capped, fillAt(130_000), 20)).toEqual([
      ...cells('used', 2),
      'partial',
      ...cells('reserve', 17),
    ])
  })

  test('an estimate draws as a figure does', () => {
    expect(
      Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(84_100, true), 20),
    ).toEqual(Meter.meterOf(Fixtures.WINDOW, Fixtures.fillAt(84_100), 20))
  })
})
