import { describe, expect, test, tier } from 'claude-code/testing'

import Awareness from '../../hooks/awareness'

tier('user')

describe('place-of', () => {
  test('each place the option offers', () => {
    for (const place of Awareness.PLACES) {
      expect(Awareness.placeOf(place)).toBe(place)
    }
  })

  test('unset, or a value it does not offer, is after prompts and tool results', () => {
    for (const value of [undefined, 'tools', 'PROMPTS', 1]) {
      expect(Awareness.placeOf(value)).toBe('prompts-and-tool-results')
    }
  })
})
