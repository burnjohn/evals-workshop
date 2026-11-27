// Review cases live one per folder: labs/lab-1b-review/cases/<NN-name>/case.yaml plus its input.patch.
// Add one: npm run new-case -- lab-1b 05-what-it-tests. Folders starting with _ (the template) are skipped.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { read, root } from "./agent.js";

/** Every case in a folder, in name order: { name, path, ...case.yaml, inputText } */
export function cases(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true })
    .filter(d => d.isDirectory() && !/^[_.]/.test(d.name))
    .map(d => d.name).sort()
    .map(name => {
      const path = `${dir}/${name}/`, c = parse(read(`${path}case.yaml`)) ?? {};
      return { name, path, ...c, inputText: c.input ? read(`${path}${c.input}`) : undefined };
    });
}
