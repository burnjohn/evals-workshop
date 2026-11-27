// A clean change (defects: []) gets no CRITICAL finding. A WARNING is shown in the reason but does not fail.
import { caseNamed, score } from "../review.js";

export default function (output, context) {
  const s = score(output, caseNamed(context.vars.case));
  if (!s.clean) return { pass: true, score: 1, reason: "not a clean change" };
  const critical = s.alarms.filter(f => String(f.severity).toUpperCase() === "CRITICAL");
  return { pass: critical.length === 0, score: critical.length ? 0 : 1,
    reason: s.alarms.length ? `${critical.length} CRITICAL, ${s.alarms.length - critical.length} WARNING: ${s.alarms.map(f => f.title).join("; ")}` : "no findings" };
}
