import test from "node:test"; import assert from "node:assert";
import { profile } from "../src/profile.js";
test("returns displayName", () => assert.equal(profile({ id: 1, name: "Ann" }).displayName, "Ann"));
