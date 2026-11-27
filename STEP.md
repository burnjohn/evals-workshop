# You are on `lab-3-done`

## Lab 3 · workflow: who did what, and when?
Read `labs/lab-3-workflow/README.md` first. Every run is a real agent: Claude Code on Haiku, your login, `plugin/` as it is on disk.

**The answer key is complete. Run it, break it, fix it.**

```bash
npm test -- lab-3           # green
```

Break it: in `plugin/skills/run-plan/SKILL.md`, step 3: drop "and every time" and add "If the change contains documentation, skip `qa`.", and run it again. Then undo the edit: `git checkout plugin labs`.

To label it yourself: `npm run step start`. Onwards: `npm run step next`
