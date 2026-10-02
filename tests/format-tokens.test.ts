import { describe, expect, test } from 'claude-code/testing'

import { formatTokens } from '../hooks/format-tokens'

describe('format-tokens', () => {
  test('under a thousand, the count itself', () => {
    expect(formatTokens(0)).toBe('0')
    expect(formatTokens(950)).toBe('950')
    expect(formatTokens(999)).toBe('999')
  })

  test('thousands to one decimal, a trailing .0 dropped', () => {
    expect(formatTokens(1_000)).toBe('1k')
    expect(formatTokens(1_049)).toBe('1k')
    expect(formatTokens(84_100)).toBe('84.1k')
    expect(formatTokens(134_400)).toBe('134.4k')
    expect(formatTokens(200_000)).toBe('200k')
    expect(formatTokens(999_949)).toBe('999.9k')
  })

  test('millions the same way', () => {
    expect(formatTokens(999_950)).toBe('1M')
    expect(formatTokens(1_000_000)).toBe('1M')
    expect(formatTokens(1_250_000)).toBe('1.3M')
  })

  test('a count below zero reads as none', () => {
    expect(formatTokens(-5)).toBe('0')
  })
})
