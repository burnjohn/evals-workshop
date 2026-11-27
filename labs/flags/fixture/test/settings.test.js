import test from "node:test"; import assert from "node:assert";
import { renderSettings } from "../web/settings.js";
import { searchBox } from "../web/search.js";
test("settings show the name, escaped", () => assert.match(renderSettings({ name: "<b>" }), /value="&lt;b>"/));
test("settings have a tracked Save button", () => assert.match(renderSettings({ name: "Ann" }), /<button data-track="settings_save">Save<\/button>/));
test("fuzzy match only with beta_search", () => {
  assert.doesNotMatch(searchBox("x", { beta_search: false }), /fuzzy/);
  assert.match(searchBox("x", { beta_search: true }), /fuzzy/);
});
