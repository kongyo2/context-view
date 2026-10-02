import type { Plugin } from 'claude-code/testing'

export const GUARD: Plugin = {
  name: 'guard',
  tier: 'prepend',
  register: on => {
    on('classic.*', ($, e, next) => next.to(e, 'append'))
  },
}
