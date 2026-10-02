import { describe, expect, test, tier } from 'claude-code/testing'

import Glyphs from '../../hooks/glyphs'
import Fixtures from '../fixtures'

tier('user')

const TEXT = '  42% · 84.1k/200k tokens · 82.9k until auto-compact'

describe('band', () => {
  test('a wide band draws a 20-cell meter, then the percentage, the tokens and the headroom', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(84_100))

    for (const surface of Fixtures.SURFACES) {
      const ui = await $.ui.mount({ ...Fixtures.bandAt(120), surface })

      expect(Fixtures.textOf(await ui.drawn())).toBe(
        '▰'.repeat(8) + '▱'.repeat(9) + '▰'.repeat(3) + TEXT,
      )

      await ui.unmount()
    }
  })

  test("calm, it speaks in Claude Code's usage blue and keeps the rest dim, from the prompt's text column", async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(84_100))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })
    const texts = await ui.findAll({ type: 'Text' })

    expect(Fixtures.tonesOf(texts)).toEqual([
      ['▰'.repeat(8), 'permission'],
      ['▱', 'permission'],
      ['▱'.repeat(8), 'dim'],
      ['▰'.repeat(3), 'dim'],
      ['42%', 'permission'],
      [' · ', 'dim'],
      ['84.1k/200k tokens', 'dim'],
      [' · ', 'dim'],
      ['82.9k until auto-compact', 'dim'],
    ])

    expect(
      texts.some(text => text.props.bold === true),
      'nothing bold',
    ).toBe(false)

    expect(
      texts[0]?.props.wrap,
      'one line, cut at the end rather than wrapped',
    ).toBe('truncate-end')

    expect(await ui.find({ type: 'Box' })).toMatchObject({
      props: { paddingLeft: 2, paddingRight: 4 },
    })

    await ui.unmount()
  })

  test('from six tenths of the threshold the meter, the percentage and the headroom turn to the warning colour', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(134_400))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.tonesOf(await ui.findAll({ type: 'Text' }))).toEqual([
      ['▰'.repeat(13), 'warning'],
      ['▱', 'warning'],
      ['▱'.repeat(3), 'dim'],
      ['▰'.repeat(3), 'dim'],
      ['67%', 'warning'],
      [' · ', 'dim'],
      ['134.4k/200k tokens', 'dim'],
      [' · ', 'dim'],
      ['32.6k until auto-compact', 'warning'],
    ])

    await ui.unmount()
  })

  test('within the last 20k before the threshold they turn to the error colour', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(160_000))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.tonesOf(await ui.findAll({ type: 'Text' }))).toEqual([
      ['▰'.repeat(16), 'error'],
      ['▱', 'dim'],
      ['▰'.repeat(3), 'dim'],
      ['80%', 'error'],
      [' · ', 'dim'],
      ['160k/200k tokens', 'dim'],
      [' · ', 'dim'],
      ['7k until auto-compact', 'error'],
    ])

    await ui.unmount()
  })

  test('past the threshold the context fills the cells up to the reserve and auto-compact runs next', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(170_000))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.tonesOf(await ui.findAll({ type: 'Text' }))).toEqual([
      ['▰'.repeat(17), 'error'],
      ['▰'.repeat(3), 'dim'],
      ['85%', 'error'],
      [' · ', 'dim'],
      ['170k/200k tokens', 'dim'],
      [' · ', 'dim'],
      ['auto-compact next', 'error'],
    ])

    await ui.unmount()
  })

  test("the right end stays clear for the engine's [-] and the cell before it", async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(84_100))

    const exact = await $.ui.mount({
      ...Fixtures.bandAt(78),
      surface: 'terminal',
    })

    expect(Fixtures.textOf(await exact.drawn())).toBe(
      '▰'.repeat(8) + '▱'.repeat(9) + '▰'.repeat(3) + TEXT,
    )

    await exact.unmount()

    const short = await $.ui.mount({
      ...Fixtures.bandAt(77),
      surface: 'terminal',
    })

    expect(
      Fixtures.textOf(await short.drawn()),
      'a cell short, the meter narrows rather than meet the [-]',
    ).toBe('▰'.repeat(5) + '▱'.repeat(5) + '▰'.repeat(2) + TEXT)

    await short.unmount()
  })

  test('the meter narrows to 12 and then 8 cells before any text goes', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(84_100))

    const twelve = await $.ui.mount({
      ...Fixtures.bandAt(70),
      surface: 'terminal',
    })

    expect(Fixtures.textOf(await twelve.drawn())).toBe(
      '▰'.repeat(5) + '▱'.repeat(5) + '▰'.repeat(2) + TEXT,
    )

    await twelve.unmount()

    const eight = await $.ui.mount({
      ...Fixtures.bandAt(66),
      surface: 'terminal',
    })

    expect(Fixtures.textOf(await eight.drawn())).toBe(
      '▰'.repeat(3) + '▱'.repeat(4) + '▰' + TEXT,
    )

    await eight.unmount()
  })

  test('then the headroom goes and the meter widens again, then the tokens', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(84_100))

    const tokens = await $.ui.mount({
      ...Fixtures.bandAt(65),
      surface: 'terminal',
    })

    expect(Fixtures.textOf(await tokens.drawn())).toBe(
      '▰'.repeat(8) +
        '▱'.repeat(9) +
        '▰'.repeat(3) +
        '  42% · 84.1k/200k tokens',
    )

    await tokens.unmount()

    const percent = await $.ui.mount({
      ...Fixtures.bandAt(26),
      surface: 'terminal',
    })

    expect(Fixtures.textOf(await percent.drawn())).toBe(
      '▰'.repeat(5) + '▱'.repeat(5) + '▰'.repeat(2) + '  42%',
    )

    await percent.unmount()
  })

  test('the narrowest band keeps the narrowest meter and the percentage', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(84_100))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(12), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰'.repeat(3) + '▱'.repeat(4) + '▰' + '  42%',
    )

    await ui.unmount()
  })

  test('with auto-compact off the reserve is the reply room and the compact buffer, and the headroom counts down to where requests stop', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.MANUAL_WINDOW, Fixtures.fillAt(84_100))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰'.repeat(8) +
        '▱'.repeat(10) +
        '▰'.repeat(2) +
        '  42% · 84.1k/200k tokens · 92.9k before the limit',
    )

    await ui.unmount()
  })

  test('where compaction waits for the API to refuse a full window, no reserve is drawn', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.REACTIVE_WINDOW, Fixtures.fillAt(84_100))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '▰'.repeat(8) +
        '▱'.repeat(12) +
        '  42% · 84.1k/200k tokens · 115.9k until auto-compact',
    )

    await ui.unmount()
  })

  test('at the limit with auto-compact off it asks for /compact', async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.MANUAL_WINDOW, Fixtures.fillAt(197_500))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.tonesOf(await ui.findAll({ type: 'Text' }))).toEqual([
      ['▰'.repeat(20), 'error'],
      ['99%', 'error'],
      [' · ', 'dim'],
      ['197.5k/200k tokens', 'dim'],
      [' · ', 'dim'],
      ['run /compact to continue', 'error'],
    ])

    await ui.unmount()
  })

  test("an estimate draws in the same tones, each figure marked with Claude Code's '~'", async ($, on) => {
    Fixtures.drawsBand(on, Fixtures.WINDOW, Fixtures.fillAt(84_100, true))

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.tonesOf(await ui.findAll({ type: 'Text' }))).toEqual([
      ['▰'.repeat(8), 'permission'],
      ['▱', 'permission'],
      ['▱'.repeat(8), 'dim'],
      ['▰'.repeat(3), 'dim'],
      ['~42%', 'permission'],
      [' · ', 'dim'],
      ['~84.1k/200k tokens', 'dim'],
      [' · ', 'dim'],
      ['~82.9k until auto-compact', 'dim'],
    ])

    await ui.unmount()
  })

  test('a window capped below the model draws all past its threshold as reserve', async ($, on) => {
    const capped = {
      ...Fixtures.WINDOW,
      window: 1_000_000,
      limit: 150_000,
    }

    Fixtures.drawsBand(on, capped, {
      tokens: 33_800,
      percent: 3,
      isEstimate: false,
    })

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.tonesOf(await ui.findAll({ type: 'Text' }))).toEqual([
      ['▱', 'permission'],
      ['▱', 'dim'],
      ['▰'.repeat(18), 'dim'],
      ['3%', 'permission'],
      [' · ', 'dim'],
      ['33.8k/1m tokens', 'dim'],
      [' · ', 'dim'],
      ['83.2k until auto-compact', 'dim'],
    ])

    await ui.unmount()
  })

  test('the blocks draw the same cells', async ($, on) => {
    Fixtures.drawsBand(
      on,
      Fixtures.WINDOW,
      Fixtures.fillAt(84_100),
      Glyphs.BLOCK_GLYPHS,
    )

    const ui = await $.ui.mount({ ...Fixtures.bandAt(), surface: 'terminal' })

    expect(Fixtures.textOf(await ui.drawn())).toBe(
      '█'.repeat(8) + '░'.repeat(9) + '█'.repeat(3) + TEXT,
    )

    await ui.unmount()
  })
})
