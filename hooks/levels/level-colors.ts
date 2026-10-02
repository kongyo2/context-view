import type { Level } from './level.js'

export const LEVEL_COLORS: Readonly<Record<Level, string>> = {
  calm: 'permission',
  warning: 'warning',
  error: 'error',
}
