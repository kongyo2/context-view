# context-view

Claude Code の mod です。プロンプトのすぐ上の帯（band）に、コンテキストウィンドウの使用状況を 1 行で表示します。`/context` コマンドがグリッドを描くのと同じ記号（⛁ ⛀ ⛶ ⛝）を 1 列に畳んだメーター、使用率、ウィンドウに対するトークン数、そして auto-compact までの残りトークン数を、ターンが終わるたびに、またターンの途中でもモデルへのリクエストごとに更新します。絵文字は使いません。

```text
 ⛁ ⛁ ⛁ ⛁ ⛀ ⛶ ⛶ ⛶ ⛝ ⛝  42%  84.1k/200k tokens · 82.9k until auto-compact
```

| 部分                       | 意味                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `⛁` `⛀`                    | コンテキストが埋めているセル。端数のセルは `⛀`（7 割以上で `⛁`）。`/context` と同じ規則 |
| `⛶`                        | まだ空いている分（dim）                                                                 |
| `⛝`                        | compaction が末尾に確保している予約分（`/context` の Autocompact buffer と同じ色）      |
| `42%`                      | ステータスラインと同じ、ウィンドウに対する使用率                                        |
| `84.1k/200k tokens`        | `/context` の見出しと同じ書式                                                           |
| `82.9k until auto-compact` | auto-compact のしきい値までの残り。しきい値に達すると `auto-compact next`               |

色はテーマキーで指定しているので、dark / light / daltonized のどのテーマにも追従します。余裕があるあいだはメーターと使用率は使用量メーターの青（`permission`）、しきい値の 6 割を越えると `warning`、残り 20k トークン（Claude Code 自身が「Context low」と言い出す線）を切ると `error` になります。帯が狭いときは右から順に部分を落とし、48 桁未満では `/context` の狭いグリッドと同じ 5 セルのメーターになります。

## 使い方

Claude Code 2.1.287 以降が必要です。

リポジトリをそのまま試すには:

```sh
claude --plugin-dir /path/to/context-view
```

インストールするには（このリポジトリ自体が marketplace です）:

```text
/plugin marketplace add kongyo2/context-view
/plugin install context-view@context-view
/reload-plugins
```

`/context-view` で帯を隠したり出したりできます。選択は `$.store` に保存されるので次のセッションにも引き継がれます。

---

A Claude Code mod: a compact context window meter in the band above the prompt. The grid `/context` draws is folded into one row of its own symbols (⛁ ⛀ ⛶ ⛝), followed by the percentage used, the tokens over the window, and the tokens left before auto-compact. It updates after every main-thread turn and, while a turn runs, after every request to the model. No emoji.

```text
 ⛁ ⛁ ⛁ ⛁ ⛀ ⛶ ⛶ ⛶ ⛝ ⛝  42%  84.1k/200k tokens · 82.9k until auto-compact
```

| Part                       | What it is                                                                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `⛁` `⛀`                    | The cells the context fills; the last, part-filled cell is hollow under seven tenths, as `/context` draws its squares                                                 |
| `⛶`                        | The window left, dim                                                                                                                                                  |
| `⛝`                        | The reserve compaction keeps at the window's end, in the colour `/context` draws its Autocompact buffer in                                                            |
| `42%`                      | Tokens over the window, as the status line figures it                                                                                                                 |
| `84.1k/200k tokens`        | As `/context`'s heading prints it                                                                                                                                     |
| `82.9k until auto-compact` | The tokens left before the auto-compact threshold; `auto-compact next` once it is reached. With auto-compact off: `before the limit`, then `run /compact to continue` |

Colours are theme keys, so the band follows the dark, light and daltonized themes: the blue Claude Code's usage meters fill with (`permission`) while there is room, `warning` from six tenths of the threshold, `error` within the last 20k tokens, where Claude Code's own line under the prompt says the context is low. A narrower band drops its parts from the right, and under 48 columns the meter takes the five cells of `/context`'s narrow grid.

## Install

Claude Code 2.1.287 or later.

To try it from the repository:

```sh
claude --plugin-dir /path/to/context-view
```

To install it, this repository is its own marketplace:

```text
/plugin marketplace add kongyo2/context-view
/plugin install context-view@context-view
/reload-plugins
```

`/context-view` hides and shows the band. The choice is kept in the plugin's store, so it holds in the next session too.

## How it works

`hooks/register.ts` is the hooks module; the files beside it are its parts. The window, its fill and the hidden flag live in `$.state`, declared in `types/index.d.ts`, so they survive a hot reload and every write redraws the band.

| event                                               | what the hook does                                                                                                                                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session.start`                                     | Registers `/context-view`, copies the hidden choice from the store, and takes the first reading once the session is up.                                                                                                         |
| `classic.SessionStart` of `clear`, `resume`, `fork` | Copies the hidden choice again and takes a reading, since those reset `$.state`.                                                                                                                                                |
| `session.measure`                                   | After each main-thread turn whose context moved: reads the window's compaction threshold from `$.session.usage({ breakdown: 'summary' })` (estimated locally, no request sent) and the fill from the figures the engine pushed. |
| `turn.step`                                         | After each request of the main loop's turn: the input tokens it was answered over are the fill at that moment, so the band moves while a long turn runs. A subagent's requests are left alone.                                  |
| `command.run` of `context-view`                     | Flips the hidden flag, saves it, and says which.                                                                                                                                                                                |
| `ui.render` of `AbovePrompt`                        | Draws the band, or passes while a survey holds the band, the band is hidden, or no response has landed yet.                                                                                                                     |

What it calls on `$`: `command.register`, `session.usage`, `state.get`, `state.set`, `store.get`, `store.set`, `ui.resolve`.

## Develop

```sh
claude plugin validate .   # what the engine reads from the module
claude plugin test .       # the tests, against the real runtime
```

Each time Claude Code loads the mod from this folder it writes the API's declarations for your build into `.claude-plugin/types/` (ignored by git); after that, `tsc -p .` type-checks the hooks and the tests against them.

`claude plugin validate .` reads the marketplace manifest, since this folder is also a marketplace. To see the hooks module's own report, point the command at a copy without `.claude-plugin/marketplace.json`.

## Design notes

The meter is the one memorable element, and it is borrowed rather than invented: the squares, the hollow partial cell, the dim free cells and the crossed reserve cells are `/context`'s own, so the band reads as a miniature of that command. Everything else stays quiet: one weight hierarchy (the percentage bold in the state's colour, the figures dim), the product's own phrasing (`k/200k tokens`, `until auto-compact`), the product's own thresholds, and its own separator. Each symbol is drawn with a space after it, as `/context` does, so terminals that draw these symbols two cells wide (common under CJK locales) still lay the row out.
