/**
 * The context window as the band measures it: the model's window, the
 * window compaction measures against (the same, or smaller where a setting
 * caps it), the tokens compaction keeps in reserve at its end, and whether
 * compaction runs by itself at that line.
 */
export type ContextViewWindow = {
  window: number
  limit: number
  buffer: number
  isAutoCompact: boolean
}

/**
 * How full the window is: the input tokens the last response was answered
 * over, that count over the window as a whole percentage, and whether it is
 * the engine's local estimate, standing in until a response has landed.
 */
export type ContextViewFill = {
  tokens: number
  percent: number
  isEstimate: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'context-view': {
      window: ContextViewWindow | null
      fill: ContextViewFill | null
      isHidden: boolean
    }
  }
}
