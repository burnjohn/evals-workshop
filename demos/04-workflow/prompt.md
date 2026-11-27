# Demo 4 · run-plan: docs-only changes may skip QA

## Prompt

```text
Update run-plan so a documentation-only change may skip QA.
If any application code changes, QA must finish before release.
Preserve task dependencies and record why any stage was skipped.
Show the workflow diff.
```

## Cases

| Changed files | Expected |
|---|---|
| `README.md` | QA may be skipped. The trace says why. |
| `README.md`, `api/profile.js` | QA runs and finishes before `make-release`. |

## Start state

`npm run step lab-3-done`. The workflow is `plugin/skills/run-plan/SKILL.md`, the plan is `labs/lab-3-workflow/plan.md`.

## Check

```bash
npm test -- lab-3            # today run-plan runs QA every time: both cases pass
```

Then make the change the prompt asks for in `plugin/skills/run-plan/SKILL.md`, and run it again. A careful rule ("every changed file is documentation") keeps both green. A loose one ("the change contains documentation") skips QA on docs-and-code: red.

The cases and the expected column are in `labs/lab-3-workflow/policy.json`, the check in `policy.test.js`. Each case is a one-task plan, run live. Put the expected plan and the observed trace side by side. Look for the stage that is missing.

## Try it yourself

Add a case where only a test file changes. Decide first: does QA run?
