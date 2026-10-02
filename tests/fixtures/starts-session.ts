import type { On, RenderElement, SessionUsage } from 'claude-code'

import { usageOf } from './usage-of'

/**
 * What the engine draws in the band when the plugin passes.
 */
export const ENGINE_TEXT = 'drawn by Claude Code'

/**
 * The engine's own drawing of the band, as the stub beneath the plugin
 * answers `next(e)`.
 */
const ENGINE_DRAWING: RenderElement = {
  type: 'Text',
  props: {},
  children: [ENGINE_TEXT],
}

/**
 * The world beneath the plugin, as the stubs keep it: what the store holds,
 * which commands were registered, what `$.session.usage()` answers next and
 * what it was asked for.
 */
export type World = {
  /**
   * What the store holds, as the plugin saved it.
   */
  store: Map<string, unknown>
  /**
   * The commands the plugin registered, in order.
   */
  commands: string[]
  /**
   * What the next `$.session.usage()` answers; null makes the call fail, as
   * it does with no session bound. A test moves it between readings.
   */
  usage: SessionUsage | null
  /**
   * The `breakdown` each `$.session.usage` call asked for, in order.
   */
  asked: unknown[]
}

/**
 * Answers what every session asks beneath the plugin: its start, the clear
 * and resume events, each measurement, the command it registers, the store,
 * the usage, and the engine's own band where the plugin passes.
 *
 * @param on the test's `on`
 * @param tokens the context's tokens; left out before the first response
 * @returns the world, for a test to read and move
 */
export function startsSession(on: On, tokens?: number): World {
  const world: World = {
    store: new Map(),
    commands: [],
    usage: usageOf(tokens),
    asked: [],
  }

  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('classic.SessionStart', () => ({}))
  on('session.measure', ($, e) => ({ changed: e.changed }))

  on('command.register', ($, e) => {
    world.commands.push(e.name)

    return { value: { command: e.name } }
  })

  on('store.get', ($, e) => ({ value: world.store.get(e.key) }))

  on('store.set', ($, e) => {
    world.store.set(e.key, e.value)

    return { value: undefined }
  })

  on('session.usage', ($, e) => {
    world.asked.push(e.breakdown)

    return world.usage ? { value: world.usage } : { deny: 'no session bound' }
  })

  on('ui.render', () => ENGINE_DRAWING)

  return world
}
