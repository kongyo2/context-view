import type { Plugin } from 'claude-code/testing'

export const NOTE_MOD: Plugin = {
  name: 'notes',
  tier: 'builtin',
  register: on => {
    on('ui.render', { component: 'AbovePrompt' }, () => ({
      type: 'Text',
      props: {},
      children: ['Tip: /context shows what fills the window'],
    }))
  },
}
