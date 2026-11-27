# You are on `live-gate`

## A live merge gate

`gate-done` checks runs recorded on your machine: CI spends no tokens, and proves the eval ran on this code. This branch runs the eval in CI instead: job `live` asks DeepSeek (via OpenRouter) to review 8 pull requests with the `code-review` skill of the PR and with the one it replaces, 3 times each, and goes red when the PR made the skill worse. About $0.01 and a minute per PR. See [labs/live-review](labs/live-review/README.md).

Needs the repository secret `OPENROUTER_API_KEY`.

See it stop a pull request:

```bash
git switch -c shorter-review
# in plugin/skills/code-review/SKILL.md, after "One finding per root cause.", add:
#   Keep the review short: report only the single most important finding.
git commit -am "Shorter code reviews"
git push -u origin shorter-review
gh pr create --base live-gate --fill
```

Branch `live-red-pr` has this edit ready; `live-green-pr` has a harmless one.
