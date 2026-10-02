import type { RenderPropsOf } from 'claude-code'

import { BAND_COLUMNS } from './band-columns.js'
import type { BandTarget } from './band-target.js'

/**
 * The band above the prompt as the engine asks the plugin to draw it: no
 * survey, no turn running, `columns` across.
 *
 * @param columns cells across the band
 * @param props any of the band's props to change
 * @returns the mount target, less its surface
 */
export function bandAt(
  columns = BAND_COLUMNS,
  props: Partial<RenderPropsOf['AbovePrompt']> = {},
): BandTarget {
  return {
    plugin: 'context-view',
    component: 'AbovePrompt',
    props: {
      hasSurvey: false,
      isWorking: false,
      maxRows: 10,
      bodyColumns: columns,
      scroll: { offset: 0, bodyRows: 10 },
      view: {},
      ...props,
    },
  }
}
