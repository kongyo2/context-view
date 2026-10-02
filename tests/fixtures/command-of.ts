import type { CommandRunInput } from 'claude-code'

/**
 * A slash command as the person types it, under the fullscreen layout on a
 * 160-column terminal.
 *
 * @param command the command's name, without its slash
 * @param args what follows the name, as typed
 * @returns the run
 */
export const commandOf = (command: string, args = ''): CommandRunInput => ({
  command,
  args,
  origin: { kind: 'composer' },
  presentation: { isFullscreen: true, columns: 160 },
})
