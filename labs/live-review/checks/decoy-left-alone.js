// A decoy looks like a bug and is not (case.yaml: decoys). Flagging it is a false alarm.
import { caseNamed, score } from "../review.js";

export default function (output, context) {
  const s = score(output, caseNamed(context.vars.case));
  return { pass: s.decoys.length === 0, score: s.decoys.length ? 0 : 1,
    reason: s.decoys.length ? `flagged the decoy ${s.decoys.join(" ")}` : "decoys left alone" };
}
