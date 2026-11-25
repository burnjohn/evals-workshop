// Runs first, needs no model: is every skill well formed, and was every saved run made with today's prompts?
import { readdirSync } from "node:fs";
import { expect, test } from "vitest";
import { LABS, inputHash, meta, read, root } from "../lib/recording.js";
const skills = readdirSync(new URL("plugin/skills", root));

test.each(skills)("skill %s has a name and a description", s =>
  expect(read(`plugin/skills/${s}/SKILL.md`)).toMatch(new RegExp(`^---\\nname: ${s}\\ndescription: .{20,}\\n---\\n`)));

test.each(Object.keys(LABS))("%s: the saved runs were made with these prompts", lab =>
  expect(meta(lab).inputHash, "a prompt or an input changed after this run was saved: the eval has NOT run").toBe(inputHash(lab)));
