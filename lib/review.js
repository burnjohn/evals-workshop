// Lab 1B. Scores a reviewer's findings against the defects a person labelled in expected.json.
import { readdirSync } from "node:fs";
import { dir, expected, isTodo, json, load, read, root } from "./recording.js";
const DIR = dir("lab-1b"), SLACK = 1;

/** The lines each PR shows: { pr: { file: Set(lines) } }. Findings outside them are not scored. */
export function prs() {
  const out = {};
  for (const f of readdirSync(new URL(`${DIR}/prs/`, root)).sort()) {
    const pr = f.replace(".patch", ""), shown = (out[pr] = {}); let file, n = 0;
    for (const l of read(`${DIR}/prs/${f}`).split("\n")) {
      if (l.startsWith("+++ b/")) { file = l.slice(6); shown[file] ??= new Set(); continue; }
      const h = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(l); if (h) { n = +h[1]; continue; }
      if (file && l.startsWith("+")) shown[file].add(n++);
    }
  }
  return out;
}

const touches = (f, file, [a, b]) => f.file === file && f.start_line <= b + SLACK && (f.end_line ?? f.start_line) >= a - SLACK;

/** What one reviewer caught, missed, and got wrong, on the labelled PRs only. */
export function score(run, exp = expected("lab-1b")) {
  const shown = prs(), labelled = Object.keys(shown).filter(pr => !isTodo(exp.prs[pr]));
  const inPr = pr => f => [...(shown[pr][f.file] ?? [])].some(l => l >= f.start_line && l <= (f.end_line ?? f.start_line));
  const defects = labelled.flatMap(pr => exp.prs[pr].map(d => ({ ...d, pr })));
  const used = new Set();      // one finding can hit one defect
  const caught = defects.filter(d => { const f = run.findings.find(f => !used.has(f) && touches(f, d.file, d.lines)); return f && used.add(f); });
  const decoys = exp.decoys.filter(d => run.findings.some(f => touches(f, d.file, d.lines) && new RegExp(d.match, "i").test(f.title)));
  const clean = labelled.filter(pr => exp.prs[pr].length === 0);
  return {
    labelled, unlabelled: Object.keys(shown).filter(pr => !labelled.includes(pr)),
    defects: defects.map(d => d.id), caught: caught.map(d => d.id), missed: defects.filter(d => !caught.includes(d)).map(d => d.id),
    decoys: decoys.map(d => d.id),
    falseAlarms: run.findings.filter(f => clean.some(pr => inPr(pr)(f))),
  };
}

export const reviewer = name => load("lab-1b", name);
export const allRuns = () => readdirSync(new URL(`${DIR}/runs/`, root)).filter(f => f !== "meta.json").map(f => ({ name: f.replace(".json", ""), ...json(`${DIR}/runs/${f}`) }));
