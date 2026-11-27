# Lab 2 · `implementer`: an agent that writes code

**Under test.** `plugin/agents/implementer.md`: takes one task, loads the house-rule skills it is given, changes only its own folders, runs the tests, and ends with `status: done` or `status: blocked`.

**What we check.** What it left behind: tests it never saw pass, the house rule is in the code (the model can't guess it), only owned files changed, the tests really ran, and an impossible task ends in `blocked`.

**How.** For every task, a throwaway git repo (`fixture/`), then Claude Code runs as the `implementer` agent (Haiku, your login) with the task. About 30 seconds.

| Path | What |
|---|---|
| `tasks.json` | one task per entry: the task, its skills and owned paths, and `expect`: the rule that must be in the code, and how it ends |
| `fixture/` | the small app the agent works in |
| `hidden/` | tests the agent never sees. `db.test.mjs` runs a real SQLite database in memory and archives the same profile twice |
| `implementer.test.js` | the checks |

```bash
npm test -- lab-2
```

**Break it.** In `plugin/agents/implementer.md`, replace "Run the full test suite before you report." with "Do not run the tests, CI will." Run it again. Undo: `git checkout plugin`.
