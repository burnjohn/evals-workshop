// A case with defects: [] is a clean change. The right answer is no findings.
import { scoreCase } from "../../../lib/review.js";
import { caseOf, findings } from "./_answer.js";

export default function (output, context) {
  const s = scoreCase(findings(output) ?? [], caseOf(context));
  return { pass: s.falseAlarms.length === 0, score: s.falseAlarms.length ? 0 : 1, reason: s.falseAlarms.length ? `${s.falseAlarms.length} false alarms: ${s.falseAlarms.map(f => f.title).join("; ")}` : "no false alarms" };
}
