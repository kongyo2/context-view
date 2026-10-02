/**
 * The plugin's name, as plugin.json and the state contract spell it.
 */
export const PLUGIN_NAME = 'context-view'

/**
 * The command that hides and shows the band, run as `/context-view`.
 */
export const COMMAND_NAME = 'context-view'

/**
 * The command's line in the typeahead and `/help`.
 */
export const COMMAND_DESCRIPTION =
  'Hide or show the context usage band above the prompt'

/**
 * What `/context-view` leaves in the transcript when it hides the band.
 */
export const HIDDEN_TEXT = 'Context view hidden'

/**
 * What `/context-view` leaves in the transcript when it shows the band.
 */
export const SHOWN_TEXT = 'Context view shown'

/**
 * The store key the person's choice is kept under, across sessions.
 */
export const STORE_HIDDEN_KEY = 'isHidden'

/**
 * The words after the tokens left before compaction, as Claude Code's own
 * line under the prompt puts them.
 */
export const UNTIL_COMPACT_TEXT = 'until auto-compact'

/**
 * What the band says once the threshold is reached: compaction runs before
 * the next request.
 */
export const COMPACT_NEXT_TEXT = 'auto-compact next'

/**
 * The words after the tokens left where auto-compact is off: the window's
 * own limit is what is left.
 */
export const BEFORE_LIMIT_TEXT = 'before the limit'

/**
 * What the band says at the limit where auto-compact is off, as Claude
 * Code's own line puts it.
 */
export const RUN_COMPACT_TEXT = 'run /compact to continue'

/**
 * The word after the tokens used over the window, as /context prints it.
 */
export const TOKENS_TEXT = 'tokens'
