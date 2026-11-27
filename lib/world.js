// A throwaway git repo for one case, so an agent can act for real and nothing leaves your machine:
// git is real, "origin" is a local folder, gh is a fake that answers like the real one. Every git, npm, node and gh
// command the agent runs is logged, so a test can check what it did, not what it said.
import { execFileSync } from "node:child_process";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const realGit = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
const made = [];
process.on("exit", () => { if (!process.env.KEEP) for (const d of made) rmSync(d, { recursive: true, force: true }); });

/** fixture: a folder copied in as the first commit (tag `tag` if given). Then commits: [{ message, files: { path: text } }]. */
export function makeWorld({ fixture, tag, commits = [] }) {
  const d = mkdtempSync(join(tmpdir(), "evals-")), work = join(d, "work"), bin = join(d, "bin"), log = join(d, "commands.log"), rel = join(d, "releases.txt");
  made.push(d);
  const gitEnv = { GIT_AUTHOR_NAME: "Eval", GIT_AUTHOR_EMAIL: "eval@example.com", GIT_COMMITTER_NAME: "Eval", GIT_COMMITTER_EMAIL: "eval@example.com", GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  const git = (...a) => execFileSync(realGit, a, { cwd: work, env: { PATH: process.env.PATH, ...gitEnv }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const write = files => { for (const [p, text] of Object.entries(files)) { mkdirSync(dirname(join(work, p)), { recursive: true }); writeFileSync(join(work, p), text); } };

  mkdirSync(bin); writeFileSync(log, ""); writeFileSync(rel, "");
  cpSync(fixture, work, { recursive: true });
  execFileSync(realGit, ["init", "-q", "--bare", "-b", "main", join(d, "remote.git")]);
  git("init", "-q", "-b", "main"); git("remote", "add", "origin", join(d, "remote.git"));
  git("add", "-A"); git("commit", "-qm", tag ? `release: ${tag}` : "start"); if (tag) git("tag", tag);
  for (const c of commits) { write(c.files ?? {}); git("add", "-A"); git("commit", "-q", "--allow-empty", "-m", c.message); }
  git("push", "-q", "origin", "main", "--tags");
  const base = git("rev-parse", "HEAD");

  // one log line per command, also when an argument has line breaks (a commit message, a changelog entry)
  const shim = (name, body) => { writeFileSync(join(bin, name), `#!/bin/sh\nprintf '%s\\n' "${name} $*" | tr '\\n' ' ' >> "${log}"; echo >> "${log}"\n${body}\n`); chmodSync(join(bin, name), 0o755); };
  shim("git", `exec "${realGit}" "$@"`);
  shim("npm", `[ "$1" = test ] && exec "${process.execPath}" --test; exit 0`);
  shim("node", `exec "${process.execPath}" "$@"`);
  const url = "https://github.com/acme/app/releases/tag";
  shim("gh", `case "$1 $2" in
  "release create") if grep -qx "$3" "${rel}"; then echo "a release with tag $3 already exists" >&2; exit 1; fi; echo "$3" >> "${rel}"; echo "${url}/$3" ;;
  "release view") if grep -qx "$3" "${rel}"; then printf 'tag:\\t%s\\nurl:\\t${url}/%s\\n' "$3" "$3"; else echo "release not found" >&2; exit 1; fi ;;
  "release list") cat "${rel}" ;;
  "auth status") echo "github.com: logged in as release-bot" ;;
esac
exit 0`);

  const remote = (...a) => execFileSync(realGit, ["-C", join(d, "remote.git"), ...a], { encoding: "utf8" }).trim();
  return {
    dir: work,
    /** give this to runAgent: the logged commands come first on PATH */
    env: { ...gitEnv, PATH: `${bin}:${process.env.PATH}` },
    git, write,
    read: p => readFileSync(join(work, p), "utf8"),
    remote,
    /** What the agent ran. Claude Code also runs git for itself, always with core.hooksPath=/dev/null: that is left out. */
    commands: () => readFileSync(log, "utf8").split("\n").map(c => c.trim()).filter(c => c && !c.includes("core.hooksPath=/dev/null")),
    /** Files changed since the first commit and the case's commits, committed or not. */
    changed: () => { git("add", "-A"); return git("diff", "--cached", "--name-only", base).split("\n").filter(Boolean); },
  };
}

/** true when the commands ran in this order. A name is a prefix ("npm test") or a RegExp (/^git tag v/). */
export function inOrder(commands, ...names) {
  const at = names.map(p => commands.findIndex(c => typeof p === "string" ? c.startsWith(p) : p.test(c)));
  return at.every((n, k) => n >= 0 && (k === 0 || n > at[k - 1]));
}
