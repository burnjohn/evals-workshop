# Lab 3 · workflow: many agents, one plan

**What it is.** `plugin/skills/run-plan` starts one `implementer` per task in `plan.md`, then `code-review`, `test-writer`, `qa` and `make-release`, one at a time.

**What we test.** Orchestration: one implementer per task, the right model, exactly the right skills, the order of tasks and stages. Not what each agent said.

**Grader: code, on the trace** Claude Code already writes (`--output-format stream-json`).

| File | What |
|---|---|
| `plan.md`, `spec.md` | the approved plan: the input, and most of the answer key |
| `expected.json` | the plan as data. **T3 and the stages are yours.** |
| `runs/` | the trace, saved (synthetic, in the real format) |
| `break.diff` | "skip QA when tests pass" |

```bash
npm run show -- lab-3
npm test -- lab-3           # 2 todo
npm run break -- lab-3      # qa is missing
```
