// Judge · Can you trust the LLM judge?
// Inputs: notes.json. Answer key: expected.json, a person's labels, partly yours.  npm run show -- judge
// Live: ANTHROPIC_API_KEY=... npm run judge:live, then RECORDING=live npm test -- judge
import { expect, test } from "vitest";
import { expected, isTodo } from "../../lib/recording.js";
import { compare } from "../../lib/judge.js";

for (const [id, v] of Object.entries(expected("judge"))) if (isTodo(v)) test.todo(`${id}: label it as a person`);
const r = compare();

test("1. fails every note the person failed", () =>
  expect(r.caught, `caught ${r.caught} of ${r.bad}`).toBe(r.bad));

test("2. false alarms on at most 10% of the good notes", () =>
  expect(r.falseAlarms.length, `false alarms: ${r.falseAlarms.join(", ")}`).toBeLessThanOrEqual(Math.floor(r.good * 0.1)));
