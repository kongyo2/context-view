import type {
  CommandSpec,
  SessionCompactResult,
  SessionUsage,
} from 'claude-code'
import type { MockClock } from 'claude-code/testing'

/**
 * The world beneath the plugin, as the stubs keep it: what the store holds,
 * which commands were registered, what `$.session.usage()` answers next and
 * what it was asked for, what a compaction answers, the debug log, and the
 * clock the settle readings wait on.
 */
export type World = {
  /**
   * What the store holds, as the plugin saved it.
   */
  store: Map<string, unknown>
  /**
   * The commands the plugin registered, in order.
   */
  commands: CommandSpec[]
  /**
   * Why `$.command.register` refuses, or null when it registers.
   */
  refusal: string | null
  /**
   * What the next `$.session.usage()` answers; null makes the call fail, as
   * it does with no session bound. A test moves it between readings.
   */
  usage: SessionUsage | null
  /**
   * The `breakdown` each `$.session.usage` call asked for, in order.
   */
  asked: unknown[]
  /**
   * What the engine's compaction answers: one that stands, or a skip.
   */
  compaction: SessionCompactResult
  /**
   * The lines the plugin wrote to the debug log, in order.
   */
  logs: string[]
  /**
   * The clock beneath the plugin, moved only by the test.
   */
  clock: MockClock
}
