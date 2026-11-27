# Lab 1B · `code-review`: a skill that judges

**Under test.** `plugin/skills/code-review`: reviews a pull request and returns findings as JSON: file, lines, severity, title.

**What we check.** What it found, what it missed, what it invented. A review has no single right answer, so we count: every security defect caught, at least 70% of all defects, the decoy left alone, a clean PR left (almost) alone.

**How.** For every case, Claude Code (Haiku, your login) gets the skill, `spec.md` and the case's patch, and answers. Its findings are scored against the defects a person labelled. About 25 seconds.

| Path | What |
|---|---|
| `cases/<NN-name>/` | one case per folder: `input.patch`, and `case.yaml`, the answer key a person wrote |
| `cases/_template/` | a new case: `npm run new-case -- 05-what-it-tests` |
| `spec.md` | the spec the PRs must meet |
| `versions/code-review.v2.md` | your version of the skill, to compare |
| `checks/`, `promptfoo/`, `promptfooconfig.yaml` | the same checks as a matrix: no skill × current × v2 |
| `review.test.js` | the checks |

Cases 01–03 are slices of a real analytics PR (quick-blog) with 11 planted defects and one decoy. Case 04 is a clean change.

```bash
npm test -- lab-1b
SKILL=labs/lab-1b-review/versions/code-review.v2.md npm test -- lab-1b   # the same checks on v2
npm run matrix                                                          # no skill × current × v2, side by side
```

**Break it.** In `plugin/skills/code-review/SKILL.md`, replace the first two lines with: "You are an application security engineer. Review ONLY for security. At most 5 findings." Run it again. Undo: `git checkout plugin`.

## Write v2

Paste this into Claude Code and fill the goal:

```text
Read plugin/skills/code-review/SKILL.md and labs/lab-1b-review/spec.md.
Write a better version to labs/lab-1b-review/versions/code-review.v2.md.
Keep the frontmatter and the JSON output format exactly as they are.
Goal: <e.g. catch every broken acceptance criterion in the spec, and don't flag what the spec allows on purpose>.
Don't open labs/lab-1b-review/cases/: those are the test. A prompt tuned on the test proves nothing.
```

Decide on numbers, and run it twice: one run proves little.

## Add cases

```text
Read labs/lab-1b-review/cases/_template/case.yaml, two real cases in labs/lab-1b-review/cases/
(input.patch and case.yaml), and labs/lab-1b-review/spec.md.
Make 2 new synthetic cases with: npm run new-case -- 05-<what-it-tests>
Each one: a patch in the same codebase and style, 1-2 planted defects that each break a named
acceptance criterion in spec.md. In one of them, add a decoy: code that looks wrong but the spec allows.
Fill case.yaml: source: synthetic, from: the real case it imitates.
Don't change the existing cases. Then run npm test -- lab-1b.
```

Then read what it made, as a person: is each defect really a defect? That is the answer key. The best cases are not synthetic: take them from your own pull requests, the bugs that got through review.
