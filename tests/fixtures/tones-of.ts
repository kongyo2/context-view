import type { FoundElement } from 'claude-code/testing'

export function tonesOf(found: readonly FoundElement[]): [string, string][] {
  return found
    .filter(text => text.children.every(child => typeof child === 'string'))
    .map(text => [text.text, toneOf(text.props)])
}

function toneOf(props: Record<string, unknown>): string {
  if (typeof props.color === 'string') {
    return props.color
  }

  return props.dimColor === true ? 'dim' : 'plain'
}
