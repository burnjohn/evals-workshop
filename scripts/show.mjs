// npm run show -- lab-1a            Prints the inputs and what the agent did, so you can read it before you label anything.
// npm run show -- lab-1a broken     The same, after the harmless-looking edit.
if (process.argv[3]) process.env.RECORDING = process.argv[3];
const lab = process.argv[2], line = t => console.log("\n\x1b[1m" + t + "\x1b[0m");
const { LABS, meta, load, expected } = await import("../lib/recording.js");
const views = {
  async "lab-1a"() {
    const { cases, runRelease } = await import("../lib/release.js");
    for (const c of cases()) { const r = runRelease(c); line(`${c.id}: ${c.why}`); console.log({ commits: c.commits, tests: c.tests, commands: r.commands, published: r.state.version, pushed: r.pushed }); }
  },
  async "lab-1b"() {
    const { allRuns, prs, reviewer, score } = await import("../lib/review.js");
    line("The PRs (read them in labs/lab-1b-review/prs/)"); for (const [pr, files] of Object.entries(prs())) console.log(`  ${pr}: ${Object.entries(files).map(([f, l]) => `${f.split("/").pop()} (${l.size} lines)`).join(", ")}`);
    line("Every saved reviewer on the labelled PRs (real answers, DeepSeek V4.1 Flash)");
    console.table(allRuns().map(r => { const s = score(r); return { reviewer: r.name, context: r.context, caught: `${s.caught.length}/${s.defects.length}`, missed: s.missed.join(" "), decoy: s.decoys.join(" ") || "-", "false alarms": s.falseAlarms.length, $: r.costUsd }; }));
    const r = reviewer(); line(`Under test: ${r.reviewer}, ${r.context}. Its findings in the PRs:`);
    const shown = prs(); for (const f of r.findings) if (Object.values(shown).some(p => p[f.file]?.has(f.start_line))) console.log(`  ${f.file.split("/").pop()}:${f.start_line}  ${f.severity.padEnd(8)} ${f.title}`);
  },
  async "lab-2"() { const { runTask, tasks } = await import("../lib/implement.js"); for (const [n, t] of Object.entries(tasks())) { const r = runTask(n); line(`${n}: ${t.task}`); console.log({ skills: r.skills, report: r.report, commands: r.commands, changed: r.changed }); console.log(r.code); } },
  async "lab-3"() { const { loadRun } = await import("../lib/workflow.js"); const { w } = loadRun(); console.table(w.runs.map(({ role, taskId, models, skills, start, end }) => ({ role, taskId, models: models.join(), skills: skills.join(), start, end }))); },
  async judge() { const { compare } = await import("../lib/judge.js"); const notes = (await import("../lib/recording.js")).json("labs/judge/notes.json"), exp = expected("judge"), v = load("judge"); console.table(Object.entries(notes).map(([id, note]) => ({ id, person: exp[id]?.verdict ?? "TODO", judge: v[id]?.verdict, note }))); console.log(compare()); },
};
if (!views[lab]) { console.error("Usage: npm run show -- " + Object.keys(views).join(" | ") + " [broken]"); process.exit(1); }
console.log(`\x1b[2m${meta(lab).about}\x1b[0m`);
await views[lab]();
(await import("../lib/tmp.js")).clean();
