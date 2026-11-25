// All throwaway folders live in one place, so a run can clean up after itself.
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const base = join(tmpdir(), "evals-workshop");
export const tmp = name => { mkdirSync(base, { recursive: true }); return mkdtempSync(join(base, name + "-")); };
export const clean = () => rmSync(base, { recursive: true, force: true });
export default function setup() { clean(); return clean; }       // vitest globalSetup
