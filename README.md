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
subagent's requests are left out. It reads the window again whenever the
window itself moves: after `/clear`, a resume or a branch, a compaction
(`/compact`, auto-compact, or a plugin's), a model switch (`/model`, the
picker, a fallback), and a change to auto-compact (`/autocompact`, or the
`/config` toggle). The engine can land those after the hook that sees them
has returned, so the row reads them a tenth of a second later, and twice
more after that for a busy machine. Every two seconds it also compares the
engine's live figures with its reading, without asking for a breakdown, so
a change no event announces, such as a rewound conversation, shows within
two seconds.

A request in which Claude consulted the advisor is read differently. The
API runs the advisor inside that one request, the main model reading the
conversation once before the advice and again after it, and reports the
request's usage summed over those passes, so its count is about twice the
window's. For such a request the row takes the engine's own figure, the
last pass, as the status line and `/context` count it, and reads it again
a tenth of a second later and twice more, in case the engine lands it
late; it never shows the summed count, not even for a moment.

Until a response of the window has landed (a new session, and the window
after `/clear` or a compaction), the row shows the engine's local
estimate, the total `/context` shows, each figure marked with `~` as
Claude Code marks an approximation:

    ▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▰  ~3% · ~33.4k/1m tokens · ~933.6k until auto-compact

`/context-view` hides the row and shows it again, at once even while a
turn runs, leaving `Context view hidden` or `Context view shown` in the
transcript. `/context-view hide` and `/context-view show` (or `off` and
`on`) set it whatever it was, and any other word is answered with
`Usage: /context-view [show|hide]`. The choice holds in later sessions.

The meter and the percentage are drawn in the blue Claude Code fills its
usage meters with, the tokens and the headroom dim. From six tenths of the
way to the auto-compact threshold they turn to Claude Code's warning
colour, the headroom with them, and within the last 20k tokens before it,
where Claude Code's own line under the prompt appears, to its error
colour; past the threshold the headroom reads `auto-compact next`. The
headroom counts the last reply too, which the next request carries, as
Claude Code counts it toward its threshold. Every colour is a theme key
(`permission`, `warning`, `error`, and the dim text's), so the row follows
the dark, light, daltonized and ANSI themes; nothing is bold.

The reserve is the one `/context` draws. Where Claude Code compacts only
once the API refuses a full window, as it runs a 200k model with no
compaction window set, `/context` keeps none and neither does the row: the
headroom counts down to the window's end.

    ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱  80% · 160k/200k tokens · 40k until auto-compact

With auto-compact off, the reserve is the room Claude Code keeps for a
reply and for a manual `/compact`, and the headroom counts down to where it
stops sending requests (`92.9k before the limit`), then asks for
`run /compact to continue` as Claude Code's own line does.

The meter spans the model's whole window, as the percentage and the tokens
do. Where a setting caps the window compaction measures against below the
model's (`/autocompact 150000`, or `autoCompactWindow`), everything past
the threshold is reserve, so the meter shows how little of a large window
is left before auto-compact runs:

    ▱▱▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰  ~3% · ~33.9k/1m tokens · ~83.1k until auto-compact

The row starts at the prompt's text column, where the hints under the
prompt start, and runs to the end of the columns Claude Code gives the
band, which leave out the `[-]` it draws at the band's right end. As the
band narrows, the meter steps down from 20 cells to 12 and 8, as Claude
Code's progress rows narrow their bars, and every word stays; once even
that does not fit, the headroom goes, then the tokens, the meter widening
again each time, and the percentage stays. In Ghostty the meter is drawn
in `█` and `░`, as Claude Code draws its own there. Nothing is drawn while
a survey holds the band, while the row is hidden, or while the engine has
neither a figure nor an estimate. Every mod shares the band, so what the
mods after this one draw there, Claude Code's own notes among them, stays
below the row.

Counts print as Claude Code prints them (`84.1k`, `200k`, `1m`). The
percentage is the status line's: the last response's input tokens over
the model's window. Claude Code's own `context used` line, which it shows
instead of a countdown where compaction waits for the API, counts against
the window less the room it keeps for a reply, so it reads higher
(`89% context used` where the row reads 80%). The threshold and the
reserve come from the breakdown `/context` draws, estimated locally with
no request sent; where no breakdown answers, the 33k Claude Code usually
keeps stands in. A reading the engine cannot give, a command it will not
register, and a choice it cannot save go to the debug log (`claude
--debug`) under the plugin's name, and the row keeps its last reading. A
choice the store cannot read back leaves the row as it was. A change to
`autoCompactEnabled` made by editing a settings file, rather than in
`/config`, shows after the next turn.

Where Claude Code's built-in guard runs, with managed settings or a Team
or Enterprise plan, the settings-hook events (`classic.*`) don't reach a
mod a person installs. The row also follows `/clear`, `/resume`, `/branch`
and `/model` through the commands themselves, and the check every two
seconds covers the rest.

`hooks/register.ts` is the module; everything under `hooks/` is its parts,
importing `claude-code` and one another alone. `types/index.d.ts` declares
the values the module keeps in `$.state`, so they survive a hot reload and
each write draws the row again.

## What it changes

Nothing but the band. Apart from drawing the row and answering its own
`/context-view`, every hook passes its event on and hands back what
Claude Code, and any settings hook or mod after it, answered, unchanged:
no prompt, tool call, permission, setting, command, compaction or first
message of a session is rewritten, answered, refused or added to. The
hooks listed below that sit on a settings-hook event, or on an event that
is also the name of a call on `$`, say so, and what each does there.

## What it hooks

| event | what the hook does |
| --- | --- |
| `session.start` | Registers `/context-view`; once the session is up, reads which marks the terminal draws the meter with, copies the person's choice from the store, takes the first reading, and starts the check of the engine's live figures every two seconds. Hands back the start's own answer. |
| `classic.SessionStart` of `clear`, `resume`, `fork` | Copies the choice again and takes a reading, as those reset `$.state`, and reads again once a resumed session has been swapped in. A settings-hook event, and the hook changes nothing in it: it passes the event on with `return next(e)`, so the SessionStart hooks in your settings run as they would without the mod, and what they answer (context for Claude, a session title, the session's first message, paths to watch) reaches the session as they wrote it. |
| `classic.PostModelSwitch` | Reads the new model's window once the engine has moved to it. A settings-hook event, and the hook changes nothing in it: it passes the event on with `return next(e)`, so the PostModelSwitch hooks in your settings run, and the context they add reaches Claude, as without the mod. |
| `session.measure` | After a main-thread turn whose context moved: takes a reading, the fill from the figures the engine pushed. |
| `turn.step` | After each request of the main loop: the input tokens it was answered over are the fill at that moment; for a request in which the API ran a tool of its own (the advisor), whose usage is the loop's sum, the engine's own figure instead. The response streams through as it came and is handed back unchanged. |
| `session.compact` of `manual`, `auto`, `plugin` | After a compaction of the main window that stands (not one computed ahead of time, a subagent's, or one vetoed): reads the window once the engine has landed it. The event is also the call `$.session.compact`, so the hook sees a compaction whoever asks for it, `/compact`, auto-compact or another plugin; it never skips, rewrites or answers one, and hands back what Claude Code answered. |
| `config.set` of `autoCompact` | Reads the window once `/config` has turned auto-compact on or off. The event is also the call `$.config.set`, so the hook sees that one row change whoever makes it; it passes the change on with `return next(e)` and hands back what Claude Code answered, a refusal included. |
| `command.run` of `clear`, `resume`, `branch` | Passes the command on, then copies the choice again and reads the window, as the `classic.SessionStart` hook does where the guard holds that event back. The event is also the call `$.command.run`, so the hook sees these three commands whoever runs them, you or another plugin; it never answers or rewrites one, and hands back Claude Code's own result. |
| `command.run` of `autocompact`, `model` | Passes the command on, then reads the window it set. As above, it sees these commands whoever runs them, never answers or rewrites one, and hands back Claude Code's own result. |
| `command.run` of `context-view` | Answers the plugin's own command: hides or shows the row as asked, keeps the choice in the store, and says which. |
| `ui.render` of `AbovePrompt` | Draws the row above what the mods after it draw; passes while a survey holds the band, while the row is hidden, and while there is nothing to draw. |

## What it calls on `$`

`clock.after` (the readings after a change the engine lands late),
`clock.every` (the check of the live figures), `command.register`,
`env.get` (`TERM` and `TERM_PROGRAM`, once a load, to tell Ghostty),
`session.usage` (with `breakdown: 'summary'`, estimated locally; the plain
figures where that fails), `state.get`, `state.set`, `store.get`,
`store.set`, `ui.log` (to the debug log alone) and `ui.resolve`.

## What it reads and sends

It reads the session's own context figures through `$.session.usage`, the
`TERM` and `TERM_PROGRAM` environment variables, and the one choice it
keeps in its store; it writes that choice to its store and its failures to
the debug log. It reads no file, starts no process, calls no model and
makes no network request, so nothing it reads leaves the machine.

## Try it

```sh
claude --plugin-dir /path/to/context-view
```

The row appears above the prompt as soon as the session is up: the
estimate in a new session, the restored figure in a resumed one. Claude
Code 2.1.290 or later; tested on 2.1.292.

## Install

This repository is its own marketplace. In a Claude Code session:

```text
/plugin install context-view --marketplace kongyo2/context-view
```

Answer `y` to add the marketplace, then pick a scope. Or in three steps:

```text
/plugin marketplace add kongyo2/context-view
/plugin install context-view@context-view
/reload-plugins
```

## Testing

    claude plugin test .

Each file under `tests/` covers the file of its name under `hooks/`.
`tests/register.test.ts` drives the module through a session's events (the
start, the estimate before the first response, measurements, a running
turn's requests and their replies, a request that consulted the advisor
and one whose figure lands late, `/clear`, a resume, a branch, compactions
of each kind, a model switch, `/config` and `/autocompact`, a rewind, a
reading that resolves late, `/context-view` and its words, a survey,
another mod's note, the built-in guard, what each hook hands back, failed
readings, refused calls, Ghostty) on the terminal and the desktop, and
`tests/views/band.test.ts` reads the drawn row at each width and level, as
an estimate, and over a capped window.

    claude plugin validate --strict .claude-plugin/plugin.json

reports what the module hooks and calls; `claude plugin validate .` reads
this folder as the marketplace it also is.
