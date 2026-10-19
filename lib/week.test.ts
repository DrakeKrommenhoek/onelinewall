import assert from "node:assert/strict";
import { test } from "node:test";
import { previousWeekKey, weekKey, weekLabel } from "./week.ts";

test("weeks start Monday in Eastern time", () => {
  // Mon Oct 19 2026, 9am ET
  assert.equal(weekKey(new Date("2026-10-19T13:00:00Z")), "2026-10-19");
  // Sun Oct 25 2026, 11:30pm ET is still the same week (03:30Z Monday)
  assert.equal(weekKey(new Date("2026-10-26T03:30:00Z")), "2026-10-19");
  // Mon Oct 26 2026, 12:30am ET starts the next week
  assert.equal(weekKey(new Date("2026-10-26T04:30:00Z")), "2026-10-26");
});

test("previous week and labels", () => {
  assert.equal(previousWeekKey("2026-10-19"), "2026-10-12");
  assert.equal(previousWeekKey("2026-01-05"), "2025-12-29");
  assert.equal(weekLabel("2026-10-19"), "Oct 19 – Oct 25");
});
