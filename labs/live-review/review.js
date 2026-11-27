// Live review: the prompt for one version of the code-review skill, and the score of one answer against the
// bugs a person labelled in cases/*/case.yaml. Used by the promptfoo checks and by gate.mjs.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { body, root } from "../../lib/agent.js";
import { cases } from "../../lib/cases.js";
import { shownLines } from "../../lib/review.js";

const SLACK = 1;                                   // a decoy is hit by a finding up to one line off

/** The findings in an answer, or null when there is no JSON of the agreed shape in it. A model may think aloud or
 *  wrap the JSON in a ``` fence first: we take the last { ... } that has a findings array. */
export function findings(output) {
  const text = String(output);
  const starts = [...text.matchAll(/\{\s*"findings"/g)].map(m => m.index);
  const tries = [text.trim(), ...[...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map(m => m[1]).reverse(), ...starts.reverse().map(i => text.slice(i))];
  for (const t of tries) {
    const end = t.lastIndexOf("}");
    try { const j = JSON.parse(t.slice(0, end + 1)); if (Array.isArray(j?.findings)) return j.findings; } catch { /* next */ }
  }
  return null;
}
export const PR_SKILL = "plugin/skills/code-review/SKILL.md";

export const reviewCases = () => cases("labs/live-review/cases").map(c => ({ ...c, shown: shownLines(c.inputText) }));
export const caseNamed = name => reviewCases().find(c => c.name === name);

/** The skill text for a column. "pr": the skill as it is in this checkout. "base": BASE_SKILL, the file from the
 *  branch the PR goes into (CI writes it); without it, the same file. "none": the control, no skill at all. */
export function skillText(column) {
  if (column === "none") return null;
  const base = process.env.BASE_SKILL;
  if (column === "base" && base) return existsSync(base) ? readFileSync(base, "utf8").replace(/^---[\s\S]*?---\n/, "").trim() : null;
  return body(PR_SKILL);
}

const CONTRACT = `Report only lines the PR added or changed, with their new line numbers.
Return JSON: \`{ "findings": [{ "file", "start_line", "end_line", "severity", "title" }] }\`.
\`severity\` is \`CRITICAL\` for a security hole, data loss or a broken requirement, otherwise \`WARNING\`.`;

export function reviewPrompt(column, c) {
  const skill = skillText(column) ?? `Review this pull request.\n\n${CONTRACT}`;
  return `${skill}\n\n## The pull request\n\n${c.inputText}\n\nAnswer with the JSON only.`;
}

const touches = (f, m) => f.file === m.file && f.start_line <= m.lines[1] + SLACK && (f.end_line ?? f.start_line) >= m.lines[0] - SLACK;
const about = (f, m) => new RegExp(m.match, "i").test(String(f.title ?? ""));

/** One answer on one case: which bugs it caught (and with the right severity), which decoys it flagged,
 *  and, on a clean case, what it reported anyway.
 *  A bug is caught by a finding in its file whose title is about it (case.yaml: match). Models count diff lines
 *  a few off, so the line numbers are not part of the match; a decoy still needs its lines and its topic. */
export function score(output, c) {
  const all = findings(output) ?? [], mine = all.filter(f => c.shown[f.file]), used = new Set();
  const hits = c.defects.map(d => { const f = mine.find(f => !used.has(f) && f.file === d.file && about(f, d)); if (f) used.add(f); return { d, f }; });
  const caught = hits.filter(h => h.f);
  return {
    parsed: findings(output) !== null,
    defects: c.defects.map(d => d.id),
    caught: caught.map(h => h.d.id),
    missed: hits.filter(h => !h.f).map(h => h.d.id),
    severityRight: caught.filter(h => String(h.f.severity).toUpperCase() === h.d.severity).map(h => h.d.id),
    decoys: (c.decoys ?? []).filter(d => mine.some(f => !used.has(f) && touches(f, d) && about(f, d))).map(d => d.id),
    clean: c.defects.length === 0,
    alarms: c.defects.length === 0 ? all : [],
  };
}
