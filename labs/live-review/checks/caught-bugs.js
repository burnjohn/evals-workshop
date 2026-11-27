// Every bug a person labelled in case.yaml is reported, on the right lines. Score: the share caught.
import { caseNamed, score } from "../review.js";

export default function (output, context) {
  const s = score(output, caseNamed(context.vars.case));
  if (s.clean) return { pass: true, score: 1, reason: "a clean change: nothing to catch" };
  return { pass: s.missed.length === 0, score: s.caught.length / s.defects.length,
    reason: `caught ${s.caught.length}/${s.defects.length}${s.missed.length ? `, missed ${s.missed.join(" ")}` : ""}${s.parsed ? "" : " (the answer is not JSON)"}` };
}
