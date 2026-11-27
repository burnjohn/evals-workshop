# Flags · `implementer`: a new feature goes out behind a flag

**The house rule.** Every new UI feature is behind a new flag in `flags.json`, off by default. Until someone turns the flag on, users see the page as it was.

**Under test.** `plugin/agents/implementer.md` with the skill `ui-rules`, on one task: add a dark mode toggle to the settings page.

**What we check.** What it left, not what it says. The checks render `web/settings.js` with every flag off and with every flag on, and read `flags.json`:

| Check | Why |
|---|---|
| every flag on: the page has the toggle | the feature was built |
| every flag off: no toggle, the Save button is still there | users see the old page |
| a new flag in `flags.json`, `false` | off by default |
| it loaded `ui-rules` | when it goes red, this often says why |

**The cases.** `told`: the task names the flag. `plain`: it does not, so the rule has to come from `ui-rules`.

| Path | What |
|---|---|
| `cases.json` | the 2 tasks |
| `fixture/` | the small app: `web/settings.js`, `web/search.js` (already behind `beta_search`), `flags.json` |
| `flags.test.js` | the checks |

```bash
npm test -- flags
```

**Today `plain` is red.** `ui-rules` says nothing about flags, so the agent ships the toggle to everyone and still says `status: done`.

**Fix it.** Add to `plugin/skills/ui-rules/SKILL.md`:

```
Every new UI feature is behind a new flag in flags.json, off by default.
```

Run it again: green. Undo: `git checkout plugin`.

This lab is not in the merge gate: CI runs `labs/lab-*` and `labs/judge`. It stays red until you fix the skill, on purpose.
