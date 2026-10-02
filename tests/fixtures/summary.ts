import type { SessionMessage } from 'claude-code'

/**
 * The one message a compaction leaves: the summary of what came before.
 */
export const SUMMARY: SessionMessage = {
  role: 'user',
  text: 'Summary: the hooks were read and the band was drawn.',
  toolUses: [],
}
