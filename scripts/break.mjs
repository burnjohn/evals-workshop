// npm run break -- lab-1a     Shows a harmless-looking edit, then runs the same checks on the run saved after it.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { LABS, meta, read, root } from "../lib/recording.js";
const lab = process.argv[2], file = LABS[lab] && new URL(`${LABS[lab].dir}/break.diff`, root);
if (!file || !existsSync(file)) { console.error(`Usage: npm run break -- ${Object.keys(LABS).join(" | ")}`); process.exit(1); }
console.log("\nThe edit:\n\n" + readFileSync(file, "utf8").replace(/^\+.*$/gm, "\x1b[32m$&\x1b[0m").replace(/^-.*$/gm, "\x1b[31m$&\x1b[0m"));
console.log(`Same checks, on the run saved after the edit (${meta(lab).real ? "real model output" : "synthetic"}). Your prompt files are not touched.\n`);
if (read(`${LABS[lab].dir}/expected.json`).includes('"TODO')) console.log("Part of the answer key is still TODO. An unlabelled case can't go red.\n");
const { status } = spawnSync("npx", ["vitest", "run", lab], { stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, RECORDING: "broken" } });
console.log(`Read what the agent did:  npm run show -- ${lab} broken\nTake the edit back:       npm test -- ${lab}\n`);
process.exit(status);
