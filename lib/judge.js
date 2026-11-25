// Judge lab. Before you trust a judge, compare it with a person on the same notes.
import { expected, isTodo, load } from "./recording.js";
export const labelled = () => Object.entries(expected("judge")).filter(([k, v]) => k !== "how" && !isTodo(v)).map(([id, v]) => ({ id, ...v }));
export function compare(human = labelled(), judge = load("judge")) {
  for (const h of human) if (!["pass", "fail"].includes(judge[h.id]?.verdict)) throw new Error(`no verdict for ${h.id}: the judge has NOT run`);
  if (!human.length) throw new Error("no labels: nothing to compare with");
  const bad = human.filter(h => h.verdict === "fail"), good = human.filter(h => h.verdict === "pass");
  const says = (h, v) => judge[h.id].verdict === v;
  return {
    caught: bad.filter(h => says(h, "fail")).length, bad: bad.length,
    falseAlarms: good.filter(h => says(h, "fail")).map(h => h.id), good: good.length,
    agreement: human.filter(h => says(h, h.verdict)).length / human.length,
  };
}
