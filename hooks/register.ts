import { atom, read, update } from 'claude-code'
import type {
  EngineInterface,
  On,
  SessionContextUsage,
  SessionUsage,
  Timer,
  TurnUsage,
} from 'claude-code'

import Command from './command'
import Glyphs from './glyphs'
import Limits from './limits'
import { messageOf } from './message-of'
import Names from './names'
import Readings from './readings'
import Views from './views'

const contextWindow = atom(
  { plugin: 'context-view', key: 'window' } as const,
  null,
)

const contextFill = atom({ plugin: 'context-view', key: 'fill' } as const, null)

const isHidden = atom(
  { plugin: 'context-view', key: 'isHidden' } as const,
  false,
)

let latest = 0

export function register(on: On): void {
  let glyphs: Glyphs.GlyphSet = Glyphs.PILL_GLYPHS
  let rechecking: Timer | undefined

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

    rechecking?.cancel()
    rechecking = recheckEvery($)

    return result
  })

  on(
    'classic.SessionStart',
    { source: ['clear', 'resume', 'fork'] },
    async ($, e, next) => {
      const result = await next(e)

      await loadHidden($)
      await measure($)
      settle($)

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

async function glyphsFor($: EngineInterface): Promise<Glyphs.GlyphSet> {
  const term = await $.env.get('TERM').catch(() => undefined)
  const program = await $.env.get('TERM_PROGRAM').catch(() => undefined)

  return Glyphs.glyphsOf(term, program)
}

async function loadHidden($: EngineInterface): Promise<void> {
  const stored = await $.store
    .get(Names.STORE_HIDDEN_KEY)
    .catch(() => undefined)

  await update($, isHidden, () => stored === true).catch(() => undefined)
}

async function measure(
  $: EngineInterface,
  context?: SessionContextUsage,
): Promise<void> {
  latest += 1

  const ticket = latest

  try {
    const usage = await usageOf($)
    const measured = Readings.windowOf(usage.context)
    const filled = Readings.fillOf(
      context?.tokens === undefined
        ? usage.context
        : { ...context, breakdown: usage.context.breakdown },
    )

    if (ticket === latest) {
      await update($, contextWindow, () => measured)
    }

    if (ticket === latest) {
      await update($, contextFill, () => filled)
    }
  } catch (error) {
    $.ui.log(Names.readingFailedTextOf(messageOf(error)), { to: 'debug' })
  }
}

async function usageOf($: EngineInterface): Promise<SessionUsage> {
  try {
    return await $.session.usage({ breakdown: 'summary' })
  } catch {
    return $.session.usage()
  }
}

async function follow($: EngineInterface, usage: TurnUsage): Promise<void> {
  try {
    if (!(await read($, contextWindow))) {
      await measure($)
    }

    const measured = await read($, contextWindow)

    if (!measured) {
      return
    }

    latest += 1

    const tokens = Readings.tokensOf(usage)
    const percent = Readings.percentOf(tokens, measured.window)

    await update($, contextFill, () => ({
      tokens,
      percent,
      isEstimate: false,
      output: usage.output_tokens,
    }))
  } catch (error) {
    $.ui.log(Names.readingFailedTextOf(messageOf(error)), { to: 'debug' })
  }
}

function settle($: EngineInterface): void {
  try {
    for (const ms of Limits.SETTLE_DELAYS_MS) {
      $.clock.after(ms, () => void measure($))
    }
  } catch (error) {
    $.ui.log(Names.readingFailedTextOf(messageOf(error)), { to: 'debug' })
  }
}

function recheckEvery($: EngineInterface): Timer | undefined {
  try {
    return $.clock.every(Limits.RECHECK_MS, () => void recheck($))
  } catch (error) {
    $.ui.log(Names.readingFailedTextOf(messageOf(error)), { to: 'debug' })

    return undefined
  }
}

async function recheck($: EngineInterface): Promise<void> {
  try {
    const { context } = await $.session.usage()
    const measured = await read($, contextWindow)
    const filled = await read($, contextFill)

    if (Readings.isOutdated(context, measured, filled)) {
      await measure($)
    }
  } catch {
    return
  }
}
