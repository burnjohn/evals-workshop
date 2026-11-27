import test from "node:test"; import assert from "node:assert";
const { getProfile } = await import(process.env.WORK + "/api/profile.js");
test("existing profile", () => assert.equal(getProfile({ 1: { id: 1 } }, 1).status, 200));
test("missing profile", () => assert.equal(getProfile({}, 7).status, 404));
