export function percentOf(tokens: number, window: number): number {
  if (window <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((tokens / window) * 100)))
}
