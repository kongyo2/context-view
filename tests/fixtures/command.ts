import type { CommandRunInput } from 'claude-code'

import { commandOf } from './command-of.js'

export const COMMAND: CommandRunInput = commandOf('context-view')
