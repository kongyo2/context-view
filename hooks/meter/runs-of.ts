import type { Cell } from './cell.js'
import type { Run } from './run.js'

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
