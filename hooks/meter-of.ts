import type { ContextViewFill, ContextViewWindow } from '../types'
import type { CellKind } from './glyphs'
import { EMPTY_CELL_SHARE, FULL_CELL_SHARE } from './limits'

/**
 * The meter's cells, left to right: the context's full squares, a hollow one
 * for the cell it part fills, the window left, and the compaction reserve
 * at the end, as /context lays its grid out. A context past the threshold
 * fills the reserve's cells too.
 *
 * @param window the window measured against and its reserve
 * @param fill the context's tokens
 * @param cells how many cells across
 * @returns one kind per cell
 */
export function meterOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
  cells: number,
): CellKind[] {
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
    if (share >= FULL_CELL_SHARE) {
      used += 1
    } else if (share >= EMPTY_CELL_SHARE || (used === 0 && fill.tokens > 0)) {
      partial = 1
    }
  }

  const free = Math.max(0, cells - reserve - used - partial)
  const buffer = cells - used - partial - free

  return [
    ...repeated('used', used),
    ...repeated('partial', partial),
    ...repeated('free', free),
    ...repeated('buffer', buffer),
  ]
}

const repeated = (kind: CellKind, count: number): CellKind[] =>
  Array.from({ length: count }, () => kind)
