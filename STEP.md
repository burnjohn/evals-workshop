# You are on `judge-done`

## Judge · can you trust an LLM judge?
Read `labs/judge/README.md` first. Every run is a real agent: Claude Code on Haiku, your login, `plugin/` as it is on disk.

**The answer key is complete. Run it, break it, fix it.**

```bash
npm test -- judge           # green
```

Break it: in `labs/judge/judge.md`, "too vague to tell, the verdict is `fail`" → `pass`, and run it again. Then undo the edit: `git checkout plugin labs`.

To label it yourself: `npm run step start`. Onwards: `npm run step next`
