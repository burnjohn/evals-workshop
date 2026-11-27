# You are on `lab-1b-done`

## Lab 1B · `code-review`: what did it find, miss and invent?
Read `labs/lab-1b-review/README.md` first. Every run is a real agent: Claude Code on Haiku, your login, `plugin/` as it is on disk.

**The answer key is complete. Run it, break it, fix it.**

```bash
npm test -- lab-1b           # green
```

Break it: in `plugin/skills/code-review/SKILL.md`, make it review ONLY for security, at most 5 findings, and run it again. Then undo the edit: `git checkout plugin labs`.

To label it yourself: `npm run step start`. Onwards: `npm run step next`
