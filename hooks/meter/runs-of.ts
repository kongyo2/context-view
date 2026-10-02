import type { Cell } from './cell.js'
import type { Run } from './run.js'

/**
 * The meter's cells grouped into runs of one kind, so each stretch draws as
 * one Text.
 *
 * @param cells the meter's cells, left to right
 * @returns the runs, left to right
 */
export function runsOf(cells: readonly Cell[]): Run[] {
  const runs: Run[] = []

  for (const cell of cells) {
    const last = runs.at(-1)

    if (last?.cell === cell) {
      last.count += 1
    } else {
      runs.push({ cell, count: 1 })
    }
  }

  return runs
}
