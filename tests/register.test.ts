import { describe, expect, test } from 'claude-code/testing'

import {
  COMMAND,
  ENGINE_TEXT,
  SESSION,
  bandAt,
  measureOf,
  readToEnd,
  startsSession,
  textOf,
  usageOf,
} from './fixtures'

const SURFACES = ['terminal', 'desktop'] as const

describe('register', () => {
  test("the start registers /context-view and the band shows the session's context", async ($, on) => {
    const world = startsSession(on, 84_100)

    await $.session.start(SESSION)

    expect(world.commands).toEqual(['context-view'])
    expect(world.asked[0], 'the reserve is read from the breakdown').toBe(
      'summary',
    )

    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ ...bandAt(), surface })

      expect(textOf(await ui.find({ key: 'meter' }))).toBe(
        '⛁ ⛁ ⛁ ⛁ ⛀ ⛶ ⛶ ⛶ ⛝ ⛝ ',
      )

      expect((await ui.find({ type: 'Text', text: /42%/ }))?.props.color).toBe(
        'permission',
      )

      expect(
        await ui.find({ type: 'Text', text: '84.1k/200k tokens' }),
      ).toBeDefined()

      expect(
        await ui.find({ type: 'Text', text: '82.9k until auto-compact' }),
      ).toBeDefined()

      await ui.unmount()
    }
  })

  test('a measurement after a turn moves the band and its colour', async ($, on) => {
    const world = startsSession(on, 84_100)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    world.usage = usageOf(134_400)
    await $.session.measure(measureOf(134_400))

    expect(textOf(await ui.find({ key: 'meter' }))).toBe('⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛶ ⛝ ⛝ ')

    expect((await ui.find({ type: 'Text', text: /67%/ }))?.props.color).toBe(
      'warning',
    )

    expect(
      (await ui.find({ type: 'Text', text: '32.6k until auto-compact' }))?.props
        .color,
    ).toBe('warning')

    world.usage = usageOf(160_000)
    await $.session.measure(measureOf(160_000))

    expect(textOf(await ui.find({ key: 'meter' }))).toBe('⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛝ ⛝ ')

    expect((await ui.find({ type: 'Text', text: /80%/ }))?.props.color).toBe(
      'error',
    )

    expect(
      (await ui.find({ type: 'Text', text: '7k until auto-compact' }))?.props
        .color,
    ).toBe('error')

    world.usage = usageOf(170_000)
    await $.session.measure(measureOf(170_000))

    expect(textOf(await ui.find({ key: 'meter' }))).toBe('⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛀ ⛝ ')

    expect(
      await ui.find({ type: 'Text', text: 'auto-compact next' }),
    ).toBeDefined()

    await ui.unmount()
  })

  test('a measurement that moved another unit leaves the reading alone', async ($, on) => {
    const world = startsSession(on, 84_100)

    await $.session.start(SESSION)

    const asked = world.asked.length

    await $.session.measure({
      ...measureOf(134_400),
      rateLimits: [{ kind: 'five_hour', percentUsed: 12 }],
      changed: ['rateLimits'],
    })

    expect(world.asked.length, 'no reading was taken').toBe(asked)

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    expect(await ui.find({ type: 'Text', text: /42%/ })).toBeDefined()

    await ui.unmount()
  })

  test("a request of a running turn moves the band before the turn ends; a subagent's does not", async ($, on) => {
    startsSession(on, 84_100)

    let contextTokens = 100_000

    on('turn.step', async function* ($, e) {
      yield { kind: 'text', index: 0, text: 'ok' }

      return {
        turnId: e.turnId,
        index: e.index,
        answer: 'ok',
        toolUses: [],
        stopReason: 'end_turn',
        usage: {
          input_tokens: 10_000,
          output_tokens: 1,
          cache_read_input_tokens: contextTokens - 10_000,
          cache_creation_input_tokens: 0,
          model: 'claude-test',
        },
      }
    })

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    await readToEnd(
      $.turn.step({
        turnId: 't1',
        index: 0,
        model: 'claude-test',
        messageCount: 1,
      }),
    )

    expect(await ui.find({ type: 'Text', text: /50%/ })).toBeDefined()

    expect(
      await ui.find({ type: 'Text', text: '100k/200k tokens' }),
    ).toBeDefined()

    contextTokens = 180_000

    await readToEnd(
      $.turn.step({
        turnId: 'a1',
        index: 0,
        model: 'claude-test',
        messageCount: 1,
        agentId: 'agent-1',
      }),
    )

    expect(
      await ui.find({ type: 'Text', text: /50%/ }),
      "a subagent's request is not the main window's",
    ).toBeDefined()

    await ui.unmount()
  })

  test('/context-view hides the band, keeps the choice, and shows it again', async ($, on) => {
    const world = startsSession(on, 84_100)

    await $.session.start(SESSION)

    expect(await $.command.run(COMMAND)).toEqual({
      text: 'Context view hidden',
    })

    expect(world.store.get('isHidden')).toBe(true)

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    expect(await ui.find({ type: 'Text', text: ENGINE_TEXT })).toBeDefined()
    expect(await ui.find({ key: 'meter' })).toBeUndefined()

    expect(await $.command.run(COMMAND)).toEqual({
      text: 'Context view shown',
    })

    expect(world.store.get('isHidden')).toBe(false)
    expect(await ui.find({ key: 'meter' })).toBeDefined()

    await ui.unmount()
  })

  test('a band hidden in an earlier session stays hidden, after /clear too', async ($, on) => {
    const world = startsSession(on, 84_100)

    world.store.set('isHidden', true)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    expect(await ui.find({ key: 'meter' })).toBeUndefined()

    await $.classic.SessionStart({ source: 'clear' })

    expect(await ui.find({ key: 'meter' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: ENGINE_TEXT })).toBeDefined()

    await ui.unmount()
  })

  test('a fresh window draws nothing until a response lands', async ($, on) => {
    const world = startsSession(on)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    expect(await ui.find({ type: 'Text', text: ENGINE_TEXT })).toBeDefined()

    world.usage = usageOf(40_000)
    await $.session.measure(measureOf(40_000))

    expect(await ui.find({ type: 'Text', text: /20%/ })).toBeDefined()

    await ui.unmount()
  })

  test('a resumed session shows the context it restored', async ($, on) => {
    startsSession(on, 50_000)

    await $.classic.SessionStart({ source: 'resume' })

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    expect(await ui.find({ type: 'Text', text: /25%/ })).toBeDefined()

    await ui.unmount()
  })

  test('a survey keeps the band', async ($, on) => {
    startsSession(on, 84_100)

    await $.session.start(SESSION)

    const ui = await $.ui.mount({
      ...bandAt(120, { hasSurvey: true }),
      surface: 'terminal',
    })

    expect(await ui.find({ type: 'Text', text: ENGINE_TEXT })).toBeDefined()
    expect(await ui.find({ key: 'meter' })).toBeUndefined()

    await ui.unmount()
  })

  test('without a breakdown the usual reserve stands in', async ($, on) => {
    const world = startsSession(on, 84_100)

    world.usage = {
      startedAt: 0,
      rateLimits: [],
      context: { window: 200_000, tokens: 84_100, percent: 42 },
    }

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    expect(
      await ui.find({ type: 'Text', text: '82.9k until auto-compact' }),
    ).toBeDefined()

    await ui.unmount()
  })

  test('a usage call that fails leaves the band empty, not broken', async ($, on) => {
    const world = startsSession(on, 84_100)

    world.usage = null

    await $.session.start(SESSION)

    const ui = await $.ui.mount({ ...bandAt(), surface: 'terminal' })

    expect(await ui.find({ type: 'Text', text: ENGINE_TEXT })).toBeDefined()

    await ui.unmount()
  })
})
