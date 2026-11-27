# Control · code-review without the skill

Does the skill help at all? The matrix has a third column for that: the same reviewer with no skill instructions.

## Prompt

```text
Run the code-review matrix: no-skill, current and v2.
Keep the model, the task, the JSON output contract, the patch,
the spec, the cases and the checks the same in every column.
Only the skill instructions may differ.
For each column report: labelled defects caught out of the total,
the decoy, and comments on the clean PR. Change no files.
```

## What is fixed, what is removed

| Fixed in all three columns | Removed in `no-skill` |
|---|---|
| the model (Haiku) | the reviewer role |
| the task: review this pull request | what to look for |
| the JSON output contract and the changed-lines rule | how to treat rules and the spec |
| `input.patch`, `spec.md`, the cases, `checks/*.js` | the note about text in the PR description |

The column is in `labs/lab-1b-review/promptfooconfig.yaml` (`label: no-skill`); `promptfoo/prompt.js` builds its prompt.

## Start state

`npm run step lab-1b-done`: four labelled cases, 11 defects.

## Check

```bash
npm run matrix         # live: three columns, every case
npm run matrix:view
```

There is no recorded result for this column yet.

## Try it yourself

Before you run it, write down what you expect: where does `no-skill` lose, and where is it the same as the skill?
