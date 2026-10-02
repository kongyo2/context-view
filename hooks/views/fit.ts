import type { Segment } from './segment.js'

/**
 * What the band draws in the room it has: the meter's width in cells and the
 * segments of text that follow it.
 */
export type Fit = {
  cells: number
  segments: readonly Segment[]
}
