import Glyphs from '../glyphs'
import Limits from '../limits'
import type { Fit } from './fit.js'
import type { Segment } from './segment.js'

/**
 * The most text, then the widest meter, that fit in the room.
 *
 * Every segment first, the meter at 20, 12 or 8 cells, the steps Claude
 * Code's progress rows narrow their bars by; then one segment fewer from
 * the right, the meter widest again. The percentage beside the narrowest
 * meter is the last resort, cut by the row where even that overflows.
 *
 * @param room cells across, inside the band's insets
 * @param segments the text, most important first
 * @returns the meter's width and the segments kept
 */
export function fitOf(room: number, segments: readonly Segment[]): Fit {
  for (let count = segments.length; count > 0; count -= 1) {
    const kept = segments.slice(0, count)

    for (const cells of Limits.BAR_CELLS) {
      const fit = { cells, segments: kept }

      if (widthOf(fit) <= room) {
        return fit
      }
    }
  }

  return {
    cells: Math.min(...Limits.BAR_CELLS),
    segments: segments.slice(0, 1),
  }
}

/**
 * Cells across a fit: the meter, the gap after it, and its segments with a
 * separator between each two.
 *
 * @param fit the meter's width and the segments
 * @returns the cells
 */
function widthOf(fit: Fit): number {
  const text = fit.segments.map(segment => segment.text).join(Glyphs.SEPARATOR)

  return fit.cells + Glyphs.GAP.length + text.length
}
