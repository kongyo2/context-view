import type { On, RenderElement } from 'claude-code'
import { mock } from 'claude-code/testing'

import { ENGINE_TEXT } from './engine-text.js'
import { SUMMARY } from './summary.js'
import { usageOf } from './usage-of.js'
import type { World } from './world.js'

const ENGINE_DRAWING: RenderElement = {
  type: 'Text',
  props: {},
  children: [ENGINE_TEXT],
}

export function startsSession(
  on: On,
  tokens?: number,
  variables: Readonly<Record<string, string>> = {},
): World {
  const world: World = {
    store: new Map(),
    commands: [],
    usage: usageOf(tokens),
    lag: 0,
    asked: [],
    compaction: { messages: [SUMMARY] },
    refusals: {},
    logs: [],
    clock: mock.clock(on),
  }

  mock.env(on, variables)

  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('classic.SessionStart', () => ({}))
  on('classic.PostModelSwitch', () => ({}))
  on('session.measure', ($, e) => ({ changed: e.changed }))
  on('session.compact', () => world.compaction)
  on('config.set', ($, e) => ({ value: e.value }))
  on('command.run', () => ({ text: 'run by Claude Code' }))

  on('command.register', ($, e) => {
    if (world.refusals.register !== undefined) {
      return { deny: world.refusals.register }
    }

    world.commands.push(e)

    return { value: { command: e.name } }
  })

  on('store.get', ($, e) => ({ value: world.store.get(e.key) }))

  on('store.set', ($, e) => {
    if (world.refusals.save !== undefined) {
      return { deny: world.refusals.save }
    }

    world.store.set(e.key, e.value)

    return { value: undefined }
  })

  on('session.usage', async ($, e) => {
    world.asked.push(e.breakdown)

    const answer = world.usage

    if (e.breakdown !== undefined) {
      if (world.refusals.breakdown !== undefined) {
        return { deny: world.refusals.breakdown }
      }

      if (world.lag > 0) {
        await world.clock.sleep(world.lag)
      }
    }

    return answer ? { value: answer } : { deny: 'no session bound' }
  })

  on('ui.log', ($, e) => {
    if (e.to === 'debug') {
      world.logs.push(e.text)
    }

    return { value: undefined }
  })

  on('ui.render', () => ENGINE_DRAWING)

  return world
}
