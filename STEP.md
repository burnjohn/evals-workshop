# You are on `gate-start`

## Merge gate
`.github/workflows/evals.yml` runs on each pull request, but it only has `static`: it checks that every skill and agent is well formed, and nothing runs the evals.

**Add a job `evals`.** It fails when a case is still TODO, then runs `npx vitest run labs/lab- labs/judge`. GitHub sets CI=true, so the labs read `runs/` and no agent starts.

Stuck? `npm run step done`
