// Lab 1B · skill code-review · What did it find, what did it miss, what did it invent?
// For every case in cases/: Claude Code (Haiku, your login) gets the skill, spec.md and the case's patch, and answers
// with findings as JSON. They are scored against the defects a person labelled in case.yaml.
//
//   npm test -- lab-1b                                                  the skill in plugin/skills/code-review
//   SKILL=labs/lab-1b-review/versions/code-review.v2.md npm test -- lab-1b   another version
//   break it: in plugin/skills/code-review/SKILL.md, make it "review ONLY for security, at most 5 findings"
import { beforeAll, expect, test } from "vitest";
import { liveOrSaved, ran, runAgent } from "../../lib/agent.js";
import { findings, isTodo, reviewCases, reviewPrompt, scoreCase } from "../../lib/review.js";

const SKILL = process.env.SKILL ?? "plugin/skills/code-review/SKILL.md";
const all = reviewCases(), labelled = all.filter(c => !isTodo(c.defects));
let per = {};

for (const c of all) if (isTodo(c.defects)) test.todo(`label cases/${c.name}/case.yaml: which defects does it have?`);

// SKILL=another version runs live only: runs/lab-1b-review.json keeps the result of the skill in the plugin
beforeAll(async () => { const run = async () => {
  const per = {};
  await Promise.all(labelled.map(async c => {
    const r = await runAgent({ prompt: reviewPrompt(SKILL, c), tools: [], maxTurns: 1 });
    const f = findings(r.result);
    per[c.name] = { answer: r.result, json: f !== null, found: f ?? [], ...scoreCase(f ?? [], c) };
  }));
  return per;
}; per = process.env.SKILL ? await run() : await liveOrSaved("lab-1b-review", "lab-1b-review", Object.fromEntries(labelled.map(c => [c.name, c.inputText])), run); }, 300_000);

const sum = k => labelled.flatMap(c => ran(per, c.name, "lab-1b")[k]);
const found = () => labelled.map(c => `\n  ${c.name}: ${ran(per, c.name, "lab-1b").found.map(f => `${f.file.split("/").pop()}:${f.start_line} ${f.title}`).join(" | ") || "nothing"}`).join("");

test("answers with JSON findings on every case", () =>
  expect(labelled.filter(c => !ran(per, c.name, "lab-1b").json).map(c => `${c.name}: ${ran(per, c.name, "lab-1b").answer.slice(0, 200)}`)).toEqual([]));

test("1. catches every security defect (T1)", () =>
  expect(sum("missed").filter(id => id.startsWith("T1")), `what it found:${found()}`).toEqual([]));

test("2. catches at least 70% of the labelled defects", () =>
  expect(sum("caught").length, `missed: ${sum("missed").join(", ")}\nwhat it found:${found()}`).toBeGreaterThanOrEqual(Math.ceil(sum("defects").length * 0.7)));

test("3. leaves the decoy alone: POST /view is public on purpose", () =>
  expect(sum("decoys")).toEqual([]));

test("4. a clean PR gets no CRITICAL finding, and at most 1 WARNING per case", () => {
  const alarms = sum("falseAlarms"), show = alarms.map(f => `\n  ${f.severity} ${f.file}:${f.start_line} ${f.title}`).join("");
  expect(alarms.filter(f => f.severity === "CRITICAL").length, show).toBe(0);
  for (const c of labelled) expect(ran(per, c.name, "lab-1b").falseAlarms.length, `${c.name}:${show}`).toBeLessThanOrEqual(1);
});

test("every case is filled in the same shape", () => {
  for (const c of all) {
    expect(c, c.name).toMatchObject({ source: expect.stringMatching(/^(real|synthetic)$/), input: expect.any(String) });
    if (!isTodo(c.defects)) for (const d of c.defects)
      expect(d, `${c.name}: ${JSON.stringify(d)}`).toMatchObject({ id: expect.any(String), file: expect.any(String), lines: [expect.any(Number), expect.any(Number)], why: expect.any(String) });
  }
});
