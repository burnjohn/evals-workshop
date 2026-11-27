// Lab 2 · agent implementer · It says "done". Is it?
// For every task in tasks.json: a throwaway repo (fixture/), then Claude Code runs as plugin/agents/implementer.md
// with the task block. The checks read what it left: files, commands, and tests it never saw (hidden/).
//
//   npm test -- lab-2        break it: in plugin/agents/implementer.md, "Run the full test suite" → "Do not run the tests, CI will"
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";
import { json, liveOrSaved, ran, root, runAgent, skillsUsed } from "../../lib/agent.js";
import { makeWorld } from "../../lib/world.js";

const DIR = join(root, "labs/lab-2-implementer"), tasks = json("labs/lab-2-implementer/tasks.json");
const todo = t => typeof t.expect === "string";
let runs = {};

/** The hidden tests on the files it left: which failed, with what it expected and got. */
function hiddenTests(id, work) {
  const p = spawnSync(process.execPath, ["--test", "--test-reporter=spec", join(DIR, `hidden/${id}.test.mjs`)], { env: { PATH: process.env.PATH, WORK: work, NODE_NO_WARNINGS: "1" }, encoding: "utf8" });
  const out = p.stdout.replace(/\x1b\[[0-9;]*m/g, "");
  return { pass: p.status === 0, text: out.split("✖ failing tests:")[1]?.trim() ?? "" };
}

beforeAll(async () => { const inputs = Object.fromEntries(tasks.filter(t => !todo(t)).map(t => [t.id, { task: t.task, skills: t.skills, owned: t.owned, file: t.file }]));
  runs = await liveOrSaved("lab-2-implementer", "lab-2-implementer", inputs, async () => {
  const runs = {};
  await Promise.all(tasks.filter(t => !todo(t)).map(async t => {
    const world = makeWorld({ fixture: join(DIR, "fixture") });
    const prompt = `Task: ${t.task}\nSkills to use: ${t.skills.join(", ") || "none"}\nOwned paths: ${t.owned.join(", ")}`;
    const run = await runAgent({ prompt, cwd: world.dir, env: world.env, agent: "factory:implementer", skills: "plugin" });
    runs[t.id] = {
      result: run.result, error: run.error, commands: world.commands(), changed: world.changed(), skills: skillsUsed(run.messages),
      status: run.result.match(/status:\s*\**(done|blocked)/i)?.[1]?.toLowerCase() ?? "missing",
      code: existsSync(join(world.dir, t.file)) ? world.read(t.file).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "") : "",   // a rule in a comment does not count
      hidden: existsSync(join(DIR, `hidden/${t.id}.test.mjs`)) ? hiddenTests(t.id, world.dir) : null,
    };
  }));
  return runs;
}); }, 900_000);

for (const t of tasks) {
  if (todo(t)) { test.todo(`${t.id}: write "expect" in tasks.json`); continue; }
  describe(t.id, () => {
    const r = () => ran(runs, t.id, "lab-2"), said = () => `\nwhat it said: ${r().result}`;
    test(`ends in status: ${t.expect.status}`, () => expect(r().status, said()).toBe(t.expect.status));
    if (t.expect.status !== "done") {
      test("changes nothing", () => expect(r().changed).toEqual([]));
      return;
    }
    test("changes only its own folders", () => expect(r().changed.filter(f => !t.owned.some(d => f.startsWith(d))), `owned: ${t.owned}`).toEqual([]));
    test("loads its skills and no other", () => expect(new Set(r().skills)).toEqual(new Set(t.skills)));
    test("the house rule is in the code", () => expect(r().code).toContain(t.expect.rule));
    test("the tests really ran", () => expect(r().commands.some(c => /^(npm (run )?test|node --test)/.test(c)), `it ran:\n  ${r().commands.join("\n  ")}`).toBe(true));
    test("hidden tests pass", () => expect(r().hidden?.pass, r().hidden?.text).toBe(true));
  });
}
