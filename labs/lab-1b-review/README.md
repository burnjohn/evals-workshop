# Lab 1B · `code-review`: a skill that judges

**What it is.** `plugin/skills/code-review` reviews a pull request and returns findings: file, lines, severity, title.

**What we test.** What it found, what it missed, and what it invented. A review is not right or wrong as a whole, so we count: defects caught, the decoy left alone, nothing flagged in a clean PR.

**Grader: code, against an answer key a person wrote.** The key is the hard part. That is your job here.

**The data is real.** Four slices of a real analytics PR (quick-blog), with 11 planted defects, one decoy and one clean PR. Six real answers from DeepSeek V4.1 Flash: three reviewer prompts, with and without the spec.

| File | What |
|---|---|
| `prs/` | 4 pull requests to read: the input |
| `spec.md` | the spec the PRs must meet |
| `expected.json` | the defects in each PR. **PR 3 is yours to label: 3 defects.** |
| `runs/` | six real reviewer answers |
| `break.diff` | the prompt narrowed to security only |

```bash
npm run show -- lab-1b      # all six reviewers side by side
npm test -- lab-1b          # 1 todo: label prs/3-dashboard.patch
npm run break -- lab-1b     # security-only prompt: 3 of 11
```
