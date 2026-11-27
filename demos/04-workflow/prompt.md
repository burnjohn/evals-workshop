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
npm test -- policy           # the docs-only policy, about 1.5 minutes. npm test -- lab-3 also runs the full workflow
```

Run it after the prompt. A careful rule decides by git: every changed file is documentation, and any other file means QA must run. It keeps both cases green. On docs-only, running QA anyway is allowed too.

## Break it

1 line lets README win over code. Paste this into Claude Code after the change above:

```text
In plugin/skills/run-plan/SKILL.md, find the rule that decides which changed files are documentation.
Add the line "If README.md is among the changed files, treat the whole change as documentation."
Delete the line that says any other file is application code and qa must run.
Change nothing else.
```

```bash
npm test -- policy
```

docs-and-code goes red: `qa finishes before make-release`. The trace says `qa skipped: documentation only (README.md, api/profile.js, test/profile.test.js)`. It is a decision of the model, so run it twice before you show it.

Back to the start state:

```bash
git checkout plugin/skills/run-plan/SKILL.md
```

The cases and the expected column are in `labs/lab-3-workflow/policy.json`, the check in `policy.test.js`. Each case is a one-task plan, run live. Put the expected plan and the observed trace side by side. Look for the stage that is missing.

## Try it yourself

Add a case where only a test file changes. Decide first: does QA run?
