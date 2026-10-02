import type { On, RenderElement } from 'claude-code'
import { mock } from 'claude-code/testing'

import { ENGINE_TEXT } from './engine-text.js'
import { usageOf } from './usage-of.js'
import type { World } from './world.js'

/**
 * The engine's own drawing of the band, as it answers a pass.
 */
const ENGINE_DRAWING: RenderElement = {
  type: 'Text',
  props: {},
  children: [ENGINE_TEXT],
}

/**
 * Answers what every session asks beneath the plugin: its start, the clear
 * and resume events, each measurement, the command it registers, the
 * environment, the store, the usage, and the engine's own band where the
 * plugin passes.
 *
 * @param on the test's `on`
 * @param tokens the context's tokens; left out before the first response
 * @param variables the environment the plugin reads
 * @returns the world, for a test to read and move
 */
export function startsSession(
  on: On,
  tokens?: number,
  variables: Readonly<Record<string, string>> = {},
): World {
  const world: World = {
    store: new Map(),
    commands: [],
    usage: usageOf(tokens),
    asked: [],
  }

  mock.env(on, variables)

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
