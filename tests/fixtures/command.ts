import type { CommandRunInput } from 'claude-code'

import { commandOf } from './command-of.js'

/**
 * `/context-view` as the person types it, with no arguments.
 */
export const COMMAND: CommandRunInput = commandOf('context-view')
