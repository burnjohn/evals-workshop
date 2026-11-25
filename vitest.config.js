import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["labs/*.test.js", "labs/*/*.test.js"], globalSetup: "lib/tmp.js", testTimeout: 60_000, hookTimeout: 60_000 } });
