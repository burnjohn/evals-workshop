// Lab 3. The trace is the log the runtime already writes (stream-json). The parser turns it into facts.
import { load } from "./recording.js";
import { parseTrace } from "./trace.js";
export function loadRun(text = load("lab-3")) {
  const w = parseTrace(text.split("\n").filter(Boolean));
  const firstReview = w.of("code-review")[0]?.start ?? Infinity;
  const builders = w.of("implementer").filter(r => r.start < firstReview);      // a fix loop runs implementers again
  const stages = [...w.runs].sort((a, b) => a.start - b.start).filter(r => r.role !== "implementer").map(r => r.role);
  return { w, builders, stages };
}
