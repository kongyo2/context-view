import type { ToolCallInput } from 'claude-code'

export const TOOL_USE: ToolCallInput = {
  tool: 'Bash',
  tool_use_id: 'toolu_1',
  command: 'ls',
}
