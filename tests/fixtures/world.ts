import type {
  ClassicResultOf,
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
  sessionStart: ClassicResultOf['classic.SessionStart']
  modelSwitch: ClassicResultOf['classic.PostModelSwitch']
  refusals: {
    register?: string
    breakdown?: string
    load?: string
    save?: string
    config?: string
  }
  logs: string[]
  clock: MockClock
}
