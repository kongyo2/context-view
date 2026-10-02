/**
 * A token count as Claude Code prints one: whole under a thousand, else to
 * one decimal in thousands or millions, lower case, with a trailing `.0`
 * dropped (`950`, `84.1k`, `200k`, `1m`).
 *
 * @param count the tokens
 * @returns the count, compact
 */
export function formatTokens(count: number): string {
  const tokens = Math.max(0, Math.round(count))

  if (tokens < 1_000) {
    return String(tokens)
  }

  const thousands = Math.round(tokens / 100) / 10

  if (thousands < 1_000) {
    return `${trimmed(thousands)}k`
  }

  return `${trimmed(Math.round(tokens / 100_000) / 10)}m`
}

const trimmed = (figure: number): string => figure.toFixed(1).replace('.0', '')
