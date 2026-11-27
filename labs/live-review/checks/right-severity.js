// A caught bug has the severity a person gave it: SQL injection is CRITICAL, not a WARNING.
import { caseNamed, score } from "../review.js";

export default function (output, context) {
  const s = score(output, caseNamed(context.vars.case));
  if (s.caught.length === 0) return { pass: true, score: 1, reason: "nothing caught, nothing to grade" };
  const wrong = s.caught.filter(id => !s.severityRight.includes(id));
  return { pass: wrong.length === 0, score: s.severityRight.length / s.caught.length,
    reason: wrong.length ? `wrong severity on ${wrong.join(" ")}` : "every caught bug has the right severity" };
}
