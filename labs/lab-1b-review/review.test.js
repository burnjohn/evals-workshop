// Lab 1B · code-review · What did it find, what did it miss, what did it invent?
// The data is real: four slices of a real PR, and real answers from DeepSeek V4.1 Flash.
// Your job is the answer key: expected.json. Read the PRs first:  npm run show -- lab-1b
import { expect, test } from "vitest";
import { expected, isTodo } from "../../lib/recording.js";
import { reviewer, score } from "../../lib/review.js";

const exp = expected("lab-1b"), r = score(reviewer());

for (const pr of r.unlabelled) test.todo(`label PR ${pr}: what defects does it have?`);

test("1. catches every security defect (T1)", () =>
  expect(r.missed.filter(id => id.startsWith("T1"))).toEqual([]));

test("2. catches at least 90% of the labelled defects", () =>
  expect(r.caught.length, `missed: ${r.missed.join(", ")}`).toBeGreaterThanOrEqual(Math.ceil(r.defects.length * 0.9)));

test("3. leaves the decoy alone: POST /view is public on purpose", () =>
  expect(r.decoys).toEqual([]));

test("4. a clean PR gets no findings", () =>
  expect(r.falseAlarms.map(f => `${f.file}:${f.start_line} ${f.title}`)).toEqual([]));

test("the answer key is filled in the same shape everywhere", () => {
  for (const [pr, list] of Object.entries(exp.prs)) if (!isTodo(list))
    for (const d of list) expect(d, `${pr}: ${JSON.stringify(d)}`).toMatchObject({ id: expect.any(String), file: expect.any(String), lines: [expect.any(Number), expect.any(Number)] });
});
