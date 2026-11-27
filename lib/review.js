// Lab 1B. The prompt for one version of the code-review skill, and the score of its findings against
// the defects a person labelled in cases/*/case.yaml. Used by review.test.js and by the promptfoo matrix.
import { body, read } from "./agent.js";
import { cases } from "./cases.js";
const DIR = "labs/lab-1b-review", SLACK = 1;
export const isTodo = v => typeof v === "string" && v.startsWith("TODO");

/** The lines a patch adds: { file: Set(lines) }. Findings outside them are not scored. */
export function shownLines(patch) {
  const shown = {}; let file, n = 0;
  for (const l of patch.split("\n")) {
    if (l.startsWith("+++ b/")) { file = l.slice(6); shown[file] ??= new Set(); continue; }
    const h = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(l); if (h) { n = +h[1]; continue; }
    if (file && l.startsWith("+")) shown[file].add(n++);
  }
  return shown;
}

/** The review cases, each with the lines its patch shows. */
export const reviewCases = () => cases(`${DIR}/cases`).map(c => ({ ...c, shown: shownLines(c.inputText) }));

/** The prompt: the skill's instructions (null = the no-skill control: the task and the output contract only), the spec, the patch. */
export function reviewPrompt(skillPath, c) {
  const contract = body("plugin/skills/code-review/SKILL.md").split("\n").filter(l => /^(Report only lines|Return JSON|`severity`)/.test(l)).join("\n");
  const skill = skillPath ? body(skillPath) : `Review this pull request.\n\n${contract}`;
  return `${skill}\n\n## The spec this PR must meet\n\n${read(`${DIR}/spec.md`)}\n\n## The pull request\n\n${c.inputText}\n\nAnswer with the JSON only.`;
}

/** The findings in an answer, or null when it is not JSON of the agreed shape. */
export function findings(output) {
  const text = String(output).trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  try { const j = JSON.parse(text); return Array.isArray(j.findings) ? j.findings : null; } catch { return null; }
}

const touches = (f, d) => f.file === d.file && f.start_line <= d.lines[1] + SLACK && (f.end_line ?? f.start_line) >= d.lines[0] - SLACK;
const inside = shown => f => [...(shown[f.file] ?? [])].some(l => l >= f.start_line && l <= (f.end_line ?? f.start_line));

/** What one answer caught, missed, and got wrong on one case. */
export function scoreCase(found, c) {
  const mine = found.filter(inside(c.shown)), used = new Set();   // one finding can hit one defect
  const defects = isTodo(c.defects) ? [] : c.defects;
  const caught = defects.filter(d => { const f = mine.find(f => !used.has(f) && touches(f, d)); return f && used.add(f); });
  return {
    defects: defects.map(d => d.id), caught: caught.map(d => d.id),
    missed: defects.filter(d => !caught.includes(d)).map(d => d.id),
    decoys: (c.decoys ?? []).filter(d => mine.some(f => touches(f, d) && new RegExp(d.match, "i").test(f.title))).map(d => d.id),
    falseAlarms: defects.length === 0 && !isTodo(c.defects) ? mine : [],
  };
}
