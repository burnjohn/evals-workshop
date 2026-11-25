// Lab 1A · make-release · What did it really do?
// Inputs: cases.json. Answer key: expected.json, partly yours. Read what the agent did:  npm run show -- lab-1a
import { describe, expect, test } from "vitest";
import { expected, isTodo } from "../../lib/recording.js";
import { cases, runRelease } from "../../lib/release.js";

const exp = expected("lab-1a");

for (const c of cases()) {
  const want = exp[c.id];
  if (isTodo(want)) { test.todo(`${c.id}: write the expected version in expected.json`); continue; }
  describe(c.id, () => {
    const r = runRelease(c);
    test(`publishes ${want.version}`, () => expect(r.state.version).toBe(want.version));
    if (want.published) {
      test("tags it and creates the GitHub release", () => {
        expect(r.state.tags).toContain(`v${want.version}`);
        expect(r.gh).toEqual([expect.stringContaining(`release create v${want.version}`)]);
      });
      test("tests, then tag, then push", () => expect(r.order("npm test", "git tag", "git push")).toBe(true));
    } else {
      test("runs the tests and pushes nothing", () => {
        expect(r.commands).toContain("npm test");
        expect(r.pushed).toBe(false);
      });
    }
  });
}
