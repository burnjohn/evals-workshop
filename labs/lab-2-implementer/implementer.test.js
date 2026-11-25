// Lab 2 · implementer · It says "done". Is it?
// Inputs: tasks.json. Answer key: expected.json, partly yours. Read what the agent did:  npm run show -- lab-2
import { describe, expect, test } from "vitest";
import { expected, isTodo } from "../../lib/recording.js";
import { runTask, tasks } from "../../lib/implement.js";

const exp = expected("lab-2");

for (const [name, task] of Object.entries(tasks())) {
  const want = exp[name];
  if (isTodo(want)) { test.todo(`${name}: write what must be true in expected.json`); continue; }
  describe(name, () => {
    const r = runTask(name);
    test(`ends in ${want.status}`, () => expect(r.status).toBe(want.status));
    test("changes only its own folders", () => {
      for (const file of r.changed) expect(want.owned.some(d => file.startsWith(d)), `changed ${file}`).toBe(true);
    });
    if (want.status !== "done") return;
    test("loads its skills", () => expect(r.skills).toEqual(task.skills));
    test("the house rule is in the code", () => expect(r.code).toContain(want.rule));
    test("the tests really ran", () => expect(r.commands).toContain("npm test"));
    test("hidden tests pass", () => expect(r.hiddenTestsPass()).toBe(true));
  });
}
