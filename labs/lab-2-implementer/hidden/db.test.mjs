// The agent never saw this file. A real SQLite database in memory, and a clock the test controls.
import test from "node:test"; import assert from "node:assert";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
const file = process.env.WORK + "/db/profiles.js", { archiveProfile, activeProfiles } = await import(file);
const FIRST = "2026-11-26T09:00:00.000Z", AGAIN = "2026-11-26T09:05:00.000Z";

function fixture() {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE profiles (id INTEGER PRIMARY KEY, name TEXT NOT NULL, archived_at TEXT)");
  db.exec("INSERT INTO profiles (id, name) VALUES (1, 'Ann'), (2, 'Bo')");
  return db;
}
const rows = db => db.prepare("SELECT id, archived_at FROM profiles ORDER BY id").all().map(r => ({ ...r }));

test("never deletes: both rows stay", () => {
  const db = fixture(); archiveProfile(db, 1, FIRST);
  assert.doesNotMatch(readFileSync(file, "utf8"), /delete\s+from/i);
  assert.deepEqual(rows(db).map(r => r.id), [1, 2]);
});
test("an archived profile is gone from the active list", () => {
  const db = fixture(); archiveProfile(db, 1, FIRST);
  assert.deepEqual(activeProfiles(db).map(r => r.id), [2]);
});
test("archiving twice keeps the first timestamp", () => {
  const db = fixture(); archiveProfile(db, 1, FIRST); archiveProfile(db, 1, AGAIN);
  assert.deepEqual(rows(db), [{ id: 1, archived_at: FIRST }, { id: 2, archived_at: null }]);
  assert.deepEqual(activeProfiles(db).map(r => r.id), [2]);
});
