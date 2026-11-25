# Lab 1A · `make-release`: a skill that acts

**What it is.** `plugin/skills/make-release` reads the commits since the last tag, picks the next version with `semver-rules`, writes the changelog with `changelog-style`, then tags, pushes and creates a GitHub release.

**What we test.** What it really did, not what it said: the version on the remote, the tags, the GitHub release, and the order of commands. Tests red? Nothing may leave the machine.

**Grader: code.** git is real, the remote is a local folder, `gh` is a fake that writes a log.

| File | What |
|---|---|
| `cases.json` | 5 sets of commits: the input |
| `expected.json` | the version each case must publish. **Two are yours to write.** |
| `runs/` | the commands the agent ran, saved (synthetic) |
| `repo/`, `change/` | the package at v1.4.2 |
| `break.diff` | one harmless-looking edit to the skill |

```bash
npm run show -- lab-1a      # read the cases and what the agent did
npm test -- lab-1a          # 2 todo: fill them in expected.json
npm run break -- lab-1a     # "read titles only": it publishes 1.5.0
```
