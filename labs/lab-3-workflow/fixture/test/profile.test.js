import test from "node:test"; import assert from "node:assert";
import { getProfile } from "../api/profile.js";
test("a missing profile answers 404", () => assert.equal(getProfile({}, 7).status, 404));
