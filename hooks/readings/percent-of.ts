/**
 * Tokens over the window as a whole percentage, 0 to 100, as the status line
 * figures it.
 *
 * @param tokens the context's tokens
 * @param window the model's window
 * @returns the percentage
 */
export function percentOf(tokens: number, window: number): number {
  if (window <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((tokens / window) * 100)))
}
