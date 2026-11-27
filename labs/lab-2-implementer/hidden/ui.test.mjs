import test from "node:test"; import assert from "node:assert";
const { profilePage } = await import(process.env.WORK + "/web/profile.js");
test("has a Save button", () => assert.match(profilePage({ displayName: "Ann" }), /<button[^>]*>Save<\/button>/));
test("escapes the name", () => assert.doesNotMatch(profilePage({ displayName: "<script>" }), /<script>/));
