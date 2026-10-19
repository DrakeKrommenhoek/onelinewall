import assert from "node:assert/strict";
import { test } from "node:test";
import { fingerprint, moderate } from "./moderation.ts";

test("accepts the kinds of prompts we expect", () => {
  for (const text of [
    "Favorite movie",
    "Favorite show, and where you stream it",
    "Favorite place to eat in Lexington",
    "Biggest fear",
    "Worst possible way to fix parking",
    "Best class you've taken at W&L",
    "Favorite cologne or perfume",
    "What's your go-to study spot in Leyburn?",
    "Assassin's Creed or Zelda?",
  ]) {
    const r = moderate(text);
    assert.equal(r.ok, true, `expected "${text}" to pass`);
  }
});

test("blocks slurs and profanity, including disguised spellings", () => {
  for (const text of ["you f*ck", "f u c k this", "sh1t prompt", "what a b1tch"]) {
    assert.equal(moderate(text).ok, false, `expected "${text}" to be blocked`);
  }
});

test("blocks links, emails, and phone numbers", () => {
  assert.equal(moderate("go to https://example.com now").ok, false);
  assert.equal(moderate("check out mysite.com").ok, false);
  assert.equal(moderate("email me at a@b.co").ok, false);
  assert.equal(moderate("call 540-555-1234").ok, false);
});

test("enforces length and tidies whitespace", () => {
  assert.equal(moderate("hi").ok, false);
  assert.equal(moderate("x".repeat(121)).ok, false);
  const r = moderate("  Favorite   \n movie​ ");
  assert.deepEqual(r, { ok: true, text: "Favorite movie" });
});

test("fingerprint collapses near-duplicates", () => {
  assert.equal(fingerprint("Favorite Movie!"), fingerprint("favorite   movie"));
});
