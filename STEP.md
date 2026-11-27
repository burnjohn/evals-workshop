# You are on `lab-1a-done`

## Lab 1A · `make-release`: what did it do?
Read `labs/lab-1a-release/README.md` first. Every run is a real agent: Claude Code on Haiku, your login, `plugin/` as it is on disk.

**The answer key is complete. Run it, break it, fix it.**

```bash
npm test -- lab-1a           # green
```

Break it: in `plugin/skills/make-release/SKILL.md`, delete step 5 (tag and push), and run it again. Then undo the edit: `git checkout plugin labs`.

To label it yourself: `npm run step start`. Onwards: `npm run step next`
