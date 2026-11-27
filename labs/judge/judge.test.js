// Judge · Can you trust the LLM judge?
// For every note in cases.json, Claude Code (Haiku, your login) answers with judge.md as its only instructions.
// Then its verdicts are compared with the person's. Agreement alone lies: count both kinds of mistake.
//
//   npm test -- judge       break it: in judge.md, "If the note is too vague to tell, the verdict is `fail`" → `pass`
import { beforeAll, expect, test } from "vitest";
import { json, liveOrSaved, ran, read, runAgent } from "../../lib/agent.js";

const cases = json("labs/judge/cases.json");
const labelled = cases.filter(c => typeof c.person === "object");
let judge = {}; const VOTES = Number(process.env.VOTES ?? 3);

for (const c of cases) if (!labelled.includes(c)) test.todo(`${c.id}: label it as a person in cases.json`);

beforeAll(async () => { judge = await liveOrSaved("judge", "judge", Object.fromEntries(labelled.map(c => [c.id, c.note])), async () => {
  const judge = {};
  const system = read("labs/judge/judge.md");
  const once = async note => { const r = await runAgent({ prompt: `<note>\n${note}\n</note>`, system, tools: [], maxTurns: 1 });
    return r.result.match(/\b(pass|fail)\b/gi)?.at(-1)?.toLowerCase() ?? "no verdict"; };     // the last pass/fail it wrote
  // a judge answers differently from run to run: ask it VOTES times (default 3) and take the majority
  await Promise.all(labelled.map(async c => {
    const votes = await Promise.all(Array.from({ length: VOTES }, () => once(c.note)));
    const fails = votes.filter(v => v === "fail").length, passes = votes.filter(v => v === "pass").length;
    judge[c.id] = { verdict: fails > VOTES / 2 ? "fail" : passes > VOTES / 2 ? "pass" : "no verdict", votes: votes.join(" ") };
  }));
  return judge;
}); }, 300_000);

const bad = () => labelled.filter(c => c.person.verdict === "fail"), good = () => labelled.filter(c => c.person.verdict === "pass");
const show = list => list.map(c => `\n  ${c.id} person: ${c.person.verdict}, judge: ${ran(judge, c.id, "judge").verdict} (${ran(judge, c.id, "judge").votes}) · ${c.note}`).join("");

test("the judge gives a verdict on every note", () =>
  expect(labelled.filter(c => !["pass", "fail"].includes(ran(judge, c.id, "judge").verdict)).map(c => c.id)).toEqual([]));

test("1. fails every note the person failed", () => {
  const missed = bad().filter(c => ran(judge, c.id, "judge").verdict !== "fail");
  expect(missed.length, `passed what the person failed:${show(missed)}`).toBe(0);
});

test("2. false alarms on at most 10% of the good notes", () => {
  const alarms = good().filter(c => ran(judge, c.id, "judge").verdict === "fail");
  expect(alarms.length, `failed what the person passed:${show(alarms)}`).toBeLessThanOrEqual(Math.floor(good().length * 0.1));
});
