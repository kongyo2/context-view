# context-view

The context window as a plugin: one row in the band above the prompt,
drawn the way Claude Code draws its own meters. The cells the context
fills come first in `▰`, the window left in dim `▱`, and the reserve
auto-compact keeps at the window's end in dim `▰`; then the percentage
used, the tokens over the window, and the tokens left before auto-compact,
joined by Claude Code's byline separator.

    ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▰▰▰  42% · 84.1k/200k tokens · 82.9k until auto-compact

The row follows the session after every main-thread turn and after every
request of a running turn, so it moves while a long turn works; a
subagent's requests are left out. `/context-view` hides it and shows it
again, at once even while a turn runs, leaving `Context view hidden` or
`Context view shown` in the transcript; the choice holds in later
sessions.

The meter and the percentage are drawn in the blue Claude Code fills its
usage meters with, the tokens and the headroom dim. From six tenths of the
way to the auto-compact threshold they turn to Claude Code's warning
colour, the headroom with them, and within the last 20k tokens before it,
where Claude Code's own line starts saying the context is low, to its
error colour; past the threshold the headroom reads `auto-compact next`.
With auto-compact off the reserve is the small buffer a manual `/compact`
needs, and the headroom counts down to the window's limit instead
(`112.9k before the limit`, then `run /compact to continue`). Every colour
is a theme key (`permission`, `warning`, `error`, and the dim text's), so
the row follows the dark, light, daltonized and ANSI themes; nothing is
bold.

The row starts at the prompt's text column, where the hints under the
prompt start, and keeps clear of the `[-]` the engine draws at the band's
right end. As the band narrows, the meter steps down from 20 cells to 12
and 8, as Claude Code's progress rows narrow their bars, and every word
stays; once even that does not fit, the headroom goes, then the tokens,
the meter widening again each time, and the percentage stays. In Ghostty
the meter is drawn in `█` and `░`, as Claude Code draws its own there.
Nothing is drawn while a survey holds the band, while the row is hidden,
or before the first response of a session, or of the window after a
compaction, has landed.

Counts print as Claude Code prints them (`84.1k`, `200k`, `1m`). The
percentage is the status line's: the last response's input tokens over
the model's window. The threshold and the reserve come from the breakdown
`/context` draws, estimated locally with no request sent; where no
breakdown answers, the 33k Claude Code usually keeps stands in.

`hooks/register.ts` is the module; everything under `hooks/` is its parts,
importing `claude-code` and one another alone. `types/index.d.ts` declares
the values the module keeps in `$.state`, so they survive a hot reload and
each write draws the row again.

## What it hooks

| event | what the hook does |
| --- | --- |
| `session.start` | Registers `/context-view`, reads which marks the terminal draws the meter with, copies the person's choice from the store, and takes the first reading once the session is up. |
| `classic.SessionStart` of `clear`, `resume`, `fork` | Copies the choice again and takes a reading: those reset `$.state`. |
| `session.measure` | After a main-thread turn whose context moved: takes a reading, the fill from the figures the engine pushed. |
| `turn.step` | After each request of the main loop: the input tokens it was answered over are the fill at that moment. |
| `command.run` of `context-view` | Hides or shows the row, keeps the choice in the store, and says which. |
| `ui.render` of `AbovePrompt` | Draws the row; passes while a survey holds the band, while the row is hidden, and before the first reading. |

## What it calls on `$`

`command.register`, `env.get` (`TERM` and `TERM_PROGRAM`, once a load, to
tell Ghostty), `session.usage` (with `breakdown: 'summary'`, estimated
locally; the plain figures where that fails), `state.get`, `state.set`,
`store.get`, `store.set` and `ui.resolve`.

## Try it

```sh
claude --plugin-dir /path/to/context-view
```

The row appears above the prompt once the session's first answer has
landed, and at once in a resumed session. Claude Code 2.1.287 or later.

## Install

This repository is its own marketplace:

```text
/plugin marketplace add kongyo2/context-view
/plugin install context-view@context-view
/reload-plugins
```

## Testing

    claude plugin test .

Each file under `tests/` covers the file of its name under `hooks/`.
`tests/register.test.ts` drives the module through a session's events (the
start, measurements, a running turn's requests, `/context-view`, `/clear`,
a resume, a survey, a failed reading, Ghostty) on the terminal and the
desktop, and `tests/views/band.test.ts` reads the drawn row at each width
and level. `claude plugin validate .` reads this folder as the marketplace
it also is; point it at a copy without `.claude-plugin/marketplace.json`
for the module's own report.
