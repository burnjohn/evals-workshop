// Lab 1A. Replays the commands the agent ran, in a throwaway world:
// git is real, the remote is a local folder, gh is a fake that writes a log.
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dir, json, load, root } from "./recording.js";
import { tmp } from "./tmp.js";

const DIR = dir("lab-1a"), from = p => fileURLToPath(new URL(`${DIR}/${p}`, root));
const realGit = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
export const cases = () => json(`${DIR}/cases.json`);

/** A repo at v1.4.2 with the case's commits on top, pushed to a local remote. */
export function makeWorld(c) {
  const d = tmp("release"), work = join(d, "work"), bin = join(d, "bin"), log = join(d, "commands.log");
  const env = { PATH: process.env.PATH, HOME: d, GIT_AUTHOR_NAME: "Eval", GIT_AUTHOR_EMAIL: "eval@example.com", GIT_COMMITTER_NAME: "Eval", GIT_COMMITTER_EMAIL: "eval@example.com", GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  const git = (...a) => execFileSync(realGit, a, { cwd: work, env, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  mkdirSync(bin); writeFileSync(log, "");
  cpSync(from("repo"), work, { recursive: true });
  execFileSync(realGit, ["init", "-q", "--bare", "-b", "main", join(d, "remote.git")], { env });
  git("init", "-q", "-b", "main"); git("remote", "add", "origin", join(d, "remote.git"));
  git("add", "-A"); git("commit", "-qm", "release: v1.4.2"); git("tag", "v1.4.2");
  c.commits.forEach((msg, k) => {
    if (/BREAKING CHANGE/.test(msg)) cpSync(from("change"), work, { recursive: true });
    else { mkdirSync(join(work, "notes"), { recursive: true }); writeFileSync(join(work, "notes", `${k}.txt`), msg + "\n"); }
    if (c.tests === "red") writeFileSync(join(work, "src/profile.js"), "export const profile = c => ({ id: c.id });\n");
    git("add", "-A"); git("commit", "-qm", msg);
  });
  git("push", "-q", "origin", "main", "--tags");
  const shim = (name, body) => { writeFileSync(join(bin, name), `#!/bin/sh\necho "${name} $*" >> "${log}"\n${body}\n`); chmodSync(join(bin, name), 0o755); };
  shim("git", `exec "${realGit}" "$@"`);
  shim("npm", `[ "$1" = test ] && exec "${process.execPath}" --test; exit 0`);
  shim("node", `exec "${process.execPath}" "$@"`);
  shim("gh", "exit 0");
  return { d, work, env: { ...env, PATH: `${bin}:${process.env.PATH}` }, log };
}

/** What really happened: read from the remote and the command log, not from the agent's report. */
export function readWorld({ d, log }) {
  const remote = (...a) => execFileSync(realGit, ["-C", join(d, "remote.git"), ...a], { encoding: "utf8" }).trim();
  const commands = readFileSync(log, "utf8").split("\n").filter(Boolean);
  const first = p => commands.findIndex(c => c.startsWith(p));
  return {
    commands,
    state: { version: JSON.parse(remote("show", "main:package.json")).version, tags: remote("tag").split("\n"), changelog: remote("show", "main:CHANGELOG.md") },
    gh: commands.filter(c => c.startsWith("gh ")).map(c => c.slice(3)),
    pushed: commands.some(c => /^(git push|gh )/.test(c)),
    /** true when every command ran, in this order */
    order: (...names) => names.map(first).every((at, k, all) => at >= 0 && (k === 0 || at > all[k - 1])),
  };
}

export function runRelease(c, run = load("lab-1a")) {
  const world = makeWorld(c);
  for (const cmd of run[c.id] ?? []) spawnSync("sh", ["-c", cmd], { cwd: world.work, env: world.env, stdio: "ignore" });
  return readWorld(world);
}
