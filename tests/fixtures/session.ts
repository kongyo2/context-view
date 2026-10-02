import type { SessionStartInput } from 'claude-code'

export const SESSION: SessionStartInput = {
  surface: 'terminal',
  isInteractive: true,
  cwd: '/work',
}
