import { describe, expect, test, tier } from 'claude-code/testing'

import Glyphs from '../../hooks/glyphs'

tier('user')

describe('glyphs-of', () => {
  test("the pills, Claude Code's own meter marks, wherever it draws them", () => {
    expect(Glyphs.glyphsOf(undefined, undefined)).toEqual({
      fill: '▰',
      empty: '▱',
    })

    expect(Glyphs.glyphsOf('xterm-256color', 'iTerm.app')).toBe(
      Glyphs.PILL_GLYPHS,
    )
  })

  test('the blocks in Ghostty, told by TERM or by TERM_PROGRAM', () => {
    expect(Glyphs.glyphsOf('xterm-ghostty', undefined)).toEqual({
      fill: '█',
      empty: '░',
    })

    expect(Glyphs.glyphsOf('xterm-256color', 'ghostty')).toBe(
      Glyphs.BLOCK_GLYPHS,
    )
  })
})
