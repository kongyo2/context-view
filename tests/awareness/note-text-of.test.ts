import { describe, expect, test, tier } from 'claude-code/testing'

import Awareness from '../../hooks/awareness'
import Fixtures from '../fixtures'

tier('user')

describe('note-text-of', () => {
  test("the band's figures as one line for Claude: the tokens over the window, the percentage, the tokens left until auto-compact", () => {
    expect(Awareness.noteTextOf(Fixtures.WINDOW, Fixtures.fillAt(84_100))).toBe(
      'context-view: your context holds 84.1k/200k tokens (42%); ' +
        '82.9k until auto-compact',
    )

    expect(
      Awareness.noteTextOf(Fixtures.WIDE_WINDOW, {
        tokens: 450_000,
        percent: 45,
        isEstimate: false,
      }),
    ).toBe(
      'context-view: your context holds 450k/1m tokens (45%); ' +
        '517k until auto-compact',
    )
  })

  test('past the threshold, that auto-compact runs next', () => {
    expect(
      Awareness.noteTextOf(Fixtures.WINDOW, Fixtures.fillAt(170_000)),
    ).toBe(
      'context-view: your context holds 170k/200k tokens (85%); ' +
        'auto-compact next',
    )
  })

  test('an estimate is marked as one, as the band marks it', () => {
    expect(
      Awareness.noteTextOf(Fixtures.WINDOW, Fixtures.fillAt(15_900, true)),
    ).toBe(
      'context-view: your context holds ~15.9k/200k tokens (~8%); ' +
        '~151.1k until auto-compact',
    )
  })

  test('with auto-compact off: that it is off, the tokens left before the limit, then the ask to run /compact', () => {
    expect(
      Awareness.noteTextOf(Fixtures.MANUAL_WINDOW, Fixtures.fillAt(84_100)),
    ).toBe(
      'context-view: your context holds 84.1k/200k tokens (42%); ' +
        'auto-compact off, 92.9k before the limit',
    )

    expect(
      Awareness.noteTextOf(Fixtures.MANUAL_WINDOW, Fixtures.fillAt(177_000)),
    ).toBe(
      'context-view: your context holds 177k/200k tokens (89%); ' +
        'auto-compact off, run /compact to continue',
    )
  })

  test('the last reply counts toward the tokens left, as in the band', () => {
    expect(
      Awareness.noteTextOf(Fixtures.WINDOW, {
        ...Fixtures.fillAt(84_100),
        output: 1_200,
      }),
    ).toBe(
      'context-view: your context holds 84.1k/200k tokens (42%); ' +
        '81.7k until auto-compact',
    )
  })
})
