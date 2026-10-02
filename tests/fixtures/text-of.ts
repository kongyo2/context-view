/**
 * A drawn element's text as it reads: its string children, depth first, in
 * drawing order.
 *
 * @param node an element a mounted drawing found, a child of one, or a list
 * @returns the text; '' for nothing
 */
export function textOf(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(textOf).join('')
  }

  if (typeof node !== 'object' || !node) {
    return ''
  }

  return textOf(Reflect.get(node, 'children') ?? [])
}
