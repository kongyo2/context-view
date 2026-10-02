import type { MountTarget } from 'claude-code/testing'

export type BandTarget = Omit<
  MountTarget<'terminal' | 'desktop', 'AbovePrompt'>,
  'surface'
>
