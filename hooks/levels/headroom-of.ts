import type { ContextViewFill, ContextViewWindow } from '../../types'

export function headroomOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): number {
  return window.limit - window.buffer - fill.tokens - (fill.output ?? 0)
}
