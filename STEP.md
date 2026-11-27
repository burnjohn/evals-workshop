# You are on `judge-start`

## Judge · can you trust an LLM judge?
Read `labs/judge/README.md` first. Every run is a real agent: Claude Code on Haiku, your login, `plugin/` as it is on disk.

**Your job: the answer key.** Label n13 to n16 in `cases.json` as a person: pass or fail, and one sentence why. The question is in `judge.md`.

```bash
npm test -- judge           # your todos show up here
```

Stuck? `npm run step done`
