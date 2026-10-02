import type { CommandRunInput } from 'claude-code'

export const commandOf = (command: string, args = ''): CommandRunInput => ({
  command,
  args,
  origin: { kind: 'composer' },
  presentation: { isFullscreen: true, columns: 160 },
})
