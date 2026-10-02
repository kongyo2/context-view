import type { Cell } from './cell.js'

/**
 * Cells of one kind side by side, drawn as one stretch of the meter.
 */
export type Run = {
  cell: Cell
  count: number
}
