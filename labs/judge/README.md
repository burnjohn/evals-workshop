# Judge · can you trust an LLM judge?

**What it is.** `judge.md` asks a model one question about a release note: does the reader know what changes for them and what to do? Code can't answer that.

**What we test.** The judge itself, against a person. Count both: bad notes it caught, good notes it failed. Agreement alone lies: a judge that passes everything still agrees 69% of the time here.

**Grader: a person.** You are the person.

| File | What |
|---|---|
| `notes.json` | 16 release notes: the input |
| `expected.json` | a person's verdicts. **Four are yours to label.** |
| `runs/` | the judge's verdicts (synthetic), and `live.json` after a live run |
| `break.diff` | "if you are not sure, be generous" |

```bash
npm run show -- judge
npm test -- judge           # 4 todo
npm run break -- judge      # passes everything
ANTHROPIC_API_KEY=... npm run judge:live && RECORDING=live npm test -- judge   # a real judge
```

In CI the live judge runs only by hand (`judge-live` workflow): it costs money and is not deterministic, so it never blocks a merge.
