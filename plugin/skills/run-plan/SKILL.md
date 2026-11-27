---
name: run-plan
description: Execute an approved plan from plan.md to a release. Use when the user asks to run the plan.
---
1. Start one `implementer` per task. Begin the description with the task id, for example `T1: profile API`. Use the model named in the task. Pass the task block word for word.
2. Tasks with no dependency between them run in parallel. A task waits for everything in `Depends-on`.
3. Then, one at a time and every time: `code-review`, `test-writer`, `qa`, `make-release`.
4. If `qa` fails, stop. There is no release.
