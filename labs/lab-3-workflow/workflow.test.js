// Lab 3 · workflow · Who did what, and when?
// Inputs: plan.md. Answer key: expected.json, partly yours. Read the run:  npm run show -- lab-3
import { describe, expect, test } from "vitest";
import { expected, isTodo } from "../../lib/recording.js";
import { loadRun } from "../../lib/workflow.js";

const exp = expected("lab-3"), { w, builders, stages } = loadRun();

test("the run finished, and so did every agent in it", () => {
  expect(w.error).toBe(false);
  expect(w.runs.filter(r => r.status !== "completed").map(r => r.role)).toEqual([]);
});

test("one implementer per task", () =>
  expect(builders.map(r => r.taskId).sort()).toEqual(Object.keys(exp.tasks).sort()));

for (const [id, want] of Object.entries(exp.tasks)) {
  if (isTodo(want)) { test.todo(`${id}: copy model, skills and after from plan.md`); continue; }
  describe(id, () => {
    test(`runs on ${want.model}`, () => expect(w.task(id).models).toEqual([expect.stringContaining(want.model)]));
    test("loads exactly its skills", () => expect(new Set(w.task(id).skills)).toEqual(new Set(want.skills)));
    for (const dep of want.after) test(`starts after ${dep} ends`, () => expect(w.task(id).start).toBeGreaterThan(w.task(dep).end));
  });
}

if (isTodo(exp.stages)) test.todo("stages: copy them from plan.md");
else test("stages run in order, none skipped", () => expect(stages).toEqual(exp.stages));
