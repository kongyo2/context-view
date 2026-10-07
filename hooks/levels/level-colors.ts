import type { ThemeKey } from 'claude-code'

import type { Level } from './level.js'

export const LEVEL_COLORS: Readonly<Record<Level, ThemeKey>> = {
  calm: 'permission',
  warning: 'warning',
  error: 'error',
}
