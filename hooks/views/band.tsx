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

/**
 * The band: one line from the prompt's text column, the meter, then its
 * text joined by Claude Code's byline separator, all as one Text cut at the
 * end, so it never takes a second row; its right end is left to the
 * engine's `[-]`.
 *
 * @param kit the elements, the width and the marks
 * @param window the window measured against, its reserve and its mode
 * @param fill the context's tokens and percentage
 * @returns the band
 */
export function band(
  kit: Kit,
  window: ContextViewWindow,
  fill: ContextViewFill,
): RenderElement {
  const { Box, Text } = kit.ui
  const color = Levels.LEVEL_COLORS[Levels.levelOf(window, fill)]

  const fit = fitOf(
    kit.columns - Limits.BAND_INSET - Limits.COLLAPSE_RESERVE,
    segmentsOf(window, fill),
  )

  return (
    <Box paddingLeft={Limits.BAND_INSET} paddingRight={Limits.COLLAPSE_RESERVE}>
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
}
