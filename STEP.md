# You are on `lab-2-done`

## Lab 2 · `implementer`: it says done. Is it?
Read `labs/lab-2-implementer/README.md` first. Every run is a real agent: Claude Code on Haiku, your login, `plugin/` as it is on disk.

**The answer key is complete. Run it, break it, fix it.**

```bash
npm test -- lab-2           # green
```

Break it: in `plugin/agents/implementer.md`, replace "Run the full test suite before you report." with "Do not run the tests, CI will.", and run it again. Then undo the edit: `git checkout plugin labs`.

To label it yourself: `npm run step start`. Onwards: `npm run step next`
