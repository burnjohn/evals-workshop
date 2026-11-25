import test from "node:test"; import assert from "node:assert";
const { removeProfile } = await import(process.env.WORK + "/db/profiles.js");
test("never deletes", () => assert.doesNotMatch(removeProfile(1), /delete/i));
