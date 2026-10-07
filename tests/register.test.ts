import type { TurnStepServerToolUse } from 'claude-code'
import { describe, expect, test, tier } from 'claude-code/testing'
import type { FoundElement } from 'claude-code/testing'

import Fixtures from './fixtures'

tier('user')

const CALM_LINE =
  '▰'.repeat(8) +
  '▱'.repeat(9) +
  '▰'.repeat(3) +
  '  42% · 84.1k/200k tokens · 82.9k until auto-compact'

const percentOf = async (ui: {
  findAll: (query: { type: 'Text'; text: RegExp }) => Promise<FoundElement[]>
}) =>
  (await ui.findAll({ type: 'Text', text: /^~?\d+%$/ })).map(
    found => found.text,
  )

const readingsOf = (world: Fixtures.World) =>
  world.asked.filter(asked => asked === 'summary').length

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

    for (const surface of Fixtures.SURFACES) {
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

  test("a measurement's own figure stands over what the engine answers, and the estimate where it carries none", async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    world.usage = Fixtures.usageOf(100_000)
    await $.session.measure(Fixtures.measureOf(134_400))

    expect(await percentOf(ui)).toEqual(['67%'])

    world.usage = Fixtures.usageOf(undefined, { estimate: 15_900 })

    await $.session.measure({
      context: { window: 200_000 },
      rateLimits: [],
      changed: ['context'],
    })

    expect(await percentOf(ui)).toEqual(['~8%'])

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

  test("a request that consulted the advisor never draws its passes' summed count: the engine's own figure stands", async ($, on) => {
    let tokens = 60_000
    let uses: readonly TurnStepServerToolUse[] = []

    const world = Fixtures.startsSession(on, 40_000)

    Fixtures.answersSteps(
      on,
      () => tokens,
      1,
      () => uses,
    )

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    expect(await percentOf(ui)).toEqual(['30%'])

    tokens = 122_000
    uses = [Fixtures.ADVISOR_USE]
    world.usage = Fixtures.usageOf(62_000)

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    expect(
      await percentOf(ui),
      'the API sums the passes before and after the advice; the window is the last pass',
    ).toEqual(['31%'])

    expect(
      await ui.find({ type: 'Text', text: /^62k\/200k tokens$/ }),
    ).toBeDefined()

    await ui.unmount()
  })

  test('a consulted request whose figure the engine lands late keeps the last reading until it lands', async ($, on) => {
    let tokens = 60_000
    let uses: readonly TurnStepServerToolUse[] = []

    const world = Fixtures.startsSession(on, 40_000)

    Fixtures.answersSteps(
      on,
      () => tokens,
      1,
      () => uses,
    )

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    world.usage = Fixtures.usageOf(60_000)
    tokens = 122_000
    uses = [Fixtures.ADVISOR_USE]

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    expect(await percentOf(ui), 'never the summed count').toEqual(['30%'])

    world.usage = Fixtures.usageOf(62_000)
    await world.clock.advance(Fixtures.FIRST_READING_MS)

    expect(await percentOf(ui)).toEqual(['31%'])

    await ui.unmount()
  })

  test('the last reply counts toward the headroom, as Claude Code counts it toward its threshold', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    Fixtures.answersSteps(on, () => 100_000, 2_000)

    world.usage = Fixtures.usageOf(84_100, { output: 1_200 })

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(
      await ui.find({ type: 'Text', text: /^81\.7k until auto-compact$/ }),
      "a reading takes the reply from the breakdown's last response",
    ).toBeDefined()

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    expect(
      await ui.find({ type: 'Text', text: /^65k until auto-compact$/ }),
      "a request's reply counts as it lands",
    ).toBeDefined()

    expect(
      await ui.find({ type: 'Text', text: /^100k\/200k tokens$/ }),
      "the tokens stay the status line's",
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

  test("a request over a capped window counts over the model's window", async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    Fixtures.answersSteps(on, () => 100_000)

    world.usage = Fixtures.usageOf(84_100, { limit: 150_000 })

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    expect(await percentOf(ui)).toEqual(['50%'])

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

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

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

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

    await ui.unmount()
  })

  test('a choice the store will not keep is said in the debug log, and this session still follows it', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.refusals.save = 'store is read-only'

    await $.session.start(Fixtures.SESSION)

    expect(
      await $.command.run(Fixtures.commandOf('context-view', 'hide')),
    ).toEqual({ text: 'Context view hidden' })

    expect(world.logs).toEqual([
      'could not save whether the band is hidden: context-view: ' +
        '$.store.set: store is read-only; this session only',
    ])

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

    await ui.unmount()
  })

  test('a band hidden in an earlier session starts hidden', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.store.set('isHidden', true)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

    await ui.unmount()
  })

  test('the stored choice is read again after /clear, a resume and a branch', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)

    for (const source of ['clear', 'resume', 'fork'] as const) {
      world.store.set('isHidden', true)
      await $.classic.SessionStart({ source })

      expect(Fixtures.textOf(await ui.drawn()), source).toBe('')

      world.store.set('isHidden', false)
      await $.classic.SessionStart({ source })

      expect(Fixtures.textOf(await ui.drawn()), source).toBe(CALM_LINE)
    }

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

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

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

  test('a resume is read once the engine has swapped the session in', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    await $.classic.SessionStart({ source: 'resume' })
    world.usage = Fixtures.usageOf(160_000)

    expect(
      await percentOf(ui),
      'the engine swaps the session in after the hook',
    ).toEqual(['42%'])

    await world.clock.advance(Fixtures.FIRST_READING_MS)

    expect(await percentOf(ui)).toEqual(['80%'])

    await ui.unmount()
  })

  test('a session resumed at launch draws the context it restored', async ($, on) => {
    Fixtures.startsSession(on, 50_000)

    await $.classic.SessionStart({ source: 'resume' })

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(await percentOf(ui)).toEqual(['25%'])

    await ui.unmount()
  })

  test('a branch takes a reading', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    world.usage = Fixtures.usageOf(120_000)
    await $.classic.SessionStart({ source: 'fork' })

    expect(await percentOf(ui)).toEqual(['60%'])

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

      await $.session.compact(Fixtures.compactOf(trigger))
      world.usage = Fixtures.usageOf(undefined, { estimate: 15_900 })

      expect(
        await percentOf(ui),
        'the engine lands it only after the hook returns',
      ).toEqual(['80%'])

      await world.clock.advance(Fixtures.FIRST_READING_MS)

      expect(await percentOf(ui), trigger).toEqual(['~8%'])

      await world.clock.advance(Fixtures.SETTLED_MS)
    }

    await ui.unmount()
  })

  test("a compaction ahead of time, a subagent's, or a vetoed one takes no reading", async ($, on) => {
    const world = Fixtures.startsSession(on, 160_000)

    await $.session.start(Fixtures.SESSION)

    const readings = readingsOf(world)

    await $.session.compact(Fixtures.compactOf('precompute'))
    await $.session.compact(Fixtures.compactOf('auto', 'agent-1'))

    world.compaction = { skip: 'held by a PreCompact hook' }
    await $.session.compact(Fixtures.compactOf('manual'))

    await world.clock.advance(Fixtures.SETTLED_MS)

    expect(readingsOf(world), 'no reading was taken').toBe(readings)
  })

  test("a reading that resolves late never overwrites a newer request's figure", async ($, on) => {
    const world = Fixtures.startsSession(on, 160_000)

    Fixtures.answersSteps(on, () => 30_000)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    world.lag = 20
    await $.session.compact(Fixtures.compactOf('auto'))
    world.usage = Fixtures.usageOf(undefined, { estimate: 15_900 })

    await world.clock.set(1_605)

    expect(await percentOf(ui)).toEqual(['~8%'])

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    expect(await percentOf(ui)).toEqual(['15%'])

    await world.clock.set(1_625)

    expect(
      await percentOf(ui),
      'the reading made at 1.6 s answered with the figures from before the request',
    ).toEqual(['15%'])

    await ui.unmount()
  })

  test('a model switch is read once the engine has moved to the new window', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    await $.classic.PostModelSwitch(Fixtures.MODEL_SWITCH)
    world.usage = Fixtures.usageOf(84_100, { window: 1_000_000 })

    expect(
      await percentOf(ui),
      'the engine moves to the new model after the hook',
    ).toEqual(['42%'])

    await world.clock.advance(Fixtures.FIRST_READING_MS)

    expect(await percentOf(ui)).toEqual(['8%'])

    expect(
      await ui.find({ type: 'Text', text: /^84\.1k\/1m tokens$/ }),
    ).toBeDefined()

    await ui.unmount()
  })

  test('turning auto-compact off in /config is read once it lands, even after the first reading', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    await $.config.set(Fixtures.AUTO_COMPACT_OFF)
    await world.clock.advance(Fixtures.FIRST_READING_MS)

    expect(
      await ui.find({ type: 'Text', text: /^82\.9k until auto-compact$/ }),
      'the setting had not landed by the first reading',
    ).toBeDefined()

    world.usage = Fixtures.usageOf(84_100, { isAutoCompact: false })
    await world.clock.set(Fixtures.SECOND_READING_MS)

    expect(
      await ui.find({ type: 'Text', text: /^92\.9k before the limit$/ }),
    ).toBeDefined()

    await ui.unmount()
  })

  test('/autocompact capping the window is read once it lands, the meter spanning the whole window', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(
      await $.command.run(Fixtures.commandOf('autocompact', '150000')),
      "the command is the engine's",
    ).toEqual({ text: 'run by Claude Code' })

    world.usage = Fixtures.usageOf(84_100, { limit: 150_000 })

    expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)

    await world.clock.advance(Fixtures.FIRST_READING_MS)

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰'.repeat(8) +
        '▱'.repeat(4) +
        '▰'.repeat(8) +
        '  42% · 84.1k/200k tokens · 32.9k until auto-compact',
    )

    await ui.unmount()
  })

  test('a rewound conversation, which no event announces, is read within two seconds', async ($, on) => {
    const world = Fixtures.startsSession(on, 160_000)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    world.usage = Fixtures.usageOf(undefined, { estimate: 51_800 })

    await world.clock.advance(Fixtures.RECHECK_MS - 1)

    expect(await percentOf(ui), 'no event announced it').toEqual(['80%'])

    await world.clock.advance(1)

    expect(await percentOf(ui)).toEqual(['~26%'])

    await ui.unmount()
  })

  test("the live check settles a request's own count onto the engine's figure", async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    Fixtures.answersSteps(on, () => 120_000)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    await Fixtures.readToEnd($.turn.step(Fixtures.stepOf()))

    expect(await percentOf(ui)).toEqual(['60%'])

    world.usage = Fixtures.usageOf(100_000)
    await world.clock.advance(Fixtures.RECHECK_MS)

    expect(await percentOf(ui)).toEqual(['50%'])

    await ui.unmount()
  })

  test('the live check takes no reading while the figures agree, and one start runs one check', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)
    await $.session.start(Fixtures.SESSION)

    const asked = world.asked.length
    const readings = readingsOf(world)

    await world.clock.advance(Fixtures.RECHECK_MS * 3)

    expect(readingsOf(world), 'no reading was taken').toBe(readings)
    expect(world.asked.length - asked, 'one plain read a check').toBe(3)
  })

  test('where compaction waits for the API to refuse a full window, the band counts down to its end', async ($, on) => {
    const world = Fixtures.startsSession(on, 160_000)

    world.usage = Fixtures.usageOf(160_000, { isEnforced: false })

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰'.repeat(16) +
        '▱'.repeat(4) +
        '  80% · 160k/200k tokens · 40k until auto-compact',
    )

    await ui.unmount()
  })

  test('with auto-compact off the band counts down to where Claude Code stops sending requests', async ($, on) => {
    const world = Fixtures.startsSession(on, 180_000)

    world.usage = Fixtures.usageOf(180_000, { isAutoCompact: false })

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰'.repeat(20) + '  90% · 180k/200k tokens · run /compact to continue',
    )

    await ui.unmount()
  })

  test(
    'the band keeps what the mods after it draw there, on every surface',
    { plugins: [Fixtures.NOTE_MOD] },
    async ($, on) => {
      Fixtures.startsSession(on, 84_100)

      await $.session.start(Fixtures.SESSION)

      for (const surface of Fixtures.SURFACES) {
        const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface })

        expect(Fixtures.textOf(await ui.drawn()), surface).toBe(
          CALM_LINE + Fixtures.NOTE_TEXT,
        )

        await ui.unmount()
      }

      await $.command.run(Fixtures.commandOf('context-view', 'hide'))

      const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

      expect(
        Fixtures.textOf(await ui.drawn()),
        'hidden, the band is the other mods',
      ).toBe(Fixtures.NOTE_TEXT)

      await ui.unmount()
    },
  )

  test(
    'where the built-in guard holds settings-hook events back, /clear, /resume and /branch still bring back the choice and the window',
    { plugins: [Fixtures.GUARD] },
    async ($, on) => {
      const world = Fixtures.startsSession(on, 84_100)

      await $.session.start(Fixtures.SESSION)

      const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })
      const readings = readingsOf(world)

      await $.classic.SessionStart({ source: 'clear' })

      expect(readingsOf(world), 'the guard held the event back').toBe(readings)

      for (const command of ['clear', 'resume', 'branch']) {
        world.store.set('isHidden', true)
        await $.command.run(Fixtures.commandOf(command))

        expect(Fixtures.textOf(await ui.drawn()), command).toBe('')

        world.store.set('isHidden', false)
        world.usage = Fixtures.usageOf(120_000)
        await $.command.run(Fixtures.commandOf(command))

        expect(await percentOf(ui), command).toEqual(['60%'])

        world.usage = Fixtures.usageOf(84_100)
      }

      await ui.unmount()
    },
  )

  test(
    'where the guard holds PostModelSwitch back, /model is read once it lands',
    { plugins: [Fixtures.GUARD] },
    async ($, on) => {
      const world = Fixtures.startsSession(on, 84_100)

      await $.session.start(Fixtures.SESSION)

      const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

      await $.classic.PostModelSwitch(Fixtures.MODEL_SWITCH)
      world.usage = Fixtures.usageOf(84_100, { window: 1_000_000 })
      await world.clock.advance(Fixtures.FIRST_READING_MS)

      expect(await percentOf(ui), 'the guard held the event back').toEqual([
        '42%',
      ])

      await $.command.run(Fixtures.commandOf('model', 'claude-test-wide'))
      await world.clock.advance(Fixtures.FIRST_READING_MS)

      expect(await percentOf(ui)).toEqual(['8%'])

      await ui.unmount()
    },
  )

  test('every hook on a settings-hook event, a command, /config or a compaction hands back what answered beneath it, untouched', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.sessionStart = {
      initialUserMessage: 'Carry on with the plan.',
      additionalContext: ['from a SessionStart hook'],
    }

    world.modelSwitch = { additionalContext: ['from a PostModelSwitch hook'] }
    world.refusals.config = 'auto-compact is set by policy'

    await $.session.start(Fixtures.SESSION)

    for (const source of ['clear', 'resume', 'fork'] as const) {
      expect(
        await $.classic.SessionStart({ source }),
        `the session's first message after ${source}`,
      ).toEqual(world.sessionStart)
    }

    expect(await $.classic.PostModelSwitch(Fixtures.MODEL_SWITCH)).toEqual(
      world.modelSwitch,
    )

    expect(await $.config.set(Fixtures.AUTO_COMPACT_OFF)).toEqual({
      deny: 'auto-compact is set by policy',
    })

    for (const command of [
      'clear',
      'resume',
      'branch',
      'autocompact',
      'model',
    ]) {
      expect(await $.command.run(Fixtures.commandOf(command)), command).toEqual(
        { text: 'run by Claude Code' },
      )
    }

    expect(await $.session.compact(Fixtures.compactOf('manual'))).toEqual(
      world.compaction,
    )
  })

  test('a reload whose read of the stored choice fails keeps the band as it was', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.commandOf('context-view', 'hide'))

    world.refusals.load = 'store is unavailable'
    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

    await ui.unmount()
  })

  test('a live check that finds no reading held, as after a reset, reads the stored choice again', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.usage = null

    await $.session.start(Fixtures.SESSION)

    world.store.set('isHidden', true)
    world.usage = Fixtures.usageOf(84_100)
    await world.clock.advance(Fixtures.RECHECK_MS)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

    await ui.unmount()
  })

  test('a survey keeps the band', async ($, on) => {
    Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({
      ...Fixtures.bandAt(120, { hasSurvey: true }),
      surface: 'terminal',
    })

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

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

  test('a breakdown the engine will not count leaves the plain figures and the usual reserve', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.refusals.breakdown = 'busy'

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)
    expect(world.logs, 'the plain figures answered').toEqual([])

    await ui.unmount()
  })

  test('a reading the engine cannot give leaves the band to the engine and says why in the debug log', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.usage = null

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe('')

    expect(world.logs).toEqual([
      'could not read the context window: context-view: $.session.usage: ' +
        'no session bound; the band keeps its last reading',
    ])

    await ui.unmount()
  })

  test('a reading that fails later keeps the last one', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    await $.session.start(Fixtures.SESSION)

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    world.usage = null
    await $.session.measure(Fixtures.measureOf(134_400))

    expect(Fixtures.textOf(await ui.drawn())).toBe(CALM_LINE)
    expect(world.logs.length, 'the failure was logged').toBe(1)

    await ui.unmount()
  })

  test('a command the engine will not register is said in the debug log, and the band still draws', async ($, on) => {
    const world = Fixtures.startsSession(on, 84_100)

    world.refusals.register = '32 commands are registered already'

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
