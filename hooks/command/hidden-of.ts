import Names from '../names'

export function hiddenOf(args: string, isHidden: boolean): boolean | null {
  const word = args.trim().toLowerCase()

  if (word === '') {
    return !isHidden
  }

  if (Names.SHOW_WORDS.includes(word)) {
    return false
  }

  if (Names.HIDE_WORDS.includes(word)) {
    return true
  }

  return null
}
