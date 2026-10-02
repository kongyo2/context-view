/**
 * How the band speaks: calm while there is room, warning from most of the
 * way to the compaction threshold, error within the last stretch before it.
 */
export type Level = 'calm' | 'warning' | 'error'
