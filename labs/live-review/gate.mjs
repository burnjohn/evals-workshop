// The merge rule on top of the matrix: node labs/live-review/gate.mjs <promptfoo output.json>
// Compares the "pr" column with "base" over every case and every repeat. Red (exit 1) when the PR is worse.
// Prints a markdown report; in GitHub Actions it also goes to the job summary.
import { appendFileSync, readFileSync } from "node:fs";
import { caseNamed, reviewCases, score } from "./review.js";

const RULES = {
  recallDrop: 0.10,      // the PR may catch at most 10 points fewer bugs than base: room for the model's noise
  recallMin: 0.60,       // and never fewer than 60% of them
  severityDrop: 0.15,    // the right severity on caught bugs: at most 15 points below base
  slack: 1 / 3,          // decoys and clean-PR alarms: one more in three runs than base is still noise
};

const out = JSON.parse(readFileSync(process.argv[2], "utf8"));
const rows = (out.results?.results ?? out.results ?? []).map(r => ({
  column: r.prompt?.label, name: r.vars?.case, s: score(r.response?.output ?? "", caseNamed(r.vars?.case)), error: r.error,
}));

function stats(column) {
  const mine = rows.filter(r => r.column === column), sum = f => mine.reduce((n, r) => n + f(r), 0);
  const defects = sum(r => r.s.defects.length), caught = sum(r => r.s.caught.length);
  const withDecoys = mine.filter(r => (caseNamed(r.name).decoys ?? []).length), clean = mine.filter(r => r.s.clean);
  return {
    runs: mine.length, notJson: sum(r => !r.s.parsed),
    recall: defects ? caught / defects : 1,
    severity: caught ? sum(r => r.s.severityRight.length) / caught : 1,
    decoys: withDecoys.length ? withDecoys.filter(r => r.s.decoys.length).length / withDecoys.length : 0,
    cleanCritical: clean.length ? clean.filter(r => r.s.alarms.some(f => String(f.severity).toUpperCase() === "CRITICAL")).length / clean.length : 0,
    cleanWarnings: clean.length ? sum(r => r.s.clean ? r.s.alarms.length : 0) / clean.length : 0,
    perCase: Object.fromEntries(reviewCases().map(c => { const rs = mine.filter(r => r.name === c.name); return [c.name, rs]; })),
  };
}

const base = stats("base"), pr = stats("pr"), none = stats("no-skill");
if (!base.runs || !pr.runs) { console.error("no base or pr results in", process.argv[2]); process.exit(2); }

const pct = x => `${Math.round(x * 100)}%`;
const checks = [
  { name: "caught bugs", base: pct(base.recall), pr: pct(pr.recall), none: pct(none.recall),
    ok: pr.recall >= base.recall - RULES.recallDrop && pr.recall >= RULES.recallMin,
    rule: `≥ base − ${RULES.recallDrop * 100} pts and ≥ ${RULES.recallMin * 100}%` },
  { name: "right severity", base: pct(base.severity), pr: pct(pr.severity), none: pct(none.severity),
    ok: pr.severity >= base.severity - RULES.severityDrop, rule: `≥ base − ${RULES.severityDrop * 100} pts` },
  { name: "decoy flagged", base: pct(base.decoys), pr: pct(pr.decoys), none: pct(none.decoys),
    ok: pr.decoys <= base.decoys + RULES.slack + 1e-9, rule: "≤ base (+1 in 3 runs)" },
  { name: "CRITICAL on a clean PR", base: pct(base.cleanCritical), pr: pct(pr.cleanCritical), none: pct(none.cleanCritical),
    ok: pr.cleanCritical <= base.cleanCritical + RULES.slack + 1e-9, rule: "≤ base (+1 in 3 runs)" },
  { name: "WARNINGs on a clean PR (avg)", base: base.cleanWarnings.toFixed(1), pr: pr.cleanWarnings.toFixed(1), none: none.cleanWarnings.toFixed(1),
    ok: true, rule: "shown, not blocking" },
  { name: "answers that are not JSON", base: base.notJson, pr: pr.notJson, none: none.notJson, ok: true, rule: "shown: they catch nothing" },
];
const red = checks.filter(c => !c.ok);

const cell = rs => rs.length ? rs.map(r => r.s.clean ? (r.s.alarms.length ? `⚠${r.s.alarms.length}` : "·") : `${r.s.caught.length}/${r.s.defects.length}`).join(" ") : "–";
const lines = [
  `## ${red.length ? "❌" : "✅"} Live review eval: code-review skill, \`pr\` vs \`base\``,
  "",
  `deepseek-v4-flash via OpenRouter · ${reviewCases().length} cases × ${pr.runs / reviewCases().length} runs per column`,
  "",
  "| Check | no-skill | base | pr | Rule | |", "|---|---|---|---|---|---|",
  ...checks.map(c => `| ${c.name} | ${c.none} | ${c.base} | **${c.pr}** | ${c.rule} | ${c.ok ? "✅" : "❌"} |`),
  "",
  "<details><summary>Per case: bugs caught in each run (· = clean PR, nothing reported; ⚠n = n findings on a clean PR)</summary>",
  "",
  "| Case | no-skill | base | pr |", "|---|---|---|---|",
  ...reviewCases().map(c => `| ${c.name} | ${cell(none.perCase[c.name] ?? [])} | ${cell(base.perCase[c.name])} | ${cell(pr.perCase[c.name])} |`),
  "", "</details>", "",
  red.length ? `**Red:** ${red.map(c => c.name).join(", ")} got worse in this PR.` : "**Green:** the skill in this PR is at least as good as the one it replaces.",
];
const report = lines.join("\n");
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n");
process.exit(red.length ? 1 : 0);
