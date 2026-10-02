import type { On } from 'claude-code'

import Glyphs from '../../hooks/glyphs'
import Views from '../../hooks/views'
import type { ContextViewFill, ContextViewWindow } from '../../types'

/**
 * Draws the band beneath the plugin with the window and the fill the test
 * gives: the plugin passes while it holds no reading, and this hook hands
 * the view the kit the module would.
 *
 * @param on the test's `on`
 * @param window the window measured against, its reserve and its mode
 * @param fill the context's tokens and percentage
 * @param glyphs the marks to draw the meter with; the pills when left out
 */
export const drawsBand = (
  on: On,
  window: ContextViewWindow,
  fill: ContextViewFill,
  glyphs: Glyphs.GlyphSet = Glyphs.PILL_GLYPHS,
) =>
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)

    return Views.band(
      { ui: { Box, Text }, columns: e.props.bodyColumns, glyphs },
      window,
      fill,
    )
  })
