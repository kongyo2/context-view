import type { FoundElement } from 'claude-code/testing'
import { describe, expect, test } from 'claude-code/testing'

import Limits from '../hooks/limits'
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

/**
 * The first settle reading's delay, and one past the last.
 */
const FIRST_SETTLE_MS = Limits.SETTLE_DELAYS_MS[0] ?? 0
const ALL_SETTLED_MS = Math.max(...Limits.SETTLE_DELAYS_MS) + 1

/**
 * What a drawing's percentage reads, from its Texts.
 *
 * @param ui the mounted band
 * @returns the percentage's texts, `~` and all
 */
const percentOf = async (ui: {
  findAll: (query: { type: 'Text'; text: RegExp }) => Promise<FoundElement[]>
}) =>
  (await ui.findAll({ type: 'Text', text: /^~?\d+%$/ })).map(
    found => found.text,
  )

describe('register', () => {
  test("the start registers /context-view, its words hinted, and draws the session's context on every surface", async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    expect(world.commands).toEqual([
      {
        name: 'context-view',
        description: 'Hide or show the context usage band above the prompt',
        argumentHint: '[show|hide]',
        immediate: true,
      },
    ])

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

  test('a request before any reading measures the window first', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    Fixtures.answersSteps(on, () => 100_000)

    world.usage = null

    await $.session.start(Fixtures.SESSION)

    world.usage = Fixtures.usageOf(84_100)

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(
      await percentOf(ui),
      "the request's own tokens, over the window just measured",
    ).toEqual(['50%'])

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

  test('/context-view show and hide set the band whatever it was; another word gets the usage', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const run = (args: string) =>
      $.command.run(Fixtures.commandOf('context-view', args))

    expect(await run('hide')).toEqual({ text: 'Context view hidden' })
    expect(await run('hide')).toEqual({ text: 'Context view hidden' })
    expect(world.store.get('isHidden')).toBe(true)

    expect(await run('on')).toEqual({ text: 'Context view shown' })
    expect(await run('SHOW')).toEqual({ text: 'Context view shown' })
    expect(world.store.get('isHidden')).toBe(false)

    expect(await run('off')).toEqual({ text: 'Context view hidden' })

    expect(await run('maybe')).toEqual({
      text: 'Usage: /context-view [show|hide]',
    })

    expect(world.store.get('isHidden'), 'left as it was').toBe(true)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

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

  test("a new window draws the engine's estimate, marked, until a response lands", async ($, on) => {
    const world = Fixtures.startsSession(on)

    world.usage = Fixtures.usageOf(undefined, { estimate: 15_900 })

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰' +
        '▱'.repeat(16) +
        '▰'.repeat(3) +
        '  ~8% · ~15.9k/200k tokens · ~151.1k until auto-compact',
    )

    world.usage = Fixtures.usageOf(40_000)
    await $.session.measure(Fixtures.measureOf(40_000))

    expect(await percentOf(ui)).toEqual(['20%'])

    await ui.unmount()
  })

  test('with neither a figure nor an estimate the engine draws its own', async ($, on) => {
    Fixtures.startsSession(on)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

    await ui.unmount()
  })

  test('after /clear the band reads the cleared window', async ($, on) => {
    const world = Fixtures.startsSession(on, 160_000)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(await percentOf(ui)).toEqual(['80%'])

    world.usage = Fixtures.usageOf(undefined, { estimate: 15_900 })
    await $.classic.SessionStart({ source: 'clear' })

    expect(await percentOf(ui)).toEqual(['~8%'])

    await ui.unmount()
  })

  test('a resumed session draws the context it restored', async ($, on) => {
    Fixtures.startsSession(on, 50_000)

    await $.classic.SessionStart({ source: 'resume' })

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(await ui.find({ type: 'Text', text: /^25%$/ })).toBeDefined()

    await ui.unmount()
  })

  test('a compaction of the main window is read once the engine has landed it, whoever ran it', async ($, on) => {
    const world = Fixtures.startsSession(on, 160_000)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    for (const trigger of ['manual', 'auto', 'plugin'] as const) {
      world.usage = Fixtures.usageOf(160_000)
      await $.session.measure(Fixtures.measureOf(160_000))

      expect(await percentOf(ui)).toEqual(['80%'])

      world.usage = Fixtures.usageOf(undefined, { estimate: 15_900 })
      await $.session.compact(Fixtures.compactOf(trigger))

      expect(
        await percentOf(ui),
        'the engine lands it only after the hook returns',
      ).toEqual(['80%'])

      await world.clock.advance(FIRST_SETTLE_MS)

      expect(await percentOf(ui), trigger).toEqual(['~8%'])

      await world.clock.advance(ALL_SETTLED_MS)
    }

    await ui.unmount()
  })

  test("a compaction ahead of time, a subagent's, or a vetoed one takes no reading", async ($, on) => {
    const world = Fixtures.startsSession(on, 160_000)

    await $.session.start(Fixtures.SESSION)

    const asked = world.asked.length

    await $.session.compact(Fixtures.compactOf('precompute'))
    await $.session.compact(Fixtures.compactOf('auto', 'agent-1'))

    world.compaction = { skip: 'held by a PreCompact hook' }
    await $.session.compact(Fixtures.compactOf('manual'))

    await world.clock.advance(ALL_SETTLED_MS)

    expect(world.asked.length, 'no reading was taken').toBe(asked)
  })

  test('a model switch is read once the engine has moved to the new window', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    world.usage = Fixtures.usageOf(84_100, { window: 1_000_000 })
    await $.classic.PostModelSwitch(Fixtures.MODEL_SWITCH)
    await world.clock.advance(FIRST_SETTLE_MS)

    expect(await percentOf(ui)).toEqual(['8%'])

    expect(
      await ui.find({ type: 'Text', text: /^84\.1k\/1m tokens$/ }),
    ).toBeDefined()

    await ui.unmount()
  })

  test('turning auto-compact off in /config is read once it lands', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    world.usage = Fixtures.usageOf(84_100, { isAutoCompact: false })
    await $.config.set(Fixtures.AUTO_COMPACT_OFF)
    await world.clock.advance(FIRST_SETTLE_MS)

    expect(
      await ui.find({ type: 'Text', text: /^112\.9k before the limit$/ }),
    ).toBeDefined()

    await ui.unmount()
  })

  test('/autocompact capping the window is read once it lands, the meter spanning the whole window', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    world.usage = Fixtures.usageOf(84_100, { limit: 150_000 })

    expect(
      await $.command.run(Fixtures.commandOf('autocompact', '150000')),
      "the command is the engine's",
    ).toEqual({ text: 'run by Claude Code' })

    await world.clock.advance(FIRST_SETTLE_MS)

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰'.repeat(8) +
        '▱'.repeat(4) +
        '▰'.repeat(8) +
        '  42% · 84.1k/200k tokens · 32.9k until auto-compact',
    )

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

  test('a reading the engine cannot give leaves the band to the engine and says why in the debug log', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.usage = null

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(Fixtures.ENGINE_TEXT)

    expect(world.logs).toEqual([
      'could not read the context window: context-view: $.session.usage: ' +
        'no session bound; the band keeps its last reading',
    ])

    await ui.unmount()
  })

  test('a command the engine will not register is said in the debug log, and the band still draws', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.refusal = '32 commands are registered already'

    await $.session.start(Fixtures.SESSION)

    expect(world.logs).toEqual([
      'could not register /context-view: context-view: $.command.register: ' +
        '32 commands are registered already; the band draws without it',
    ])

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)

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
