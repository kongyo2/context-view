/**
 * The debug log's line when the engine gave no reading of the context
 * window: the band keeps the last one it had, or stays away without one.
 *
 * @param reason the failure's message
 * @returns the line
 */
export const readingFailedTextOf = (reason: string) =>
  `could not read the context window: ${reason}; the band keeps its last ` +
  'reading'
