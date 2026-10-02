/**
 * When the band reads the window again after a change the engine lands only
 * once the hook that saw it has returned (a compaction, a setting, a model
 * switch): it lands within a tenth of a second, and the later readings
 * cover a busy machine.
 */
export const SETTLE_DELAYS_MS: readonly number[] = [100, 400, 1600]
