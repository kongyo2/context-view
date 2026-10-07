/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement, TextProps, ThemeKey } from 'claude-code'

import Meter from '../meter'
import type { Kit } from './kit.js'

export function bar(
  kit: Kit,
  cells: readonly Meter.Cell[],
  color: ThemeKey,
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

function markOf(cell: Meter.Cell, kit: Kit): string {
  const isTaken = cell === 'used' || cell === 'reserve'

  return isTaken ? kit.glyphs.fill : kit.glyphs.empty
}

function styleOf(cell: Meter.Cell, color: ThemeKey): TextProps {
  const isContext = cell === 'used' || cell === 'partial'

  return isContext ? { color } : { dimColor: true }
}
