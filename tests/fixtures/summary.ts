import type { SessionMessage } from 'claude-code'

export const SUMMARY: SessionMessage = {
  role: 'user',
  text: 'Summary: the hooks were read and the band was drawn.',
  toolUses: [],
}
