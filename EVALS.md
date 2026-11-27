# How we write evals

The house rules for evals in this repo. Lab 1B (`labs/lab-1b-review`) follows all of them: copy it.

## Layout

Every lab has the same shape. The plumbing lives next to the labs, not in them.

```
labs/<lab>/
├── README.md                 what is under test, what we check, how to break it
├── cases.json                the cases, each with "expect": the answer key a person wrote
├── fixture/                  the repo the agent works in, copied fresh for every case
└── <lab>.test.js             runs the agent on every case, then checks what it did
lib/
├── agent.js                  runAgent(): Claude Code with ./plugin, your login, Haiku; liveOrSaved() for CI
└── world.js                  makeWorld(): a throwaway git repo that logs every command
runs/<lab>.json               the last run recorded on your machine, for CI
```

Lab 1B keeps one case per folder (`cases/<NN-name>/input.patch` + `case.yaml`): a patch is easier to read as a file. Add a case by adding an entry or a folder; nothing else changes.

## case.yaml

```yaml
# One line: what this case tests
source: real                 # real | synthetic
from: quick-blog PR #41      # a PR, a bug report, or the real case a synthetic one imitates
input: input.patch
defects:                     # what a person says is wrong; [] means a clean change
  - id: T1-1
    file: server/src/configs/analytics.js
    lines: [2, 3]
    why: "Live keys committed (AC-10.1)."
decoys: []                   # looks like a bug, is not
```

## The rules

**Cases**

1. **Start from real failures.** 20 to 50 cases from your own project beat 500 made up. Synthetic cases fill gaps; each one says which real case it imitates.
2. **Every case says where it comes from** (`source`, `from`, or `why`), so you know what a red test means.
3. **Cover three kinds of input:** the normal case, the edge case, and the trap: a decoy that looks wrong but isn't, and a clean input where the right answer is "nothing".
4. **A new case that fails is news, not noise.** Fix the agent, or keep it out of the gate until it passes, and say so in the case.
5. **A person writes the answer key,** with one sentence of why. A model may draft it; a person signs it.
6. **Keep a hold-out.** Don't show every case to the model while you tune the prompt, or you tune it to the test.

**Checks**

7. **One check, one way to fail.** The file name is what you read when it is red: `decoy-left-alone.js`, not `test3.js`.
8. **Code first.** Exact values, JSON shape, files changed, order of steps: code. A judge only for meaning, with one yes/no question.
9. **Check the outcome, not the path,** except where order is the rule (tests before push).
10. **Every check must go red on a known bad version.** Break the skill on purpose (each lab README says how) and watch it go red. If it can't, it checks nothing.
11. **The judge is tested too:** on cases a person labelled, count the bad ones it caught and the good ones it failed.

**Runs**

12. **Not run is never green.** A recorded run belongs to one version of the plugin, the cases and one model; change any of them and CI is red until you run it again.
13. **Pin the model,** like any dependency. A new model means a new run of the whole set.
14. **Live on your machine, free in CI.** `npm test` runs the real agent and records `runs/<lab>.json`; CI checks that record and spends no tokens. Run it a few times before a release.

## One run proves little: pass@k and pass^k

An agent can answer differently each time. Run each case k times, then:

| | Means | Use it when |
|---|---|---|
| **pass@k** | at least one of k runs passed | one good answer is enough: a human picks the best of k |
| **pass^k** | all k runs passed | it must work every time: an agent that ships a release |

With a 70% pass rate per run, pass@3 is 97% and pass^3 is 34%. Same agent, opposite story: say which one you report.

## Which engine runs what

| | Runs | Costs | Blocks a merge |
|---|---|---|---|
| **Vitest** (`npm test`) | live: the real agent on every case, checks in code | your Claude Code login | yes, through the recorded run in CI |
| **promptfoo** (`npm run matrix`) | live: versions × cases, code checks + LLM judge | model calls | no |
| **`claude plugin eval`** | live, the whole plugin, with and without it | model calls | no |

Locally promptfoo runs on your Claude Code login (Haiku). In CI it runs on OpenRouter (`eval-matrix` workflow).
