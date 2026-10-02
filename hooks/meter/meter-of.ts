import type { ContextViewFill, ContextViewWindow } from '../../types'
import Limits from '../limits'
import type { Cell } from './cell.js'

/**
 * The meter's cells, left to right, as /context lays its grid out: the
 * context's whole cells, the one it part fills, the window left, and at the
 * end the reserve, everything past the compaction threshold.
 *
 * The meter spans the model's window, as the percentage and the token count
 * do, so where a setting caps the window compaction measures against, the
 * capped part is reserve too. A context past the threshold fills the
 * reserve's cells.
 *
 * @param window the window, its compaction limit and its reserve
 * @param fill the context's tokens
 * @param cells how many cells across
 * @returns one cell kind per cell
 */
export function meterOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
  cells: number,
): Cell[] {
  const scale = Math.max(1, window.window)
  const threshold = Math.max(0, window.limit - window.buffer)
  const reserved = Math.max(0, scale - threshold)

  const reserve =
    reserved > 0
      ? Math.min(cells, Math.max(1, Math.round((reserved / scale) * cells)))
      : 0

  const exact = (Math.max(0, fill.tokens) / scale) * cells
  const share = exact - Math.floor(exact)

  let used = Math.min(cells, Math.floor(exact))
  let partial = 0

  if (used < cells) {
    const isCrumb = share < Limits.EMPTY_CELL_SHARE

    if (share >= Limits.FULL_CELL_SHARE) {
      used += 1
    } else if (!isCrumb || (used === 0 && fill.tokens > 0)) {
      partial = 1
    }
  }

  const free = Math.max(0, cells - reserve - used - partial)

  return [
    ...repeated('used', used),
    ...repeated('partial', partial),
    ...repeated('free', free),
    ...repeated('reserve', cells - used - partial - free),
  ]
}

const repeated = (cell: Cell, count: number): Cell[] =>
  Array.from({ length: count }, () => cell)
