import type { FoundElement } from 'claude-code/testing'

/**
 * The leaf Texts of a drawing as the eye reads them: each one's text and its
 * tone, the theme key it is drawn in, `dim`, or `plain`.
 *
 * @param found the Texts a mounted drawing found, in document order
 * @returns `[text, tone]` for each Text that holds strings alone, in order
 */
export function tonesOf(found: readonly FoundElement[]): [string, string][] {
  return found
    .filter(text => text.children.every(child => typeof child === 'string'))
    .map(text => [text.text, toneOf(text.props)])
}

/**
 * A Text's tone, from its props.
 *
 * @param props the Text's props
 * @returns its colour's theme key, `dim`, or `plain`
 */
function toneOf(props: Record<string, unknown>): string {
  if (typeof props.color === 'string') {
    return props.color
  }

  return props.dimColor === true ? 'dim' : 'plain'
}
