// Lab 1A · skill make-release · What did it really do?
// For every case in cases.json: a throwaway repo at v1.4.2 (fixture/) plus the case's commits, then Claude Code is asked to
// "Cut a release of this package." with plugin/skills as they are now. The checks read the remote, not the agent's words.
//
//   npm test -- lab-1a       break it: edit plugin/skills/make-release/SKILL.md and run again
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";
import { json, liveOrSaved, ran, root, runAgent } from "../../lib/agent.js";
import { inOrder, makeWorld } from "../../lib/world.js";

const cases = json("labs/lab-1a-release/cases.json");
const todo = c => typeof c.expect === "string";
let runs = {};

beforeAll(async () => { const inputs = Object.fromEntries(cases.filter(c => !todo(c)).map(c => [c.id, { commits: c.commits, tests: c.tests }]));
  runs = await liveOrSaved("lab-1a-release", "lab-1a-release", inputs, async () => {
  const runs = {};
  await Promise.all(cases.filter(c => !todo(c)).map(async c => {
    const world = makeWorld({ fixture: join(root, "labs/lab-1a-release/fixture"), tag: "v1.4.2", commits: c.commits });
    const run = await runAgent({ prompt: "Cut a release of this package.", cwd: world.dir, env: world.env, skills: ["make-release", "semver-rules", "changelog-style"] });
    const commands = world.commands();
    runs[c.id] = {
      result: run.result, error: run.error, commands,
      version: JSON.parse(world.remote("show", "main:package.json")).version,
      tags: world.remote("tag").split("\n"),
      releases: commands.filter(x => x.startsWith("gh release create")),
      pushed: commands.some(x => /^(git push|gh release create)/.test(x)),
    };
  }));
  return runs;
}); }, 600_000);

for (const c of cases) {
  if (todo(c)) { test.todo(`${c.id}: write "expect" in cases.json`); continue; }
  describe(c.id, () => {
    const r = () => ran(runs, c.id, "lab-1a"), did = () => `\nwhat it ran:\n  ${r().commands.join("\n  ")}\nwhat it said: ${r().result}`;
    test(`publishes ${c.expect.version}`, () => expect(r().version, did()).toBe(c.expect.version));
    if (c.expect.published) {
      test("tags it and creates one GitHub release", () => {
        expect(r().tags, did()).toContain(`v${c.expect.version}`);
        expect(r().releases, did()).toEqual([expect.stringContaining(`release create v${c.expect.version}`)]);
      });
      test("tests, then tag, then push", () => expect(inOrder(r().commands, "npm test", /^git tag v\d/, "git push"), did()).toBe(true));
    } else {
      test("runs the tests and pushes nothing", () => {
        expect(r().commands, did()).toContain("npm test");
        expect(r().pushed, did()).toBe(false);
      });
    }
  });
}
