# Evals as a Merge Gate

Hands-on workshop: test your skills, agents and workflows the way you test code.
Vitest runs the test. The test reads what the agent really did, and compares it with an answer key a person wrote.

**Every run is real.** `npm test` starts Claude Code on Haiku with the plugin in `plugin/` as it is on your disk, on every case, and checks what it did. It uses your Claude Code login: no API key. Change a skill, run it again, see it go red.

## Setup

1. **Use this template → Create a new repository.** Tick **Include all branches**.
2. Open a Codespace, or clone it (Node 22.22 or newer: `nvm install 22`; macOS or Linux).

```bash
npm ci
claude          # logged in? then /exit
npm test        # every lab, live: green, with todos: those are yours (about 3 minutes)
```

Several Claude Code logins on one machine? Put the config folder of the one to use in a file `.claude-config-dir` above this repo (for example `~/.claude-personal`).

## What is where

| Path | What |
|---|---|
| `plugin/` | **the prototype under test**: `factory`, a Claude Code plugin whose skills and agents take one change from plan to release |
| `labs/<lab>/` | one folder per lab: `README.md`, the cases with the answer key, a `fixture/` repo, and one test |
| `lib/agent.js` | runs Claude Code on one case: your login, Haiku, `./plugin` |
| `lib/world.js` | a throwaway git repo per case that logs every command the agent runs |
| `runs/` | the last run of each lab, recorded on your machine, so CI can check it without tokens |
| `.github/workflows/` | the merge gate |
| [`EVALS.md`](EVALS.md) | **how we write evals**: the layout, the rules, pass@k |
| [`CHECKLIST.md`](CHECKLIST.md) | what to do in your own repo |

To use it in your own project, copy `lib/` and one lab, and point the cases at your skill.

## The labs

| Lab | Under test | What we check | Grader | Your job |
|---|---|---|---|---|
| [1A](labs/lab-1a-release) | skill `make-release` | what it did: version, tags, order | code | `expect` for 2 cases |
| [1B](labs/lab-1b-review) | skill `code-review` | found, missed, invented | code, a person's key, an LLM judge | label a real PR; compare two versions of the skill; add cases |
| [2](labs/lab-2-implementer) | agent `implementer` | what it left: rules, files, tests | code, hidden tests | `expect` for one task |
| [3](labs/lab-3-workflow) | workflow `run-plan` | who ran, which model, which order | code on the trace | copy the plan into data |
| [Judge](labs/judge) | an LLM judge | does it agree with a person | a person | label 4 notes |

In every lab:

```bash
npm test -- lab-1a          # 1. run it: the agent works on every case, the checks read what it did
                            # 2. fill the TODOs in the lab's cases
                            # 3. break it: each lab's README names one edit to the plugin. Run it again: red
git checkout plugin         # 4. fix it: undo the edit, green again
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

From `gate-start` on, `.github/workflows/eval-gate.yml` runs on every pull request. It spends no tokens: it checks the runs in `runs/`, which `npm test` records on your machine, and only if `plugin/` and the cases are the same as when they were recorded. Change a skill without running the evals again, and CI is red: *not run* is never green. `eval-gate` is the one required check.

Require it with a ruleset (**Settings → Rules → Rulesets → Require status checks → `eval-gate`**). On a free plan that needs a public repository. Protect `gate-done`, which has the workflow.

`eval-matrix.yml` runs the Lab 1B matrix (no skill, current skill, v2) live on OpenRouter; locally `npm run matrix` runs the same thing on your Claude Code login. It costs money and is not deterministic, so it never blocks a merge: start it by hand.

## Install the plugin

```bash
/plugin install factory --marketplace burnjohn/evals-workshop
```

MIT. A personal open-source project for training, not affiliated with any employer. Lab 1B uses a slice of the author's public [quick-blog](https://github.com/burnjohn/quick-blog) repo.
