# Lab 2 · `implementer`: an agent that writes code

**What it is.** `plugin/agents/implementer.md` takes one task, loads the house-rule skills it is given, changes only its own folders, runs the tests, and ends with `status: done` or `status: blocked`.

**What we test.** What it left behind: hidden tests pass, the house rule is in the code (the model can't guess it), only owned files changed, the tests really ran, and an impossible task ends in `blocked`.

**Grader: code.** The files go into a throwaway git repo. Hidden tests run on them.

| File | What |
|---|---|
| `tasks.json` | 4 tasks, one impossible: the input |
| `expected.json` | what must be true for each. **`db` is yours: read `db-rules`.** |
| `hidden/` | tests the agent never saw |
| `runs/` | the files and commands the agent left (synthetic) |
| `break.diff` | "do not run the tests, CI will" |

```bash
npm run show -- lab-2
npm test -- lab-2           # 1 todo: db in expected.json
npm run break -- lab-2      # tests never ran, a hidden test fails
```
