# Demo 3 · implementer + db-rules: a product contract

## Prompt

```text
Implement profile archiving for an administrator.
Follow the repository's database conventions. Archived profiles
must disappear from the active list. Repeating the operation must
preserve the original archive timestamp.
Run the relevant tests and summarize the files you changed.
```

## The contract

- An administrator can archive a profile.
- The row stays in the database. The active list no longer shows it.
- Archiving the same profile again keeps the first `archived_at`.

## Start state

`npm run step lab-2-done`. The house rules are in `plugin/skills/db-rules/SKILL.md`.

## Check

```bash
npm test -- lab-2
```

Do not stop at the agent's "tests pass". Read what it changed and the hidden test result.

The hidden test is `labs/lab-2-implementer/hidden/db.test.mjs`: a SQLite database in memory, a fixed clock, the same profile archived at 09:00 and again at 09:05. It reads both rows and the active list. An implementation that overwrites `archived_at` on the repeat says "done" and goes red here.

## Try it yourself

Add a case for a profile that does not exist. Decide the expected behaviour first.
