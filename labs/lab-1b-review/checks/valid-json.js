// The next tool parses this answer. Not JSON, or no findings array: fail.
import { findings } from "./_answer.js";

export default function (output) {
  const f = findings(output);
  if (!f) return { pass: false, score: 0, reason: "not JSON of the shape { findings: [...] }" };
  const bad = f.filter(x => !x.file || !Number.isInteger(x.start_line) || !x.severity || !x.title);
  return { pass: bad.length === 0, score: bad.length ? 0 : 1, reason: bad.length ? `${bad.length} findings miss file, start_line, severity or title` : `${f.length} findings, all well formed` };
}
