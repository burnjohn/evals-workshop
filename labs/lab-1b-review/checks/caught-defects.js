// Every defect a person labelled in case.yaml is caught. Score: the share caught.
import { scoreCase } from "../../../lib/review.js";
import { caseOf, findings } from "./_answer.js";

export default function (output, context) {
  const c = caseOf(context), s = scoreCase(findings(output) ?? [], c);
  if (s.defects.length === 0) return { pass: true, score: 1, reason: "no defects to catch in this case" };
  return { pass: s.missed.length === 0, score: s.caught.length / s.defects.length, reason: `caught ${s.caught.length}/${s.defects.length}${s.missed.length ? `, missed ${s.missed.join(" ")}` : ""}` };
}
