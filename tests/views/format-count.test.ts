import { describe, expect, test, tier } from 'claude-code/testing'

import Views from '../../hooks/views'

tier('user')

describe('format-count', () => {
  test('under a thousand, the count itself', () => {
    expect(Views.formatCount(0)).toBe('0')
    expect(Views.formatCount(950)).toBe('950')
    expect(Views.formatCount(999)).toBe('999')
  })

  test('thousands to one decimal, lower case, a trailing .0 dropped', () => {
    expect(Views.formatCount(1_000)).toBe('1k')
    expect(Views.formatCount(1_049)).toBe('1k')
    expect(Views.formatCount(1_050)).toBe('1.1k')
    expect(Views.formatCount(9_950)).toBe('10k')
    expect(Views.formatCount(84_100)).toBe('84.1k')
    expect(Views.formatCount(99_950)).toBe('100k')
    expect(Views.formatCount(134_400)).toBe('134.4k')
    expect(Views.formatCount(200_000)).toBe('200k')
    expect(Views.formatCount(999_949)).toBe('999.9k')
  })

  test('millions the same way, rounding up into them as Claude Code does', () => {
    expect(Views.formatCount(999_950)).toBe('1m')
    expect(Views.formatCount(1_000_000)).toBe('1m')
    expect(Views.formatCount(1_049_999)).toBe('1m')
    expect(Views.formatCount(1_050_000)).toBe('1.1m')
    expect(Views.formatCount(1_250_000)).toBe('1.3m')
    expect(Views.formatCount(2_000_000)).toBe('2m')
  })

  test('a count below zero reads as none', () => {
    expect(Views.formatCount(-5)).toBe('0')
  })
})
