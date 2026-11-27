# Demo 2 · code-review: a candidate version of the skill

## Prompt

```text
Create a candidate version of the code-review skill.
When a spec is supplied, connect each reported defect to changed
behaviour, explain the observable consequence, and check whether
the spec explicitly allows that behaviour.
Preserve the JSON output contract. Keep the baseline unchanged.
Do not read eval labels, saved findings, or expected outputs.
Write the candidate to labs/lab-1b-review/versions/code-review.v2.md.
```

## Start state

`npm run step lab-1b-done`: all four cases are labelled there, 11 defects. On `lab-1b-start` the dashboard case is still TODO and the matrix counts 8. The baseline is `plugin/skills/code-review/SKILL.md`, the spec is `labs/lab-1b-review/spec.md`, the candidate goes to `labs/lab-1b-review/versions/code-review.v2.md`.

## Check

```bash
npm run matrix         # no-skill, baseline and candidate on every case, live (Haiku, on the case slices)
npm run matrix:view
```

Read three numbers: labelled defects caught, the decoy (behaviour the spec allows) left alone, comments on the clean PR. Run it twice: one run proves little.

The numbers on the slide (11/11 and 6/11) are a recorded run: DeepSeek V4.1 Flash on the full PR, 21.11.2026. A live run uses Haiku and the case slices, so its numbers will differ. The same checks without the matrix: `SKILL=labs/lab-1b-review/versions/code-review.v2.md npm test -- lab-1b`.

## Try it yourself

Ask for a candidate that only reports CRITICAL findings. Before you run it, write down which number you expect to drop.
