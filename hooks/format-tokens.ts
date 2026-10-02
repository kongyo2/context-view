/**
 * A token count as Claude Code's status line and /context print one: whole
 * under a thousand, else to one decimal in thousands or millions with a
 * trailing `.0` dropped (`950`, `84.1k`, `200k`, `1M`).
 *
 * @param count the tokens
 * @returns the count, compact
 */
export function formatTokens(count: number): string {
  const tokens = Math.max(0, count)

  if (tokens < 1_000) {
    return String(Math.round(tokens))
  }

  const thousands = Math.round(tokens / 100) / 10

  if (thousands >= 1_000) {
    return `${trimmed((thousands / 1_000).toFixed(1))}M`
  }

  return `${trimmed(thousands.toFixed(1))}k`
}

const trimmed = (figure: string): string => figure.replace(/\.0$/, '')
