/**
 * The debug log's line when `/context-view` could not keep the person's
 * choice for later sessions: this session follows it, later ones do not.
 *
 * @param reason the failure's message
 * @returns the line
 */
export const saveFailedTextOf = (reason: string) =>
  `could not save whether the band is hidden: ${reason}; this session only`
