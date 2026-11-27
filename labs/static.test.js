// Runs first, needs no model: is every skill and agent in the plugin well formed?
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { pluginDir, read } from "../lib/agent.js";
const skills = readdirSync(join(pluginDir(), "skills")), agents = readdirSync(join(pluginDir(), "agents"));

test.each(skills)("skill %s has a name and a description", s =>
  expect(read(`plugin/skills/${s}/SKILL.md`)).toMatch(new RegExp(`^---\\nname: ${s}\\ndescription: .{20,}\\n---\\n`)));

test.each(agents)("agent %s has a name and a description", a =>
  expect(read(`plugin/agents/${a}`)).toMatch(new RegExp(`^---\\nname: ${a.replace(/\.md$/, "")}\\ndescription: .{10,}\\n`)));
