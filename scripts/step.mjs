// npm run step                  where am I, what steps are there
// npm run step lab-2            go to the start of a lab (you write the checks)
// npm run step lab-2-done       go to the finished lab (you run them)
// npm run step next | prev      one step forward or back
// npm run step done | start     solution or start of the lab you are in
// npm run step my-branch        any other branch works too
// Unsaved work is put aside per branch and comes back when you return to that branch with this command.
import { spawnSync } from "node:child_process";
const STEPS = ["lab-1a-start", "lab-1a-done", "lab-1b-start", "lab-1b-done", "lab-2-start", "lab-2-done", "lab-3-start", "lab-3-done", "gate-start", "gate-done", "judge-start", "judge-done"];
const run = (...a) => spawnSync("git", ["-c", "user.name=workshop", "-c", "user.email=workshop@example.com", ...a], { encoding: "utf8" });
const fail = m => { console.error(m); process.exit(1); };
const git = (...a) => { const r = run(...a); if (r.status !== 0) fail((r.stderr || r.stdout || String(r.error)).trim()); return r.stdout.trim(); };
const exists = ref => run("rev-parse", "-q", "--verify", ref).status === 0;
const here = git("branch", "--show-current"), want = process.argv[2];
const name = here === "main" ? "lab-1a-start" : here, at = STEPS.indexOf(name);        // main is the same code as lab-1a-start

if (!want) {
  console.log(STEPS.map(s => `${s === name ? "→" : " "} ${s}`).join("\n"));
  if (at < 0) console.log(`\nYou are on ${here || "no branch"}.`);
  console.log("\nnpm run step next | prev | done | start | <name>");
  process.exit(0);
}
if (["next", "prev", "done", "start"].includes(want) && at < 0) fail(`You are on "${here || "no branch"}", which is not a step. Name one: npm run step lab-1a`);
const lab = STEPS[at]?.replace(/-(start|done)$/, "");
const to = { next: STEPS[at + 1] ?? "", prev: STEPS[at - 1] ?? "", done: `${lab}-done`, start: `${lab}-start` }[want]
  ?? (STEPS.includes(want) ? want : STEPS.includes(`${want}-start`) ? `${want}-start` : exists(`refs/heads/${want}`) || exists(`refs/remotes/origin/${want}`) ? want : null);
if (to === "") fail(want === "next" ? "This is the last step." : "This is the first step.");
if (to === null) fail(`No such step: ${want}. Steps: ${STEPS.join(", ")}`);
if (to === here) { console.log(`Already on ${to}.`); process.exit(0); }
if (git("ls-files", "-u")) fail("There are conflicts here. Resolve them and commit, or drop them with: git checkout --theirs . && git add -A");

/* make sure we can go there before touching any work */
if (!exists(`refs/heads/${to}`)) {
  if (!exists(`refs/remotes/origin/${to}`)) run("fetch", "-q", "origin", `+refs/heads/${to}:refs/remotes/origin/${to}`);
  if (!exists(`refs/remotes/origin/${to}`)) fail(`Your copy has no branch ${to}. With “Use this template”, tick “Include all branches”. Without it, clone the original repository.`);
  git("branch", "-q", "--no-track", to, `refs/remotes/origin/${to}`);
}
const tag = b => `evals-workshop: ${b === "main" ? "lab-1a-start" : b}`;
if (git("status", "--porcelain")) {
  if (!here) fail("You are on no branch and have unsaved work. Give it a branch first: git switch -c my-work");
  git("stash", "push", "-q", "-u", "-m", tag(here));
  console.log(`Your work on ${here} is put aside. It comes back with: npm run step ${here}`);
}
git("switch", "-q", to);
const saved = git("stash", "list", "--format=%gd %gs").split("\n").filter(l => l.endsWith(tag(to)));
if (saved.length) {
  if (run("stash", "pop", "-q", "--index", saved[0].split(" ")[0]).status === 0 || run("stash", "pop", "-q", saved[0].split(" ")[0]).status === 0) console.log(`Your work on ${to} is back.`);
  else { run("reset", "-q", "--merge"); console.log(`Your saved work no longer fits on ${to}. It is safe in the stash: git stash show -p ${saved[0].split(" ")[0]}`); }
  if (saved.length > 1) console.log(`There is older work saved for this branch too: git stash list`);
}
console.log(`\nYou are on ${to}. Read STEP.md.`);
