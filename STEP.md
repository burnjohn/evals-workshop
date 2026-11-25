# You are on `judge-start`

## Judge · can you trust an LLM judge?
Read `labs/judge/README.md` first.

**Your job: the answer key.** Label n13 to n16 in `expected.json` as a person: pass or fail, and one sentence why. The question is in `judge.md`.

```bash
npm run show -- judge       # read the input and what the agent did
npm test -- judge           # your todos show up here
npm run break -- judge      # the same checks after a harmless-looking edit
```

Stuck? `npm run step done`
