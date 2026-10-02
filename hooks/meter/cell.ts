/**
 * What one cell of the meter stands for: a cell the context fills whole,
 * the one it part fills, the window left, and the reserve compaction keeps
 * at the window's end.
 */
export type Cell = 'used' | 'partial' | 'free' | 'reserve'
