import Names from '../names'

/**
 * Whether the band is hidden after `/context-view` with these arguments:
 * `show` or `on` shows it, `hide` or `off` hides it, in any case, and
 * nothing flips it.
 *
 * @param args what followed the command's name, as typed
 * @param isHidden whether the band is hidden now
 * @returns whether it is hidden next, or null for words the command does
 *   not take
 */
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
