import type { ContextViewFill, ContextViewWindow } from '../../types'

/**
 * The tokens the context may still take before compaction: the window
 * measured against, less its reserve, less the context.
 *
 * @param window the window measured against and its reserve
 * @param fill the context's tokens
 * @returns the headroom, negative past the threshold
 */
export function headroomOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): number {
  return window.limit - window.buffer - fill.tokens
}
