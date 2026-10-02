/**
 * A drawn tree's text as it reads: its string children, depth first, in
 * drawing order.
 *
 * @param node a drawing, an element of one, a child or a list
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
