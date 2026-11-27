// Lab 3 · Demo 4 · The docs-only policy: may this change skip QA?
//
// Every case in policy.json is a one-task plan that changes those files, run live with run-plan. About 2 minutes.
// It checks the policy only: does qa run before the release where it must. The order of all stages is workflow.test.js.
//
// Today run-plan runs qa every time, so both cases pass. The proposed rule ("documentation may skip qa") must keep
// docs-and-code green: try it in plugin/skills/run-plan/SKILL.md and run this again.
import { beforeAll, describe, expect, test } from "vitest";
import { json, liveOrSaved, ran } from "../../lib/agent.js";
import { facts, runPlan } from "../../lib/workflow.js";

const { cases } = json("labs/lab-3-workflow/policy.json");

// A one-task plan with its own spec, so qa checks this change and nothing else.
const spec = c => `# Spec: ${c.id}
- AC-1 ${c.task}
`;

const plan = c => `# Plan: ${c.id}
Status: approved · Spec: spec.md

## T1: ${c.id}
- Serves: AC-1 · Type: change · Model: haiku · Depends-on: none
- Skills to use: none
- Owned paths: ${c.changed.join(", ")}
- Do: ${c.task}

## After the tasks, one at a time
code-review, test-writer, qa, make-release. If qa fails, there is no release.
`;

let runs = {};

beforeAll(async () => {
  const inputs = Object.fromEntries(cases.map(c => [c.id, { plan: plan(c), spec: spec(c) }]));

  const runAll = async () => {
    const results = await Promise.all(
      cases.map(async c => [c.id, await runPlan({ "plan.md": plan(c), "spec.md": spec(c) })]),
    );
    return Object.fromEntries(results);
  };

  runs = await liveOrSaved("lab-3-policy", "lab-3-workflow", inputs, runAll);
}, 900_000);

for (const c of cases) {
  describe(`${c.id}: ${c.changed.join(" + ")}`, () => {
    const r = () => facts(ran(runs, c.id, "lab-3"));
    const qa = () => r().w.of("qa")[0];
    const release = () => r().w.of("make-release")[0];
    const who = () => `\nstages: ${r().stages.join(" → ")}\nwhat it said: ${r().result}`;

    test("the run finished and released", () => {
      expect(r().error, r().result).toBeNull();
      expect(release()?.status, who()).toBe("completed");
    });

    if (c.qa === "must run") {
      test("qa finishes before make-release", () => {
        expect(qa()?.status, `qa skipped: ${r().skipped.qa ?? "no reason given"}${who()}`).toBe("completed");
        expect(qa().end, who()).toBeLessThan(release().start);
      });
    } else {
      test("qa may be skipped, and then it says why", () => {
        // Running it anyway is allowed.
        if (qa()) return expect(qa().end, who()).toBeLessThan(release().start);
        expect(r().skipped.qa, `a skipped stage must leave a reason: "qa skipped: <why>"${who()}`).toMatch(/doc/i);
      });

      test("nothing else is skipped", () => {
        const missing = ["code-review", "test-writer", "make-release"].filter(s => !r().stages.includes(s));
        expect(missing, who()).toEqual([]);
      });
    }
  });
}
