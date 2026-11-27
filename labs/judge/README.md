# Judge · can you trust an LLM judge?

**Under test.** `judge.md`: asks a model one question about a release note: does the reader know what changes for them and what to do? Code can't answer that.

**What we check.** The judge against a person. Count both kinds of mistake: bad notes it passed, good notes it failed. Agreement alone lies: a judge that passes everything still agrees most of the time.

**How.** Claude Code (Haiku, your login) answers every note in `cases.json` with `judge.md` as its only instructions, 3 times, and the majority counts: a judge answers differently from run to run. About 10 seconds.

| File | What |
|---|---|
| `cases.json` | 16 release notes, each with the person's verdict and why |
| `judge.md` | the judge prompt |
| `judge.test.js` | the checks |

```bash
npm test -- judge
VOTES=5 npm test -- judge     # more runs per note
```

**Break it.** In `judge.md`, change "If the note is too vague to tell, the verdict is `fail`." to `pass`. Run it again: it passes a vague note the person failed. Undo: `git checkout labs`.
