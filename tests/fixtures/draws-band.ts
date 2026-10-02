import type { On } from 'claude-code'

import Glyphs from '../../hooks/glyphs'
import Views from '../../hooks/views'
import type { ContextViewFill, ContextViewWindow } from '../../types'

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
