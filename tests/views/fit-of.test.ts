import { describe, expect, test, tier } from 'claude-code/testing'

import Views from '../../hooks/views'
import Fixtures from '../fixtures'

tier('user')

const SEGMENTS = Views.segmentsOf(Fixtures.WINDOW, Fixtures.fillAt(84_100))

describe('fit-of', () => {
  test('every segment beside the widest meter that fits', () => {
    expect(Views.fitOf(116, SEGMENTS)).toEqual({
      cells: 20,
      segments: SEGMENTS,
    })
    expect(Views.fitOf(72, SEGMENTS)).toEqual({ cells: 20, segments: SEGMENTS })
    expect(Views.fitOf(71, SEGMENTS)).toEqual({ cells: 12, segments: SEGMENTS })
    expect(Views.fitOf(64, SEGMENTS)).toEqual({ cells: 12, segments: SEGMENTS })
    expect(Views.fitOf(60, SEGMENTS)).toEqual({ cells: 8, segments: SEGMENTS })
  })

  test('then one segment fewer from the right, the meter widest again', () => {
    const two = SEGMENTS.slice(0, 2)
    const one = SEGMENTS.slice(0, 1)

    expect(Views.fitOf(59, SEGMENTS)).toEqual({ cells: 20, segments: two })
    expect(Views.fitOf(37, SEGMENTS)).toEqual({ cells: 12, segments: two })
    expect(Views.fitOf(33, SEGMENTS)).toEqual({ cells: 8, segments: two })
    expect(Views.fitOf(32, SEGMENTS)).toEqual({ cells: 20, segments: one })
    expect(Views.fitOf(17, SEGMENTS)).toEqual({ cells: 12, segments: one })
    expect(Views.fitOf(13, SEGMENTS)).toEqual({ cells: 8, segments: one })
  })

  test('the percentage beside the narrowest meter is the last resort', () => {
    expect(Views.fitOf(4, SEGMENTS)).toEqual({
      cells: 8,
      segments: SEGMENTS.slice(0, 1),
    })
  })
})
