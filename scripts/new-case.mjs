// npm run new-case -- 05-rate-limit
// Copies labs/lab-1b-review/cases/_template into cases/<name>. Then fill case.yaml and input.patch, and run npm test -- lab-1b.
import { cpSync, existsSync } from "node:fs";
const name = process.argv.slice(2).find(a => a !== "lab-1b"), dir = new URL("../labs/lab-1b-review/cases/", import.meta.url);
if (!/^\d\d-[a-z0-9-]+$/.test(name ?? "")) { console.log("usage: npm run new-case -- <NN-what-it-tests>   e.g. 05-rate-limit"); process.exit(1); }
if (existsSync(new URL(name, dir))) { console.log(`labs/lab-1b-review/cases/${name} already exists.`); process.exit(1); }
cpSync(new URL("_template/", dir), new URL(`${name}/`, dir), { recursive: true });
console.log(`Made labs/lab-1b-review/cases/${name}/. Fill case.yaml and input.patch, then: npm test -- lab-1b`);
