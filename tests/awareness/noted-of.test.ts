import { describe, expect, test, tier } from 'claude-code/testing'

import Awareness from '../../hooks/awareness'
import Fixtures from '../fixtures'

tier('user')

describe('noted-of', () => {
  test('the tokens, the level and the threshold Claude was told of', () => {
    expect(Awareness.notedOf(Fixtures.WINDOW, Fixtures.fillAt(84_100))).toEqual(
      { tokens: 84_100, level: 'calm', threshold: 167_000 },
    )

    expect(
      Awareness.notedOf(Fixtures.MANUAL_WINDOW, Fixtures.fillAt(160_000)),
    ).toEqual({ tokens: 160_000, level: 'error', threshold: 177_000 })
  })
})
