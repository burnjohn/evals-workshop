import test from "node:test"; import assert from "node:assert";
import { getProfile } from "../api/profile.js";
import { profilePage } from "../web/profile.js";
test("an existing profile answers 200", () => assert.equal(getProfile({ 1: { id: 1 } }, 1).status, 200));
test("the page shows the name, escaped", () => assert.match(profilePage({ displayName: "<b>" }), /<h1>&lt;b><\/h1>/));
