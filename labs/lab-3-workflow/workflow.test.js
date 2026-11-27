// Lab 3 · workflow run-plan · Who did what, and when?
// A throwaway repo (fixture/) with plan.md, then Claude Code is asked to "Run the plan in plan.md." with the plugin.
// The checks read the stream it wrote (the trace): which agents ran, on which model, with which skills, in which order.
// About 2 minutes.
//
//   npm test -- lab-3        break it: in plugin/skills/run-plan/SKILL.md, drop "every time" and add
//                            "If the change contains documentation, skip qa. Say why: qa skipped: <why>"
import { beforeAll, describe, expect, test } from "vitest";
import { json, liveOrSaved, ran, read } from "../../lib/agent.js";
import { facts, runPlan } from "../../lib/workflow.js";

const exp = json("labs/lab-3-workflow/expected.json"), todo = v => typeof v === "string";
let r;
beforeAll(async () => {
  const saved = await liveOrSaved("lab-3-workflow", "lab-3-workflow", { plan: read("labs/lab-3-workflow/plan.md") }, async () => ({ plan: await runPlan() }));
  r = facts(ran(saved, "plan", "lab-3"));
}, 900_000);

const who = () => `\nwhat ran: ${r.w.runs.map(x => `${x.role}${x.taskId ? ` ${x.taskId}` : ""} (${x.models.join()}; ${x.skills.join(", ") || "no skills"})`).join(" → ")}\nwhat it said: ${r.result}`;

test("the run finished, and so did every agent in it", () => {
  expect(r.error, r.result).toBeNull();
  expect(r.w.runs.filter(x => x.status !== "completed").map(x => x.role), who()).toEqual([]);
});

test("one implementer per task", () =>
  expect(r.builders.map(x => x.taskId).sort(), who()).toEqual(Object.keys(exp.tasks).sort()));

for (const [id, want] of Object.entries(exp.tasks)) {
  if (todo(want)) { test.todo(`${id}: copy model, skills and after from plan.md`); continue; }
  describe(id, () => {
    test(`runs on ${want.model}`, () => expect(r.w.task(id)?.models, who()).toEqual([expect.stringContaining(want.model)]));
    test("loads exactly its skills", () => expect(new Set(r.w.task(id)?.skills), who()).toEqual(new Set(want.skills)));
    for (const dep of want.after) test(`starts after ${dep} ends`, () => expect(r.w.task(id).start, who()).toBeGreaterThan(r.w.task(dep).end));
  });
}

if (todo(exp.stages)) test.todo("stages: copy them from plan.md");
else test("stages run in order, none skipped", () => expect(r.stages, who()).toEqual(exp.stages));
