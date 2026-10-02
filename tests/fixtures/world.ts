import type {
  CommandSpec,
  SessionCompactResult,
  SessionUsage,
} from 'claude-code'
import type { MockClock } from 'claude-code/testing'

export type World = {
  store: Map<string, unknown>
  commands: CommandSpec[]
  usage: SessionUsage | null
  lag: number
  asked: unknown[]
  compaction: SessionCompactResult
  refusals: {
    register?: string
    breakdown?: string
    load?: string
    save?: string
  }
  logs: string[]
  clock: MockClock
}
