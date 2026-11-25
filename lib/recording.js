// Where each lab keeps its data, and how a saved run is found. Replaying a run needs no model and no key.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
export const root = new URL("../", import.meta.url);
export const read = path => readFileSync(new URL(path, root), "utf8");
export const json = path => JSON.parse(read(path));
export const which = () => process.env.RECORDING ?? "good";      // good | broken | live (judge only)

// inputs: the prompts a run depends on. If one changes, the saved runs are stale and must be made again.
// runs: which saved run is "good" (before the break) and which is "broken" (after it).
export const LABS = {
  "lab-1a": { dir: "labs/lab-1a-release", inputs: ["plugin/skills/make-release/SKILL.md", "plugin/skills/semver-rules/SKILL.md", "plugin/skills/changelog-style/SKILL.md"] },
  "lab-1b": { dir: "labs/lab-1b-review", inputs: ["plugin/skills/code-review/SKILL.md"], runs: { good: "general", broken: "security" } },
  "lab-2": { dir: "labs/lab-2-implementer", inputs: ["plugin/agents/implementer.md", "plugin/skills/api-rules/SKILL.md", "plugin/skills/ui-rules/SKILL.md", "plugin/skills/db-rules/SKILL.md", "labs/lab-2-implementer/tasks.json"] },
  "lab-3": { dir: "labs/lab-3-workflow", inputs: ["plugin/skills/run-plan/SKILL.md", "plugin/agents/implementer.md", "plugin/agents/code-review.md", "plugin/agents/test-writer.md", "plugin/agents/qa.md", "plugin/agents/make-release.md", "labs/lab-3-workflow/plan.md"], ext: "jsonl" },
  "judge": { dir: "labs/judge", inputs: ["labs/judge/judge.md", "labs/judge/notes.json"] },
};
export const dir = lab => LABS[lab].dir;
export const runName = (lab, name = which()) => LABS[lab].runs?.[name] ?? name;
export const runPath = (lab, name) => `${dir(lab)}/runs/${runName(lab, name)}.${LABS[lab].ext ?? "json"}`;
export const load = (lab, name) => LABS[lab].ext ? read(runPath(lab, name)) : json(runPath(lab, name));
export const meta = lab => json(`${dir(lab)}/runs/meta.json`);
export const inputHash = lab => createHash("sha256").update(LABS[lab].inputs.map(read).join("\n")).digest("hex").slice(0, 12);

/** The expected values you write. A value that still says TODO is not labelled yet. */
export const expected = lab => json(`${dir(lab)}/expected.json`);
export const isTodo = v => typeof v === "string" && v.startsWith("TODO");
