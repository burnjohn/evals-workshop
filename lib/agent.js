// Runs Claude Code on one case: your login (no API key), Haiku, the plugin in ./plugin exactly as it is on disk now.
// Every lab calls this. Copy it into your own repo together with lib/world.js.
//
//   MODEL=claude-sonnet-5-5 npm test     another model (default: claude-haiku-5-5)
//   PLUGIN_DIR=/some/copy npm test       another copy of the plugin
//   CI=true npm test                     no agent, no tokens: the checks run on the saved runs/<lab>.json
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../", import.meta.url));
export const MODEL = process.env.MODEL ?? "claude-haiku-5-5";
export const pluginDir = () => process.env.PLUGIN_DIR ?? join(root, "plugin");
export const read = path => readFileSync(join(root, path), "utf8");
export const json = path => JSON.parse(read(path));
/** A skill or agent file without its front matter: the instructions only. */
export const body = path => read(path).replace(/^---[\s\S]*?---\n/, "").trim();

/** Several Claude Code logins on one machine? A file .claude-config-dir in this folder or any folder above it
 *  names the config folder to use, for example ~/.claude-personal. It is never committed: it lives above the repo. */
function configDir() {
  if (process.env.CLAUDE_CONFIG_DIR) return process.env.CLAUDE_CONFIG_DIR;
  for (let d = root; ; d = dirname(d)) {
    const f = join(d, ".claude-config-dir");
    if (existsSync(f)) return readFileSync(f, "utf8").trim().replace(/^~(?=\/|$)/, process.env.HOME);
    if (dirname(d) === d) return undefined;
  }
}

/** Every skill in the plugin: skills: "plugin" lets the agent choose among them, as it would in real use. */
export const pluginSkills = () => readdirSync(join(pluginDir(), "skills"), { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

export const NOT_LOGGED_IN = "Claude Code is not logged in for this terminal. Run `claude`, then /login, and try again. "
  + "Several logins on one machine? Put the config folder of the one to use in a file .claude-config-dir above this repo, e.g. ~/.claude-personal.";

/**
 * One agent run. Returns everything it said and did:
 *   messages  the raw stream (the same events as `claude -p --output-format stream-json`)
 *   result    its final answer
 *   error     null, or why it did not finish
 * Options: cwd, prompt, env (added to yours), agent (run as this plugin agent), skills, tools, maxTurns, model.
 */
export async function runAgent({ prompt, cwd, env = {}, agent, skills, tools = ["Bash", "Read", "Write", "Edit", "Glob", "Grep"], maxTurns = 40, model = MODEL, system }) {
  const { query } = await import("@anthropic-ai/claude-agent-sdk");
  const config = configDir();
  const messages = [];
  let result = "", error = null;
  try {
    for await (const m of query({
      prompt,
      options: {
        cwd, model, maxTurns,
        env: { ...process.env, ...env, ...(config ? { CLAUDE_CONFIG_DIR: config } : {}) },
        plugins: [{ type: "local", path: pluginDir() }],
        settingSources: [],                                    // no user or project settings: only the plugin counts
        ...(agent ? { agent } : {}),
        ...(skills ? { skills: (skills === "plugin" ? pluginSkills() : skills).map(s => s.includes(":") ? s : `factory:${s}`) } : {}),
        ...(system ? { systemPrompt: system } : {}),
        ...(tools.length ? { allowedTools: tools } : { tools: [] }),   // tools: [] = it may only answer
        permissionMode: "bypassPermissions", allowDangerouslySkipPermissions: true,
      },
    })) {
      messages.push(m);
      if (m.type === "result") { result = m.result ?? ""; if (m.is_error || m.subtype !== "success") error = m.subtype === "success" ? result : m.subtype; }
    }
  } catch (e) { error = e.message; }
  if (/Not logged in|\/login/i.test(error ?? "")) throw new Error(NOT_LOGGED_IN);
  return { messages, result, error };
}

/** Every Skill call in a run, as plain names: "factory:db-rules" -> "db-rules". */
export const skillsUsed = messages => messages.filter(m => m.type === "assistant")
  .flatMap(m => (m.message?.content ?? []).filter(b => b.type === "tool_use" && b.name === "Skill").map(b => String(b.input.skill).split(":").pop()));

/** What every case of a lab depends on besides its own input: the whole plugin, and the lab's files that are not
 *  cases or answer keys (fixture/, hidden tests, spec.md, judge.md...). Not the README, the tests, or .start. files. */
function sharedHash(lab) {
  const h = createHash("sha256"), walk = d => readdirSync(d).sort().forEach(f => {
    const p = join(d, f);
    if (/^(README\.md|.*\.test\.js|\.DS_Store|cases|cases\.json|tasks\.json|expected\.json|policy\.json|versions|checks|promptfoo|promptfooconfig\.yaml)$|\.start\./.test(f)) return;
    if (statSync(p).isDirectory()) return walk(p);
    h.update(p.slice(root.length)).update(readFileSync(p));
  });
  walk(pluginDir()); walk(join(root, "labs", lab));
  return h.digest("hex");
}

/**
 * Live on your machine, recorded for CI. inputs: { caseId: what goes into that case } (never the answer key).
 * Locally: run() returns { caseId: result }, and every result is saved to runs/<name>.json with a hash of the plugin,
 * the lab's fixture and the case's input. Commit that file.
 * With CI=true (or REPLAY=1): no agent, no tokens. Each case gets the recorded result only if its hash still matches.
 * A case without one has not run: ran() makes its checks red, never green.
 */
export async function liveOrSaved(name, lab, inputs, run) {
  const file = join(root, "runs", `${name}.json`), shared = sharedHash(lab);
  const hashOf = id => createHash("sha256").update(shared).update(JSON.stringify(inputs[id] ?? null)).digest("hex").slice(0, 12);
  if (process.env.CI || process.env.REPLAY) {
    const saved = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")).cases ?? {} : {};
    return Object.fromEntries(Object.keys(inputs).filter(id => saved[id]?.hash === hashOf(id)).map(id => [id, saved[id].result]));
  }
  const results = await run();
  mkdirSync(dirname(file), { recursive: true });
  const cases = Object.fromEntries(Object.entries(results).map(([id, result]) => [id, { hash: hashOf(id), result }]));
  writeFileSync(file, JSON.stringify({ model: MODEL, recordedAt: new Date().toISOString(), cases }, null, 1) + "\n");
  return results;
}

/** The result of one case, or a red check: nothing was recorded for it with today's plugin and input. */
export function ran(results, id, lab) {
  if (results[id]) return results[id];
  throw new Error(`${id}: no run recorded with today's plugin and this input: the eval has NOT run. Run npm test -- ${lab} on your machine and commit runs/.`);
}
