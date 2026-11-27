# Live review · the code-review skill, live in CI

**Under test:** `plugin/skills/code-review/SKILL.md`, on DeepSeek (`deepseek/deepseek-v4-flash` via OpenRouter).
**When:** on every pull request, job `live` in `.github/workflows/eval-gate.yml`. Nothing is recorded: the model answers now.

## The cases

8 small pull requests, one folder each in `cases/` (`input.patch` + `case.yaml`, the answer key):

| Case | The bug a person labelled | Severity |
|---|---|---|
| 01-sql-sort | `ORDER BY ${req.query.sort}`: SQL injection. Decoy: `LIMIT ${limit}` is a number | CRITICAL |
| 02-async-foreach | `forEach(async …)`: the job reports success before a mail is sent | CRITICAL |
| 03-webhook-signature | the secret goes to the logs; the signature is compared with `!==` (timing) | CRITICAL ×2 |
| 04-react-search | `useEffect` misses `query`; `key={index}` on removable rows | WARNING ×2 |
| 05-file-download | `path.join(UPLOAD_DIR, req.query.name)`: path traversal | CRITICAL |
| 06-order-errors | the `catch` answers 200 `{ ok: true }` after a failed charge | CRITICAL |
| 07-clean-rename | clean: a rename and its callers | – |
| 08-clean-slugify | clean: a pure helper and its tests | – |

## The checks (code, no judge)

| Check | Fails when |
|---|---|
| `caught-bugs.js` | a labelled bug has no finding in its file whose title is about it (`match` in case.yaml) |
| `right-severity.js` | a caught bug has the wrong severity: SQL injection as a WARNING |
| `decoy-left-alone.js` | the decoy is reported: "SQL injection via limit" |
| `clean-pr-silent.js` | a clean PR gets a CRITICAL finding |

Models count diff lines a few off, so a bug is matched by file and topic, not by line number.

## The gate

`gate.mjs` runs every case 3 times in each column and compares `pr` (this branch) with `base` (the branch the PR goes into):

| Metric | Rule |
|---|---|
| caught bugs | ≥ base − 10 points, and ≥ 60% |
| right severity | ≥ base − 15 points |
| decoy flagged | ≤ base, plus 1 in 3 runs |
| CRITICAL on a clean PR | shown, not blocking: on an unchanged skill it swings between 0% and 50% |

`no-skill` is the control: it shows what the skill adds. It never blocks. The table goes to the job summary; the full matrix is the `live-review-matrix` artifact (`live.html`).

## Run it on your machine

```bash
export OPENROUTER_API_KEY=sk-or-...
cp plugin/skills/code-review/SKILL.md /tmp/base.md          # the version to compare against
BASE_SKILL=/tmp/base.md npx -y promptfoo@0.126.0 eval -c labs/live-review/promptfooconfig.yaml --repeat 3 -o live.json
node labs/live-review/gate.mjs live.json
npx -y promptfoo@0.126.0 view                                # the matrix in the browser
```

## Break it

Add this line to the skill: `Keep the review short: report only the single most important finding.`
Cases 03 and 04 have two bugs each, so caught bugs falls to about 75%, and on a clean PR the model now invents one. Red.
