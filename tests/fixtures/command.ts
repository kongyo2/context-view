import type { CommandRunInput } from 'claude-code'

/**
 * `/context-view` as the person types it, with no arguments, under the
 * fullscreen layout on a 160-column terminal.
 */
export const COMMAND: CommandRunInput = {
  command: 'context-view',
  args: '',
  origin: { kind: 'composer' },
  presentation: { isFullscreen: true, columns: 160 },
}
