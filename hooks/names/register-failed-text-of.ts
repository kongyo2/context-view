/**
 * The debug log's line when `/context-view` could not be registered: the
 * band still draws, only the command to hide it is missing.
 *
 * @param reason the refusal's message
 * @returns the line
 */
export const registerFailedTextOf = (reason: string) =>
  `could not register /context-view: ${reason}; the band draws without it`
