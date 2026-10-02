import { atom, read, update } from 'claude-code'
import type {
  EngineInterface,
  On,
  SessionContextUsage,
  SessionUsage,
  TurnUsage,
} from 'claude-code'

import Command from './command'
import Glyphs from './glyphs'
import Limits from './limits'
import { messageOf } from './message-of'
import Names from './names'
import Readings from './readings'
import Views from './views'

/**
 * The window measured against, held by the host so it survives a hot reload
 * of this file; the band draws again whenever it is written.
 */
const contextWindow = atom(
  { plugin: 'context-view', key: 'window' } as const,
  null,
)

/**
 * How full the window is: the last response's figure, or the engine's
 * estimate until a response of this window has landed; null with neither.
 */
const contextFill = atom({ plugin: 'context-view', key: 'fill' } as const, null)

/**
 * Whether `/context-view` has hidden the band; copied from the store at the
 * session's start and again after `/clear`, `/resume` and `/branch`.
 */
const isHidden = atom(
  { plugin: 'context-view', key: 'isHidden' } as const,
  false,
)

/**
 * Registers the context view: `/context-view`, the readings the band takes
 * whenever the window moves (each main-thread request and turn, a
 * compaction, a model switch, a change to auto-compact), and the band
 * itself above the prompt.
 *
 * Whatever a hook does after `next(e)` never fails it: the engine's own
 * work has run by then, and a reading that fails goes to the debug log.
 *
 * @param on the engine's registrar
 */
export function register(on: On): void {
  let glyphs: Glyphs.GlyphSet = Glyphs.PILL_GLYPHS

  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({
        name: Names.COMMAND_NAME,
        description: Names.COMMAND_DESCRIPTION,
        argumentHint: Names.COMMAND_ARGUMENT_HINT,
        immediate: true,
      })
    } catch (error) {
      $.ui.log(Names.registerFailedTextOf(messageOf(error)), { to: 'debug' })
    }

    const result = await next(e)

    glyphs = await glyphsFor($)
    await loadHidden($)
    await measure($)

    return result
  })

  on(
    'classic.SessionStart',
    { source: ['clear', 'resume', 'fork'] },
    async ($, e, next) => {
      const result = await next(e)

      await loadHidden($)
      await measure($)

      return result
    },
  )

  on('session.measure', async ($, e, next) => {
    const result = await next(e)

    if (e.changed.includes('context')) {
      await measure($, e.context)
    }

    return result
  })

  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)

    if (e.agentId === undefined && result.usage) {
      await follow($, result.usage)
    }

    return result
  })

  on(
    'session.compact',
    { trigger: ['manual', 'auto', 'plugin'] },
    async ($, e, next) => {
      const result = await next(e)

      if (e.agentId === undefined && result.skip === undefined) {
        settle($)
      }

      return result
    },
  )

  on('classic.PostModelSwitch', async ($, e, next) => {
    const result = await next(e)

    settle($)

    return result
  })

  on('config.set', { key: 'autoCompact' }, async ($, e, next) => {
    const result = await next(e)

    if (result.deny === undefined) {
      settle($)
    }

    return result
  })

  on('command.run', { command: 'autocompact' }, async ($, e, next) => {
    const result = await next(e)

    settle($)

    return result
  })

  on('command.run', { command: 'context-view' }, async ($, e) => {
    const hidden = Command.hiddenOf(e.args, await read($, isHidden))

    if (hidden === null) {
      return { text: Names.USAGE_TEXT }
    }

    await update($, isHidden, () => hidden)

    await $.store
      .set(Names.STORE_HIDDEN_KEY, hidden)
      .catch(error =>
        $.ui.log(Names.saveFailedTextOf(messageOf(error)), { to: 'debug' }),
      )

    return { text: hidden ? Names.HIDDEN_TEXT : Names.SHOWN_TEXT }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const measured = await read($, contextWindow)
    const filled = await read($, contextFill)
    const hidden = await read($, isHidden)

    if (e.props.hasSurvey || hidden || !measured || !filled) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return Views.band(
      {
        ui: { Box, Text },
        columns: e.props.bodyColumns,
        glyphs: e.surface === 'terminal' ? glyphs : Glyphs.PILL_GLYPHS,
      },
      measured,
      filled,
    )
  })
}

/**
 * The marks this terminal draws the meter with, as Claude Code picks its
 * own: the pills, or the blocks in Ghostty.
 *
 * @param $ the engine interface
 * @returns the marks
 */
async function glyphsFor($: EngineInterface): Promise<Glyphs.GlyphSet> {
  const term = await $.env.get('TERM').catch(() => undefined)
  const program = await $.env.get('TERM_PROGRAM').catch(() => undefined)

  return Glyphs.glyphsOf(term, program)
}

/**
 * Copies the person's choice from the store into the session's state:
 * hidden when `/context-view` hid the band in an earlier session.
 *
 * @param $ the engine interface
 */
async function loadHidden($: EngineInterface): Promise<void> {
  const stored = await $.store
    .get(Names.STORE_HIDDEN_KEY)
    .catch(() => undefined)

  await update($, isHidden, () => stored === true).catch(() => undefined)
}

/**
 * Takes a reading: the window and its compaction reserve from the breakdown
 * (estimated locally, no request sent; the plain figures where that fails),
 * and the fill from the live figure the engine pushed, else from the one it
 * answers, which stands in with its estimate until a response has landed.
 *
 * Never fails: a reading the engine cannot give goes to the debug log and
 * the band keeps the last one.
 *
 * @param $ the engine interface
 * @param context the context a measurement carried, when one did
 */
async function measure(
  $: EngineInterface,
  context?: SessionContextUsage,
): Promise<void> {
  try {
    const usage = await usageOf($)
    const measured = Readings.windowOf(usage.context)
    const filled = Readings.fillOf(
      context?.tokens === undefined ? usage.context : context,
    )

    await update($, contextWindow, () => measured)
    await update($, contextFill, () => filled)
  } catch (error) {
    $.ui.log(Names.readingFailedTextOf(messageOf(error)), { to: 'debug' })
  }
}

/**
 * What the engine answers for the session's usage: with the breakdown's
 * summary when it can give one, else the plain figures.
 *
 * @param $ the engine interface
 * @returns the usage; rejects when neither answers
 */
async function usageOf($: EngineInterface): Promise<SessionUsage> {
  try {
    return await $.session.usage({ breakdown: 'summary' })
  } catch {
    return $.session.usage()
  }
}

/**
 * Follows one request of the main loop's turn: the input tokens it was
 * answered over are the window's fill at that moment, so the band moves
 * while a long turn runs instead of waiting for its end. A window not yet
 * measured is measured first.
 *
 * Never fails: a reading the engine cannot give goes to the debug log.
 *
 * @param $ the engine interface
 * @param usage what the API reported for the request
 */
async function follow($: EngineInterface, usage: TurnUsage): Promise<void> {
  try {
    if (!(await read($, contextWindow))) {
      await measure($)
    }

    const measured = await read($, contextWindow)

    if (!measured) {
      return
    }

    const tokens = Readings.tokensOf(usage)
    const percent = Readings.percentOf(tokens, measured.window)

    await update($, contextFill, () => ({ tokens, percent, isEstimate: false }))
  } catch (error) {
    $.ui.log(Names.readingFailedTextOf(messageOf(error)), { to: 'debug' })
  }
}

/**
 * Takes readings shortly after a change the engine lands only once the hook
 * that saw it has returned, as a compaction's conversation, a setting's new
 * value and a new model's window are: one at each settle delay, so the band
 * follows within a tenth of a second and still catches a slow landing.
 *
 * Never fails: a timer the engine refuses goes to the debug log.
 *
 * @param $ the engine interface
 */
function settle($: EngineInterface): void {
  try {
    for (const ms of Limits.SETTLE_DELAYS_MS) {
      $.clock.after(ms, () => void measure($))
    }
  } catch (error) {
    $.ui.log(Names.readingFailedTextOf(messageOf(error)), { to: 'debug' })
  }
}
