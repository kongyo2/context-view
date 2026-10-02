import { describe, expect, test, tier } from 'claude-code/testing'

import Command from '../../hooks/command'

tier('user')

describe('hidden-of', () => {
  test('nothing after the name flips the band', () => {
    expect(Command.hiddenOf('', false)).toBe(true)
    expect(Command.hiddenOf('', true)).toBe(false)
    expect(Command.hiddenOf('   ', true)).toBe(false)
  })

  test('show and on show it, hide and off hide it, whatever it was', () => {
    for (const isHidden of [false, true]) {
      expect(Command.hiddenOf('show', isHidden)).toBe(false)
      expect(Command.hiddenOf('on', isHidden)).toBe(false)
      expect(Command.hiddenOf('hide', isHidden)).toBe(true)
      expect(Command.hiddenOf('off', isHidden)).toBe(true)
    }
  })

  test('in any case, with spaces around', () => {
    expect(Command.hiddenOf(' Hide ', false)).toBe(true)
    expect(Command.hiddenOf('SHOW', true)).toBe(false)
  })

  test('any other word is not taken', () => {
    expect(Command.hiddenOf('toggle', false)).toBeNull()
    expect(Command.hiddenOf('show hide', false)).toBeNull()
  })
})
