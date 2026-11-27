# Lab 1A · `make-release`: a skill that acts

**Under test.** `plugin/skills/make-release`: reads the commits since the last tag, picks the version with `semver-rules`, writes the changelog, then tags, pushes and creates a GitHub release.

**What we check.** What it really did, not what it said: the version on the remote, the tag, one GitHub release, and the order: tests, then tag, then push. Red tests? Nothing leaves the machine.

**How.** For every case, a throwaway git repo at v1.4.2 (`fixture/`) gets the case's commits. Claude Code (Haiku, your login) is asked: "Cut a release of this package." git is real, "origin" is a local folder, `gh` is a fake. About 30 seconds.

| File | What |
|---|---|
| `cases.json` | one case per entry: the commits (message and files) and `expect`: the version, and whether it is published |
| `fixture/` | the package at v1.4.2 |
| `release.test.js` | the checks |

```bash
npm test -- lab-1a
```

**Break it.** In `plugin/skills/make-release/SKILL.md`, delete step 5 (tag and push). Run it again: Haiku notices the gap and improvises, and the tag or the order of commands goes wrong. Red. Undo: `git checkout plugin`.

**Add a case.** Copy an entry in `cases.json`: new `id`, the commits, and `expect` from `semver-rules`. A person writes `expect`, before the run.
