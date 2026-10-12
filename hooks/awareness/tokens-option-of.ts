export function tokensOptionOf(value: unknown, fallback: number): number {
  const isCount =
    typeof value === 'number' && Number.isFinite(value) && value >= 0

  return isCount ? Math.floor(value) : fallback
}
