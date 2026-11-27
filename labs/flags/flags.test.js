// Demo 3 · implementer · A new feature goes out behind a flag, off by default
//
// For every case in cases.json: a throwaway repo (fixture/), then Claude Code runs as plugin/agents/implementer.md
// with the task and the skill ui-rules. About 1 minute.
// The checks read what it left: they render web/settings.js with every flag off and every flag on, and read flags.json.
//
//   npm test -- flags        today plain is red: ui-rules says nothing about flags.
//                            Fix it: add to plugin/skills/ui-rules/SKILL.md
//                            "Every new UI feature is behind a new flag in flags.json, off by default."
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, test } from "vitest";
import { json, liveOrSaved, ran, root, runAgent, skillsUsed } from "../../lib/agent.js";
import { makeWorld } from "../../lib/world.js";

const DIR = join(root, "labs/flags"), cases = json("labs/flags/cases.json");
const SKILLS = ["ui-rules"], OWNED = ["web/", "flags.json"], USER = { name: "Ann" };
const BEFORE = Object.keys(JSON.parse(readFileSync(join(DIR, "fixture/flags.json"), "utf8")));
let runs = {};

// <look> What the agent left: its flags.json, and the settings page with every flag off, then every flag on.
async function look(dir) {
  const out = { added: [], values: {}, off: null, on: null, error: null };
  try {
    const flags = JSON.parse(readFileSync(join(dir, "flags.json"), "utf8"));
    out.values = Object.fromEntries(Object.entries(flags).map(([k, v]) => [k, v && typeof v === "object" ? v.default : v]));
    out.added = Object.keys(flags).filter(k => !BEFORE.includes(k));
    const { renderSettings } = await import(`${pathToFileURL(join(dir, "web/settings.js")).href}?at=${Date.now()}`);
    out.off = renderSettings(USER, Object.fromEntries(Object.keys(out.values).map(k => [k, false])));
    out.on = renderSettings(USER, Object.fromEntries(Object.keys(out.values).map(k => [k, true])));
  } catch (e) { out.error = e.message; }
  return out;
}
// </look>

beforeAll(async () => {
  const inputs = Object.fromEntries(cases.map(c => [c.id, { task: c.task, skills: SKILLS, owned: OWNED }]));

  const runAll = async () => {
    const results = await Promise.all(cases.map(async c => {
      const world = makeWorld({ fixture: join(DIR, "fixture") });
      const prompt = `Task: ${c.task}\nSkills to use: ${SKILLS.join(", ")}\nOwned paths: ${OWNED.join(", ")}`;
      const run = await runAgent({ prompt, cwd: world.dir, env: world.env, agent: "factory:implementer", skills: "plugin" });
      return [c.id, {
        result: run.result, error: run.error, changed: world.changed(), skills: skillsUsed(run.messages),
        status: run.result.match(/status:\s*\**(done|blocked)/i)?.[1]?.toLowerCase() ?? "missing",
        ...(await look(world.dir)),
      }];
    }));
    return Object.fromEntries(results);
  };

  runs = await liveOrSaved("flags", "flags", inputs, runAll);
}, 900_000);

for (const c of cases) {
  describe(c.id, () => {
    const r = () => ran(runs, c.id, "flags");
    const page = () => `\nflags.json: ${JSON.stringify(r().values)}\nflags off:\n${r().off}\nflags on:\n${r().on}${r().error ? `\nerror: ${r().error}` : ""}`;

    test("ends in status: done", () => expect(r().status, `what it said: ${r().result}`).toBe("done"));

    test("with every flag on, the page has the toggle", () => expect(r().on ?? "", page()).toMatch(/dark/i));

    test("with every flag off, the page is as before: no toggle", () => {
      expect(r().off ?? "", page()).not.toMatch(/dark/i);
      expect(r().off ?? "", page()).toContain('data-track="settings_save"');
    });

    test("a new flag in flags.json, off by default", () => {
      expect(r().added, page()).not.toEqual([]);
      expect(r().added.map(k => r().values[k]), page()).toEqual(r().added.map(() => false));
    });

    test("loads ui-rules (why it went red is often here)", () => expect(r().skills).toContain("ui-rules"));
  });
}
