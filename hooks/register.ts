import { atom, read, update } from 'claude-code'
import type {
  EngineInterface,
  Register,
  SessionContextUsage,
  TurnUsage,
} from 'claude-code'

import { band } from './band'
import { fillOf, percentOf } from './fill-of'
import {
  COMMAND_DESCRIPTION,
  COMMAND_NAME,
  HIDDEN_TEXT,
  SHOWN_TEXT,
  STORE_HIDDEN_KEY,
} from './names'
import { tokensOf } from './tokens-of'
import { windowOf } from './window-of'

/**
 * The window measured against, held by the host so it survives a hot reload
 * of this file; the band redraws whenever it is written.
 */
const contextWindow = atom(
  { plugin: 'context-view', key: 'window' } as const,
  null,
)

/**
 * How full the window is, from the last response or the last request of a
 * running turn; null until a response has landed.
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
 * Registers the context view: `/context-view`, the readings the band follows
 * after every main-thread turn and every request of one, and the band's
 * drawing above the prompt.
 *
 * @param on the engine's registrar
 */
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND_NAME,
      description: COMMAND_DESCRIPTION,
      immediate: true,
    })

    await loadHidden($)

    const result = await next(e)

    await measure($)

    return result
  })

  on(
    'classic.SessionStart',
    { source: ['clear', 'resume', 'fork'] },
    async ($, e, next) => {
      await loadHidden($)
      await measure($)

      return next(e)
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

  on('command.run', { command: 'context-view' }, async $ => {
    const hidden = !(await read($, isHidden))

    await update($, isHidden, () => hidden)
    await $.store.set(STORE_HIDDEN_KEY, hidden).catch(() => undefined)

    return { text: hidden ? HIDDEN_TEXT : SHOWN_TEXT }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const measured = await read($, contextWindow)
    const filled = await read($, contextFill)
    const hidden = await read($, isHidden)

    if (e.props.hasSurvey || hidden || !measured || !filled) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return band(
      { ui: { Box, Text }, columns: e.props.bodyColumns },
      measured,
      filled,
    )
  })
}

/**
 * Copies the person's choice from the store into the session's state:
 * hidden when `/context-view` hid the band in an earlier session.
 *
 * @param $ the engine interface
 */
async function loadHidden($: EngineInterface): Promise<void> {
  const stored = await $.store.get(STORE_HIDDEN_KEY).catch(() => undefined)

  await update($, isHidden, () => stored === true)
}

/**
 * Takes a reading: the window and its compaction reserve from the breakdown
 * (estimated locally, no request sent; the plain figures when it fails),
 * and the fill from the context the engine pushed when it did.
 *
 * @param $ the engine interface
 * @param context the context a measurement carried, when one did
 */
async function measure(
  $: EngineInterface,
  context?: SessionContextUsage,
): Promise<void> {
  const usage =
    (await $.session.usage({ breakdown: 'summary' }).catch(() => undefined)) ??
    (await $.session.usage().catch(() => undefined))

  if (!usage) {
    return
  }

  const measured = windowOf(usage.context)
  const filled = fillOf(context ?? usage.context)

  await update($, contextWindow, () => measured)
  await update($, contextFill, () => filled)
}

/**
 * Follows one request of the main loop's turn: the input tokens it was
 * answered over are the window's fill at that moment, so the band moves
 * while a long turn runs instead of waiting for its end.
 *
 * @param $ the engine interface
 * @param usage what the API reported for the request
 */
async function follow($: EngineInterface, usage: TurnUsage): Promise<void> {
  const measured = await read($, contextWindow)

  if (!measured) {
    return
  }

  const tokens = tokensOf(usage)
  const percent = percentOf(tokens, measured.window)

  await update($, contextFill, () => ({ tokens, percent }))
}
