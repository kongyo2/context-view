/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement, TextProps } from 'claude-code'

import Meter from '../meter'
import type { Kit } from './kit.js'

/**
 * The meter, one Text of runs: the cells the context fills whole and the one
 * it part fills hollow, both in the level's colour; the window left hollow
 * and dim; and the reserve filled and dim at the end, the colour /context
 * draws its buffer squares in.
 *
 * @param kit the elements and the marks
 * @param cells the meter's cells, left to right
 * @param color the level's theme key
 * @returns the meter
 */
export function bar(
  kit: Kit,
  cells: readonly Meter.Cell[],
  color: string,
): RenderElement {
  const { Text } = kit.ui

  return (
    <Text>
      {Meter.runsOf(cells).map(run => (
        <Text {...styleOf(run.cell, color)}>
          {markOf(run.cell, kit).repeat(run.count)}
        </Text>
      ))}
    </Text>
  )
}

/**
 * A cell's mark: filled where the window is taken, by the context or by the
 * reserve, hollow where it is not, or not yet whole.
 *
 * @param cell what the cell stands for
 * @param kit the marks the surface draws with
 * @returns the mark
 */
function markOf(cell: Meter.Cell, kit: Kit): string {
  const isTaken = cell === 'used' || cell === 'reserve'

  return isTaken ? kit.glyphs.fill : kit.glyphs.empty
}

/**
 * A cell's style: the level's colour where the context is, dim elsewhere.
 *
 * @param cell what the cell stands for
 * @param color the level's theme key
 * @returns the Text props
 */
function styleOf(cell: Meter.Cell, color: string): TextProps {
  const isContext = cell === 'used' || cell === 'partial'

  return isContext ? { color } : { dimColor: true }
}
