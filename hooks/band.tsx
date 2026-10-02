import type { ElementTable, RenderElement, TextProps } from 'claude-code'

import type { ContextViewFill, ContextViewWindow } from '../types'
import { formatTokens } from './format-tokens'
import { GLYPHS } from './glyphs'
import type { CellKind } from './glyphs'
import {
  BAND_PADDING,
  METER_CELLS,
  NARROW_COLUMNS,
  NARROW_METER_CELLS,
} from './limits'
import { meterOf } from './meter-of'
import {
  BEFORE_LIMIT_TEXT,
  COMPACT_NEXT_TEXT,
  RUN_COMPACT_TEXT,
  TOKENS_TEXT,
  UNTIL_COMPACT_TEXT,
} from './names'
import { headroomOf, stateOf } from './state-of'
import type { BandState } from './state-of'

/**
 * What the band is drawn with: the surface's Box and Text, and the cells
 * across the band (`props.bodyColumns`).
 */
export type Kit = {
  ui: Pick<ElementTable, 'Box' | 'Text'>
  columns: number
}

/**
 * The theme key each state draws the meter and the percentage in: the blue
 * Claude Code's usage meters fill with while there is room, then its
 * warning and error colours.
 */
export const STATE_COLORS: Record<BandState, string> = {
  calm: 'permission',
  warning: 'warning',
  error: 'error',
}

/**
 * The theme key the compaction reserve's cells draw in, as /context draws
 * its buffer squares.
 */
export const BUFFER_COLOR = 'inactive'

/**
 * A run of like cells of the meter, drawn as one Text.
 */
type Run = {
  kind: CellKind
  text: string
}

/**
 * The band: one row, the meter first, then the percentage in the state's
 * colour, then the tokens over the window and the headroom before
 * auto-compact, each dropped from the right as the band narrows.
 *
 * @param kit the elements and the width
 * @param window the window measured against and its reserve
 * @param fill the context's tokens and percentage
 * @returns the row
 */
export function band(
  kit: Kit,
  window: ContextViewWindow,
  fill: ContextViewFill,
): RenderElement {
  const { Box, Text } = kit.ui

  const cells = kit.columns < NARROW_COLUMNS ? NARROW_METER_CELLS : METER_CELLS
  const state = stateOf(window, fill)
  const color = STATE_COLORS[state]
  const runs = runsOf(meterOf(window, fill, cells))

  const percent = ` ${fill.percent}%`

  const tokens =
    `  ${formatTokens(fill.tokens)}/${formatTokens(window.window)}` +
    ` ${TOKENS_TEXT}`

  const headroom = ` · ${headroomTextOf(window, fill)}`

  const room = kit.columns - BAND_PADDING * 2
  const meterWidth = cells * 2
  const figuresWidth = meterWidth + percent.length + tokens.length

  const hasTokens = figuresWidth <= room
  const hasHeadroom = hasTokens && figuresWidth + headroom.length <= room

  const headroomStyle: TextProps =
    state === 'calm' ? { dimColor: true } : { color }

  return (
    <Box flexDirection="row" paddingX={BAND_PADDING}>
      <Box key="meter" flexDirection="row">
        {runs.map(run => (
          <Text {...styleOf(run.kind, color)}>{run.text}</Text>
        ))}
      </Box>
      <Text bold color={color}>
        {percent}
      </Text>
      {hasTokens && (
        <Text dimColor wrap="truncate-end">
          {tokens}
        </Text>
      )}
      {hasHeadroom && (
        <Text {...headroomStyle} wrap="truncate-end">
          {headroom}
        </Text>
      )}
    </Box>
  )
}

/**
 * The words after the separator: the tokens left before auto-compact, or
 * that it runs before the next request once none are; where auto-compact
 * is off, the tokens left before the limit, or the ask to run /compact.
 *
 * @param window the window measured against, its reserve and its mode
 * @param fill the context's tokens
 * @returns the text
 */
export function headroomTextOf(
  window: ContextViewWindow,
  fill: ContextViewFill,
): string {
  const left = headroomOf(window, fill)

  if (window.isAutoCompact) {
    return left > 0
      ? `${formatTokens(left)} ${UNTIL_COMPACT_TEXT}`
      : COMPACT_NEXT_TEXT
  }

  return left > 0
    ? `${formatTokens(left)} ${BEFORE_LIMIT_TEXT}`
    : RUN_COMPACT_TEXT
}

/**
 * The meter's cells grouped into runs of one kind, each run's text its
 * squares with a space after each, as /context draws them.
 *
 * @param cells the meter's cells, left to right
 * @returns the runs
 */
export function runsOf(cells: readonly CellKind[]): Run[] {
  const runs: Run[] = []

  for (const kind of cells) {
    const last = runs[runs.length - 1]
    const glyph = `${GLYPHS[kind]} `

    if (last && last.kind === kind) {
      last.text += glyph
    } else {
      runs.push({ kind, text: glyph })
    }
  }

  return runs
}

/**
 * How a run draws: the context's cells in the state's colour, the window
 * left dim, the reserve in the colour /context draws its buffer in.
 *
 * @param kind the run's cells
 * @param color the state's theme key
 * @returns the Text props
 */
function styleOf(kind: CellKind, color: string): TextProps {
  switch (kind) {
    case 'free':
      return { dimColor: true }
    case 'buffer':
      return { color: BUFFER_COLOR }
    default:
      return { color }
  }
}
