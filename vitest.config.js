import { defineConfig } from "vitest/config";
// Every lab runs a real agent (Claude Code, your login). "tree": every lab, case and check is listed.
export default defineConfig({ test: { include: ["labs/*.test.js", "labs/*/*.test.js"], reporters: ["tree"], testTimeout: 60_000, hookTimeout: 900_000 } });
