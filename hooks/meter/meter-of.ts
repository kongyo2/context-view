import type { ContextViewFill, ContextViewWindow } from '../../types'
import Limits from '../limits'
import type { Cell } from './cell.js'

/**
 * The meter's cells, left to right, as /context lays its grid out: the
 * context's whole cells, the one it part fills, the window left, and the
 * compaction reserve at the end. A context past the threshold fills the
 * reserve's cells too.
 *
 * @param window the window measured against and its reserve
 * @param fill the context's tokens
 * @param cells how many cells across
 * @returns one cell kind per cell
 */
export function meterOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
  cells: number,
): Cell[] {
  const limit = Math.max(1, window.limit)

  const reserve =
    window.buffer > 0
      ? Math.min(
          cells,
          Math.max(1, Math.round((window.buffer / limit) * cells)),
        )
      : 0

  const exact = (Math.max(0, fill.tokens) / limit) * cells
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
