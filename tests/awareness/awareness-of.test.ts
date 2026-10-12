import { describe, expect, test, tier } from 'claude-code/testing'

import Awareness from '../../hooks/awareness'
import Fixtures from '../fixtures'

tier('user')

describe('awareness-of', () => {
  test('off unless the option turns it on, as by default', () => {
    expect(Awareness.awarenessOf({})).toBeNull()

    expect(
      Awareness.awarenessOf({ awareness: false, awarenessFrom: 400_000 }),
    ).toBeNull()
  })

  test('on: from the start, again every 20k, after prompts and tool results', () => {
    expect(Awareness.awarenessOf({ awareness: true })).toEqual(
      Fixtures.AWARENESS,
    )
  })

  test('the counts the options set', () => {
    expect(
      Awareness.awarenessOf({
        awareness: true,
        awarenessFrom: 400_000,
        awarenessWithin: 100_000,
        awarenessStep: 0,
      }),
    ).toEqual({
      ...Fixtures.AWARENESS,
      fromTokens: 400_000,
      withinTokens: 100_000,
      stepTokens: 0,
    })
  })

  test('after prompts alone, or after tool results alone', () => {
    expect(
      Awareness.awarenessOf({ awareness: true, awarenessAt: 'prompts' }),
    ).toEqual({ ...Fixtures.AWARENESS, isOnToolResults: false })

    expect(
      Awareness.awarenessOf({ awareness: true, awarenessAt: 'tool-results' }),
    ).toEqual({ ...Fixtures.AWARENESS, isOnPrompts: false })
  })
})
