import type { MountTarget } from 'claude-code/testing'

/**
 * What a test mounts the band with, the surface left for the test to name.
 */
export type BandTarget = Omit<
  MountTarget<'terminal' | 'desktop', 'AbovePrompt'>,
  'surface'
>
