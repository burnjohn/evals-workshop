# You are on `flags-done`

## Flags · `implementer`: a new feature goes out behind a flag
Read `labs/flags/README.md` first. Every run is a real agent: Claude Code on Haiku, your login, `plugin/` as it is on disk.

**The eval is written. Today one case is red, on purpose.**

```bash
npm test -- flags           # plain is red
```

Fix it: in `plugin/skills/ui-rules/SKILL.md`, add "Every new UI feature is behind a new flag in flags.json, off by default.", and run it again: green. Undo: `git checkout plugin`.

Onwards: `npm run step next`
