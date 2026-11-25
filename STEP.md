# You are on `gate-done`

## Merge gate
`eval-gate` now always runs, and fails unless every job succeeded.

Make it required: **Settings → Rules → Rulesets → Require status checks → `eval-gate`**. On a free plan that needs a public repository. Protect `gate-done`, because the workflow is not on `main`.

See it stop a pull request:

```bash
git switch -c my-edit
# in plugin/skills/make-release/SKILL.md, step 1: read commit titles only (labs/lab-1a-release/break.diff)
git commit -am "Reword the release skill"
git push -u origin my-edit
gh pr create --base gate-done --fill     # or open it on GitHub
```

The saved runs were made with the old prompt, so `static` goes red: the eval has not run. Branch `demo-red-pr` has this edit ready.

The live judge is in `.github/workflows/judge-live.yml`: start it by hand.
