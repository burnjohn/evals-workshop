// Lab 3. Runs a plan with the run-plan skill, keeps the stream the agent wrote (the trace), and turns it into facts:
// who ran, on which model, with which skills, in which order. The stream is what `claude -p --output-format stream-json` writes.
import { join } from "node:path";
import { root, runAgent } from "./agent.js";
import { parseTrace } from "./trace.js";
import { makeWorld } from "./world.js";

const STAGES = ["code-review", "test-writer", "qa", "make-release"];

/** Only what the trace parser reads, so a saved run stays small. */
const slim = m => ({
  type: m.type, subtype: m.subtype, tool_use_id: m.tool_use_id, status: m.status, parent_tool_use_id: m.parent_tool_use_id ?? null, is_error: m.is_error, result: m.result,
  message: m.message && { model: m.message.model, content: Array.isArray(m.message.content) ? m.message.content.map(b =>
    b.type === "tool_use" ? { type: b.type, id: b.id, name: b.name, input: { skill: b.input?.skill, subagent_type: b.input?.subagent_type, description: b.input?.description } }
    : b.type === "tool_result" ? { type: b.type, tool_use_id: b.tool_use_id }
    : b.type === "text" ? { type: b.type, text: b.text } : { type: b.type }) : [] },
});

/** A throwaway repo (fixture/), optionally with files on top (another plan.md), then "Run the plan in plan.md." */
export async function runPlan(files = {}) {
  const world = makeWorld({ fixture: join(root, "labs/lab-3-workflow/fixture"), tag: "v1.0.0", commits: Object.keys(files).length ? [{ message: "chore: the plan", files }] : [] });
  const run = await runAgent({ prompt: "Run the plan in plan.md.", cwd: world.dir, env: world.env, skills: "plugin", tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "Agent"], maxTurns: 80 });
  return { trace: run.messages.map(slim), result: run.result, error: run.error, commands: world.commands() };
}

/** The facts in a run: every agent it started (role, task, models, skills, start, end, status), the stages in order, skip reasons. */
export function facts(run) {
  const w = parseTrace(run.trace.map(m => JSON.stringify(m)));
  const firstStage = Math.min(...w.runs.filter(r => STAGES.includes(r.role)).map(r => r.start));
  const builders = w.of("implementer").filter(r => r.start < firstStage);      // a fix loop runs implementers again
  const stages = [...w.runs].sort((a, b) => a.start - b.start).filter(r => STAGES.includes(r.role)).map(r => r.role);
  const skipped = Object.fromEntries(w.notes.flatMap(n => [...n.matchAll(/(\S+) skipped: (.+)$/gm)].map(m => [m[1].replace(/\W/g, ""), m[2]])));
  return { ...run, w, builders, stages, skipped };
}
