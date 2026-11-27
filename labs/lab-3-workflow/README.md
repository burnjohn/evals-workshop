# Lab 3 · `run-plan`: many agents, one plan

**Under test.** `plugin/skills/run-plan`: starts one `implementer` per task in `plan.md`, then `code-review`, `test-writer`, `qa` and `make-release`, one at a time.

**What we check.** Orchestration, from the trace Claude Code writes: one implementer per task, the model and the exact skills from the plan, the order of tasks and stages. Not what each agent said.

**How.** A throwaway repo (`fixture/`, with `plan.md` and `spec.md`), then Claude Code (Haiku, your login) is asked: "Run the plan in plan.md." About 2 minutes.

| File | What |
|---|---|
| `plan.md`, `spec.md` | the approved plan: the input |
| `expected.json` | the plan as data: the answer key |
| `fixture/` | the app the plan runs in |
| `policy.json`, `policy.test.js` | Demo 4: a docs-only change and a docs-and-code change, and what each may do with `qa` |
| `workflow.test.js` | the checks on the plan run |

```bash
npm test -- lab-3
```

**Break it.** In `plugin/skills/run-plan/SKILL.md`, step 3: drop "and every time", and add "If the change contains documentation, skip `qa`." Run it again: docs-and-code skips qa, red. Undo: `git checkout plugin`.
