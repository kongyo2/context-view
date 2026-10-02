import { describe, expect, test, tier } from 'claude-code/testing'

import Meter from '../../hooks/meter'

tier('user')

describe('runs-of', () => {
  test('cells of one kind side by side make one run', () => {
    expect(
      Meter.runsOf(['used', 'used', 'partial', 'free', 'free', 'reserve']),
    ).toEqual([
      { cell: 'used', count: 2 },
      { cell: 'partial', count: 1 },
      { cell: 'free', count: 2 },
      { cell: 'reserve', count: 1 },
    ])
  })

  test('a kind met again after another starts a run of its own', () => {
    expect(Meter.runsOf(['used', 'free', 'used'])).toEqual([
      { cell: 'used', count: 1 },
      { cell: 'free', count: 1 },
      { cell: 'used', count: 1 },
    ])
  })

  test('no cells make no runs', () => {
    expect(Meter.runsOf([])).toEqual([])
  })
})
