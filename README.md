# Evals as a Merge Gate

Hands-on workshop: test your skills, agents and workflows the way you test code.
Vitest runs the test. The test reads what the agent really did, and compares it with an answer key a person wrote.

**No API key needed.** The labs replay saved runs. Lab 1B's runs are real model answers; the others are synthetic, built by hand in the exact shape of real ones. Every check is real. The live LLM judge is optional and needs a key.

## Setup

1. **Use this template → Create a new repository.** Tick **Include all branches**.
2. Open a Codespace, or clone it (Node 22, macOS or Linux).

```bash
npm ci
npm test        # green, with todos: those are yours
```

## What is where

| Path | What |
|---|---|
| `plugin/` | **the prototype under test**: `factory`, a Claude Code plugin whose skills and agents take one change from plan to release |
| `labs/<lab>/` | one folder per lab: the input, the answer key (`expected.json`), the saved runs, the test and the break |
| `labs/static.test.js` | cheap checks that run first: skills well formed, saved runs not stale |
| `lib/` | the plumbing: replay worlds, scoring, the trace parser |
| `.github/workflows/` | the merge gate, and the live judge you start by hand |
| [`CHECKLIST.md`](CHECKLIST.md) | what to do in your own repo |

## The labs

| Lab | Under test | What we check | Grader | Your job |
|---|---|---|---|---|
| [1A](labs/lab-1a-release) | skill `make-release` | what it did: version, tags, order | code | expected versions for 2 cases |
| [1B](labs/lab-1b-review) | skill `code-review` | found, missed, invented | code + a person's key | label 3 defects in a real PR |
| [2](labs/lab-2-implementer) | agent `implementer` | what it left: rules, files, tests | code | what must be true for one task |
| [3](labs/lab-3-workflow) | workflow `run-plan` | who ran, which model, which order | code on the trace | copy the plan into data |
| [Judge](labs/judge) | an LLM judge | does it agree with a person | a person | label 4 notes |

In every lab:

```bash
npm run show -- lab-1a      # 1. read the input and what the agent did
                            # 2. fill the TODOs in labs/lab-1a-release/expected.json
npm test -- lab-1a          # 3. run
npm run break -- lab-1a     # 4. a harmless-looking edit to the prompt: red
```

## Move between steps

Every lab has two branches: `-start`, where you label, and `-done`, where the answer key is complete.

```bash
npm run step                # where am I
npm run step lab-1b         # start of a lab
npm run step done           # the same lab, finished
npm run step next           # one step forward (prev goes back)
```

Unsaved work is put aside for each branch and comes back when you return with `npm run step`.

## The merge gate

From `gate-start` on, `.github/workflows/eval-gate.yml` runs on every pull request: static checks, then every lab on its saved runs. `eval-gate` is the one required check. When a prompt changes, its saved runs are stale and `static` goes red: *not run* is never green.

Require it with a ruleset (**Settings → Rules → Rulesets → Require status checks → `eval-gate`**). On a free plan that needs a public repository. Protect `gate-done`, which has the workflow.

`judge-live.yml` runs the LLM judge with a real model. It costs money and is not deterministic, so it never blocks a merge: start it by hand (add the `ANTHROPIC_API_KEY` secret first), or turn on its nightly schedule.

## Install the plugin

```bash
/plugin install factory --marketplace burnjohn/evals-workshop
```

MIT. A personal open-source project for training, not affiliated with any employer. Lab 1B uses a slice of the author's public [quick-blog](https://github.com/burnjohn/quick-blog) repo.
