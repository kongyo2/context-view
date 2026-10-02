import type { SessionUsage } from 'claude-code'

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
