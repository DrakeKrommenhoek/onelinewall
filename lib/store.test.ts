import assert from "node:assert/strict";
import { test } from "node:test";
import { findRedisEnv, redisEnvNames } from "./store.ts";

test("finds the default Vercel KV names", () => {
  const found = findRedisEnv({ KV_REST_API_URL: "https://a", KV_REST_API_TOKEN: "t" });
  assert.equal(found?.url, "https://a");
});

test("finds prefixed names from the Upstash integration", () => {
  const found = findRedisEnv({
    STORAGE_KV_REST_API_URL: "https://b",
    STORAGE_KV_REST_API_TOKEN: "t2",
    STORAGE_KV_REST_API_READ_ONLY_TOKEN: "ro",
  });
  assert.equal(found?.url, "https://b");
  assert.equal(found?.token, "t2");
});

test("finds Upstash-native names", () => {
  const found = findRedisEnv({ UPSTASH_REDIS_REST_URL: "https://c", UPSTASH_REDIS_REST_TOKEN: "t3" });
  assert.equal(found?.url, "https://c");
});

test("ignores a URL without its token, and lists names without values", () => {
  assert.equal(findRedisEnv({ KV_REST_API_URL: "https://a", REDIS_URL: "rediss://x" }), null);
  assert.deepEqual(redisEnvNames({ REDIS_URL: "rediss://x", ADMIN_PASSWORD: "p", KV_URL: "" }), ["REDIS_URL"]);
});
