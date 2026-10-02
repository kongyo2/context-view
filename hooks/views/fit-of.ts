import Glyphs from '../glyphs'
import Limits from '../limits'
import type { Fit } from './fit.js'
import type { Segment } from './segment.js'

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

function widthOf(fit: Fit): number {
  const text = fit.segments.map(segment => segment.text).join(Glyphs.SEPARATOR)

  return fit.cells + Glyphs.GAP.length + text.length
}
