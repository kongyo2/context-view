export type ContextViewWindow = {
  window: number
  limit: number
  buffer: number
  isAutoCompact: boolean
}

export type ContextViewFill = {
  tokens: number
  percent: number
  isEstimate: boolean
  output?: number
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
