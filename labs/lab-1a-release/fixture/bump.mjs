// node bump.mjs <version> "<changelog entry>"
import { readFileSync, writeFileSync } from "node:fs";
const [version, entry = ""] = process.argv.slice(2);
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
writeFileSync("package.json", JSON.stringify({ ...pkg, version }) + "\n");
writeFileSync("CHANGELOG.md", readFileSync("CHANGELOG.md", "utf8").replace("# Changelog\n", `# Changelog\n\n## ${version}\n- ${entry}\n`));
