# You are on `gate-done`

## Merge gate
`eval-gate` now always runs, and fails unless every job succeeded.

CI spends no tokens: it checks the runs you recorded on your machine (`runs/*.json`), and only if `plugin/` and the cases are the same as when they were recorded. Change a skill without running the evals again, and CI says: the eval has NOT run.

Make it required: **Settings → Rules → Rulesets → Require status checks → `eval-gate`**. On a free plan that needs a public repository. Protect `gate-done`, because the workflow is not on `main`.

See it stop a pull request:

```bash
git switch -c my-edit
# change one line in plugin/skills/make-release/SKILL.md, and do not run npm test
git commit -am "Reword the release skill"
git push -u origin my-edit
gh pr create --base gate-done --fill     # or open it on GitHub
```

Branch `demo-red-pr` has such an edit ready.
