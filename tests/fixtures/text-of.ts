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
