/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import type { ContextViewFill, ContextViewWindow } from '../../types'
import Glyphs from '../glyphs'
import Levels from '../levels'
import Limits from '../limits'
import Meter from '../meter'
import { bar } from './bar.jsx'
import { fitOf } from './fit-of.js'
import type { Kit } from './kit.js'
import { segmentsOf } from './segments-of.js'

export function band(
  kit: Kit,
  window: ContextViewWindow,
  fill: ContextViewFill,
  beneath?: RenderElement,
): RenderElement {
  const { Box, Text } = kit.ui
  const color = Levels.LEVEL_COLORS[Levels.levelOf(window, fill)]

  const fit = fitOf(kit.columns - Limits.BAND_INSET, segmentsOf(window, fill))

  const row = (
    <Box paddingLeft={Limits.BAND_INSET}>
      <Text wrap="truncate-end">
        {bar(kit, Meter.meterOf(window, fill, fit.cells), color)}
        {Glyphs.GAP}
        {fit.segments.flatMap((segment, index) => [
          index > 0 && <Text dimColor>{Glyphs.SEPARATOR}</Text>,
          <Text {...(segment.isDim ? { dimColor: true } : { color })}>
            {segment.text}
          </Text>,
        ])}
      </Text>
    </Box>
  )

  if (!beneath) {
    return row
  }

  return (
    <Box flexDirection="column">
      {row}
      {beneath}
    </Box>
  )
}
