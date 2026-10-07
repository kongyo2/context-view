export function formatCount(count: number): string {
  const whole = Math.max(0, Math.round(count))

  if (whole < 1_000) {
    return String(whole)
  }

  const thousands = Math.round(whole / 100) / 10

  if (thousands < 1_000) {
    return `${trimmed(thousands)}k`
  }

  return `${trimmed(Math.round(whole / 100_000) / 10)}m`
}

const trimmed = (figure: number): string => figure.toFixed(1).replace('.0', '')
