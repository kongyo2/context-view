import { describe, expect, test } from 'claude-code/testing'

import Fixtures from './fixtures'

/**
 * The surfaces that draw the band above the prompt.
 */
const SURFACES = ['terminal', 'desktop'] as const

/**
 * The band at 84.1k of a 200k window, auto-compact on, at the widest meter.
 */
const CALM_LINE =
  '▰'.repeat(8) +
  '▱'.repeat(9) +
  '▰'.repeat(3) +
  '  42% · 84.1k/200k tokens · 82.9k until auto-compact'

describe('register', () => {
  test("the start registers /context-view and draws the session's context on every surface", async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    expect(world.commands).toEqual(['context-view'])

    expect(world.asked[0], 'the reserve is read from a local breakdown').toBe(
      'summary',
    )

    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface })

      expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)

      await ui.unmount()
    }
  })

  test('a measurement after a turn moves the band, its level with it', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    const percent = async () =>
      Fixtures.tonesOf(await ui.findAll({ type: 'Text', text: /^\d+%$/ }))

    expect(await percent()).toEqual([['42%', 'permission']])

    world.usage = Fixtures.usageOf(134_400)
    await $.session.measure(Fixtures.measureOf(134_400))

    expect(await percent()).toEqual([['67%', 'warning']])

    world.usage = Fixtures.usageOf(160_000)
    await $.session.measure(Fixtures.measureOf(160_000))

    expect(await percent()).toEqual([['80%', 'error']])

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰'.repeat(16) +
        '▱' +
        '▰'.repeat(3) +
        '  80% · 160k/200k tokens · 7k until auto-compact',
    )

    await ui.unmount()
  })

  test('a measurement that moved another unit takes no reading', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const asked = world.asked.length

    await $.session.measure({
      ...Fixtures.measureOf(134_400),
      rateLimits: [{ kind: 'five_hour', percentUsed: 12 }],
      changed: ['rateLimits'],
    })

    expect(world.asked.length, 'no reading was taken').toBe(asked)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)

    await ui.unmount()
  })

  test("each request of a running turn moves the band; a subagent's does not", async ($, on) => {
    let tokens = 100_000

    Fixtures.startsSession(on, 84_100)
    Fixtures.answersSteps(on, () => tokens)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    expect(await ui.find({ type: 'Text', text: /^50%$/ })).toBeDefined()

    expect(
      await ui.find({ type: 'Text', text: /^100k\/200k tokens$/ }),
    ).toBeDefined()

    tokens = 180_000

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf('agent-1')))

    expect(
      await ui.find({ type: 'Text', text: /^50%$/ }),
      "a subagent's request is not the main window's",
    ).toBeDefined()

    await ui.unmount()
  })

  test('/context-view hides the band, keeps the choice, and shows it again', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    expect(await $.command.run(Fixtures.COMMAND)).toEqual({
      text: 'Context view hidden',
    })

    expect(world.store.get('isHidden')).toBe(true)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

    expect(await $.command.run(Fixtures.COMMAND)).toEqual({
      text: 'Context view shown',
    })

    expect(world.store.get('isHidden')).toBe(false)
    expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)

    await ui.unmount()
  })

  test('a band hidden in an earlier session stays hidden, after /clear too', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.store.set('isHidden', true)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

    await $.classic.SessionStart({ source: 'clear' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

    await ui.unmount()
  })

  test('a fresh window draws nothing until a response lands', async ($, on) => {
    const world = Fixtures.startsSession(on)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

    world.usage = Fixtures.usageOf(40_000)
    await $.session.measure(Fixtures.measureOf(40_000))

    expect(await ui.find({ type: 'Text', text: /^20%$/ })).toBeDefined()

    await ui.unmount()
  })

  test('a resumed session draws the context it restored', async ($, on) => {
    Fixtures.startsSession(on, 50_000)

    await $.classic.SessionStart({ source: 'resume' })

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(await ui.find({ type: 'Text', text: /^25%$/ })).toBeDefined()

    await ui.unmount()
  })

  test('a survey keeps the band', async ($, on) => {
    Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({
      ...Fixtures.bandAt(120, { hasSurvey: true }),
      surface: 'terminal',
    })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

    await ui.unmount()
  })

  test('without a breakdown the usual reserve stands in', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.usage = {
      startedAt: 0,
      rateLimits: [],
      context: { window: 200_000, tokens: 84_100, percent: 42 },
    }

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)

    await ui.unmount()
  })

  test('a usage call that fails leaves the band to the engine', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.usage = null

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

    await ui.unmount()
  })

  test('in Ghostty the terminal draws the meter in blocks; the desktop keeps the pills', async ($, on) => {
    Fixtures.startsSession(on, 84_100, { TERM_PROGRAM: 'ghostty' })

    await $.session.start(Fixtures.SESSION)

    const terminal = await $.ui.mount({
      ...Fixtures.bandAt(),
      surface: 'terminal',
    })

    expect(Fixtures.textOf(await terminal.drawn())).toBe(
      '█'.repeat(8) +
        '░'.repeat(9) +
        '█'.repeat(3) +
        '  42% · 84.1k/200k tokens · 82.9k until auto-compact',
    )

    await terminal.unmount()

    const desktop = await $.ui.mount({
      ...Fixtures.bandAt(),
      surface: 'desktop',
    })

    expect(Fixtures.textOf(await desktop.drawn())).toBe(CALM_LINE)

    await desktop.unmount()
  })
})
