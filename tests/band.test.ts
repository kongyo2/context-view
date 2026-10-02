import { describe, expect, test } from 'claude-code/testing'

import { SESSION, bandAt, startsSession, textOf, usageOf } from './fixtures'

describe('band', () => {
  test('a wide band draws the meter, the percentage, the tokens and the headroom', async ($, on) => {
    startsSession(on, 84_100)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(120), surface: 'terminal' })

    expect(textOf(await ui.drawn())).toBe(
      '⛁ ⛁ ⛁ ⛁ ⛀ ⛶ ⛶ ⛶ ⛝ ⛝  42%  84.1k/200k tokens · 82.9k until auto-compact',
    )

    await ui.unmount()
  })

  test('a band too narrow for the headroom drops it first', async ($, on) => {
    startsSession(on, 84_100)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(60), surface: 'terminal' })

    expect(textOf(await ui.drawn())).toBe(
      '⛁ ⛁ ⛁ ⛁ ⛀ ⛶ ⛶ ⛶ ⛝ ⛝  42%  84.1k/200k tokens',
    )

    await ui.unmount()
  })

  test('a narrow band draws the five-cell meter', async ($, on) => {
    startsSession(on, 84_100)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(40), surface: 'terminal' })

    expect(textOf(await ui.drawn())).toBe('⛁ ⛁ ⛀ ⛶ ⛝  42%  84.1k/200k tokens')

    await ui.unmount()
  })

  test('the narrowest band keeps the meter and the percentage', async ($, on) => {
    startsSession(on, 84_100)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(24), surface: 'terminal' })

    expect(textOf(await ui.drawn())).toBe('⛁ ⛁ ⛀ ⛶ ⛝  42%')

    await ui.unmount()
  })

  test('the free cells draw dim and the reserve in the buffer colour', async ($, on) => {
    startsSession(on, 84_100)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(120), surface: 'desktop' })

    const used = await ui.find({ type: 'Text', text: '⛁ ⛁ ⛁ ⛁ ' })
    const partial = await ui.find({ type: 'Text', text: '⛀ ' })
    const free = await ui.find({ type: 'Text', text: '⛶ ⛶ ⛶ ' })
    const reserve = await ui.find({ type: 'Text', text: '⛝ ⛝ ' })

    expect(used?.props.color).toBe('permission')
    expect(partial?.props.color).toBe('permission')
    expect(free?.props.dimColor).toBe(true)
    expect(free?.props.color).toBeUndefined()
    expect(reserve?.props.color).toBe('inactive')

    const percent = await ui.find({ type: 'Text', text: /42%/ })

    expect(percent?.props.bold).toBe(true)

    const tokens = await ui.find({ type: 'Text', text: '84.1k/200k tokens' })
    const headroom = await ui.find({ type: 'Text', text: /until auto-compact/ })

    expect(tokens?.props.dimColor).toBe(true)
    expect(headroom?.props.dimColor).toBe(true)
    expect(headroom?.props.color).toBeUndefined()

    await ui.unmount()
  })

  test('with auto-compact off the band counts down to the limit', async ($, on) => {
    const world = startsSession(on)

    world.usage = usageOf(84_100, { isAutoCompact: false })

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(120), surface: 'terminal' })

    expect(textOf(await ui.drawn())).toBe(
      '⛁ ⛁ ⛁ ⛁ ⛀ ⛶ ⛶ ⛶ ⛶ ⛝  42%  84.1k/200k tokens · 112.9k before the limit',
    )

    world.usage = usageOf(197_500, { isAutoCompact: false })
    await $.classic.SessionStart({ source: 'resume' })

    expect(textOf(await ui.drawn())).toBe(
      '⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁  99%  197.5k/200k tokens · run /compact to continue',
    )

    await ui.unmount()
  })
})
