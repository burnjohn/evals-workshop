// Writes the SYNTHETIC runs: hand-built in the shape of real ones. No model is called.
// Lab 1B is not here: its runs are real model answers. The judge's live run comes from npm run judge:live.
// It keeps the old input hash, so it cannot turn a stale run green. The author stamps new ones with --stamp.
import { mkdirSync, writeFileSync } from "node:fs";
import { LABS, inputHash, meta, root } from "../lib/recording.js";
const stamp = process.argv.includes("--stamp");
const save = (lab, name, text) => { mkdirSync(new URL(`${LABS[lab].dir}/runs/`, root), { recursive: true }); writeFileSync(new URL(`${LABS[lab].dir}/runs/${name}`, root), text); };
const json = (lab, name, body) => save(lab, `${name}.json`, JSON.stringify(body, null, 1) + "\n");
const stampMeta = (lab, about) => { let hash; try { hash = meta(lab).inputHash; } catch {} json(lab, "meta", { real: false, inputHash: stamp || !hash ? inputHash(lab) : hash, about }); };

/* lab 1a: the commands the agent ran, per case */
const release = (read, v, entry) => [read, "npm test", `node bump.mjs ${v} "${entry}"`, "git add -A", `git commit -m "release: v${v}"`, `git tag v${v}`, "git push origin main --tags", `gh release create v${v} --notes "${entry}"`];
const body = "git log v1.4.2..HEAD --format=%B", titles = "git log v1.4.2..HEAD --format=%s";
const runs1a = read => ({
  "breaking-in-body": read === body ? release(read, "2.0.0", "Breaking: read displayName instead of name.") : release(read, "1.5.0", "Shorter profile response."),
  "feature-and-fix": release(read, "1.5.0", "New: avatarUrl on the profile. Fix: names are trimmed."),
  "breaking-bang": release(read, "2.0.0", "Breaking: GET /v1/token is removed."),
  "fix-and-docs": release(read, "1.4.3", "Fix: a missing profile returns 404."),
  "red-tests": [read, "npm test"],
});
json("lab-1a", "good", runs1a(body));
json("lab-1a", "broken", runs1a(titles));
stampMeta("lab-1a", "Synthetic: the commands an agent would run, built by hand. git and the checks are real.");

/* lab 2: the files the agent left behind */
const api = 'export function getProfile(users, id) {\n  if (!users[id]) return { status: 404, body: { error: { code: "E_PROFILE_NOT_FOUND" } } };\n  return { status: 200, body: users[id] };\n}\n';
const esc = 'const esc = s => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");\n';
const page = e => `${e ? esc : ""}export const profilePage = user => \`<h1>\${${e ? "esc(user.displayName)" : "user.displayName"}}</h1><button data-track="profile-save">Save</button>\`;\n`;
const db = 'export const removeProfile = id => `UPDATE profiles SET archived_at = now() WHERE id = ${Number(id)}`;\n';
const tasks = ran => {
  const t = (files, skills, report) => ({ files, skills, commands: ran ? ["npm test"] : [], report });
  return {
    api: t({ "api/profile.js": api }, ["api-rules"], "All done. Tests pass.\nstatus: done"),
    ui: t({ "web/profile.js": page(ran) }, ["ui-rules"], "All done. Tests pass.\nstatus: done"),
    db: t({ "db/profiles.js": db }, ["db-rules"], "All done. Tests pass.\nstatus: done"),
    impossible: { files: {}, skills: [], commands: [], report: "There is no users.phone column and I may not add one.\nstatus: blocked" },
  };
};
json("lab-2", "good", tasks(true));
json("lab-2", "broken", tasks(false));
stampMeta("lab-2", "Synthetic: the files and commands an agent would leave, built by hand. The hidden tests and git are real.");

/* lab 3: a stream-json trace */
const S = "claude-sonnet-5-5", H = "claude-haiku-5-5";
const A = (id, desc, type, model) => ({ type: "assistant", parent_tool_use_id: null, message: { model: S, content: [{ type: "tool_use", id, name: "Agent", input: { description: desc, subagent_type: `factory:${type}`, model, prompt: desc } }] } });
const go = id => [{ type: "system", subtype: "task_started", tool_use_id: id }, { type: "user", parent_tool_use_id: null, message: { content: [{ type: "tool_result", tool_use_id: id, content: "Async agent launched" }] } }];
const sk = (id, m, ...s) => s.map((x, k) => ({ type: "assistant", parent_tool_use_id: id, message: { model: m, content: [{ type: "tool_use", id: `${id}-${k}`, name: "Skill", input: { skill: `factory:${x}` } }] } }));
const done = id => ({ type: "system", subtype: "task_notification", tool_use_id: id, status: "completed" });
const step = (id, desc, type, ...s) => [A(id, desc, type), ...go(id), ...sk(id, S, ...s), done(id)];
const trace = qa => [
  A("a1", "T1: profile API", "implementer", "sonnet"), A("a2", "T2: profile page", "implementer", "sonnet"), ...go("a1"), ...go("a2"),
  ...sk("a1", S, "api-rules"), ...sk("a2", S, "ui-rules"), done("a1"), done("a2"),
  A("a3", "T3: audit log", "implementer", "haiku"), ...go("a3"), ...sk("a3", H, "api-rules", "db-rules"), done("a3"),
  ...step("r1", "Review the change", "code-review", "code-review"), ...step("t1", "Write tests", "test-writer"),
  ...(qa ? step("q1", "Check the criteria", "qa") : []), ...step("m1", "Release", "make-release", "make-release"),
  { type: "result", is_error: false, result: "done" },
];
for (const [name, qa] of [["good", true], ["broken", false]]) save("lab-3", `${name}.jsonl`, trace(qa).map(e => JSON.stringify(e)).join("\n") + "\n");
stampMeta("lab-3", "Synthetic: a stream-json trace in the exact shape Claude Code writes, built by hand.");

/* judge: verdicts of two judges on the same notes */
const verdicts = (fails, why) => Object.fromEntries(Array.from({ length: 16 }, (_, k) => [`n${k + 1}`, fails.includes(k + 1) ? { verdict: "fail", why: why(k + 1) } : { verdict: "pass", why: "The reader knows what to do." }]));
json("judge", "good", verdicts([3, 8, 11, 13, 14, 15], n => n === 14 ? "Does not say what breaks in 3.0." : "The reader cannot tell what changes for them."));
json("judge", "broken", verdicts([], () => ""));
stampMeta("judge", "Synthetic verdicts. For real ones run npm run judge:live with an API key.");
console.log("synthetic runs written");
