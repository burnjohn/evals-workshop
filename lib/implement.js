// Lab 2. Puts the files the agent wrote into a throwaway git repo and looks at what is really there.
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dir, json, load, root } from "./recording.js";
import { tmp } from "./tmp.js";
const DIR = dir("lab-2"), from = p => fileURLToPath(new URL(`${DIR}/${p}`, root));
export const tasks = () => json(`${DIR}/tasks.json`);

export function runTask(name, run = load("lab-2")) {
  const rec = run[name], work = tmp("task"), task = tasks()[name];
  const env = { PATH: process.env.PATH, HOME: work, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  const git = (...a) => execFileSync("git", ["-c", "user.name=Eval", "-c", "user.email=eval@example.com", ...a], { cwd: work, env, encoding: "utf8" });
  cpSync(from("repo"), work, { recursive: true });
  git("init", "-q", "-b", "main"); git("add", "-A"); git("commit", "-qm", "start");
  for (const [file, text] of Object.entries(rec.files)) { mkdirSync(dirname(join(work, file)), { recursive: true }); writeFileSync(join(work, file), text); }
  git("add", "-A");
  return {
    report: rec.report,
    status: rec.report.match(/status: (\w+)/)?.[1] ?? "missing",
    commands: rec.commands,
    skills: rec.skills,
    changed: git("diff", "--cached", "--name-only").split("\n").filter(Boolean),
    code: readFileSync(join(work, task.file), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ""),   // a rule in a comment does not count
    hiddenTestsPass: () => spawnSync("node", ["--test", from(`hidden/${name}.test.mjs`)], { env: { PATH: process.env.PATH, WORK: work } }).status === 0,
  };
}
