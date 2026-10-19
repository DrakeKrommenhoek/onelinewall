import { Redis } from "@upstash/redis";
import { DEFAULT_PROMPT, type FormatId } from "../content/site.ts";

// Storage for pitches, votes, the current prompt, and newsletter sign-ups.
// Uses Upstash Redis when its env vars are present (Vercel's Storage tab sets them),
// and falls back to process memory so local dev works with zero setup.

export const REPORT_THRESHOLD = 3;

export type Prompt = { title: string; detail: string; format: FormatId };

export type Idea = {
  id: string;
  text: string;
  format: FormatId;
  name: string;
  year: string;
  week: string;
  createdAt: number;
  up: number;
  down: number;
  reports: number;
  hidden: boolean;
  approved: boolean;
  voter: string;
};

export type NewIdea = Pick<Idea, "text" | "format" | "name" | "year" | "week" | "voter">;

export type Vote = -1 | 0 | 1;

export type AddResult = { ok: true; idea: Idea } | { ok: false; duplicateOf: string };

export interface Store {
  kind: "redis" | "memory";
  getPrompt(): Promise<Prompt>;
  setPrompt(prompt: Prompt): Promise<void>;
  addIdea(idea: NewIdea, fingerprint: string): Promise<AddResult>;
  getIdea(id: string): Promise<Idea | null>;
  listIdeas(week: string): Promise<Idea[]>;
  listWeeks(): Promise<string[]>;
  getVotes(ids: string[], voter: string): Promise<Record<string, Vote>>;
  vote(id: string, voter: string, value: Vote): Promise<Idea | null>;
  report(id: string, voter: string): Promise<void>;
  setHidden(id: string, hidden: boolean): Promise<void>;
  deleteIdea(id: string): Promise<void>;
  addSubscriber(email: string): Promise<boolean>;
  listSubscribers(): Promise<{ email: string; createdAt: number }[]>;
  hit(counter: string): Promise<void>;
  stats(): Promise<Record<string, number>>;
  /** Fixed-window rate limit. Returns true when the call is allowed. */
  allow(key: string, limit: number, windowSeconds: number): Promise<boolean>;
}

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

const P = "olw:";
const k = {
  prompt: `${P}prompt`,
  idea: (id: string) => `${P}idea:${id}`,
  week: (week: string) => `${P}week:${week}`,
  weekPrints: (week: string) => `${P}week:${week}:prints`,
  weeks: `${P}weeks`,
  votes: (id: string) => `${P}votes:${id}`,
  reports: (id: string) => `${P}reports:${id}`,
  subs: `${P}subs`,
  stats: `${P}stats`,
  rl: (key: string) => `${P}rl:${key}`,
};

// Redis hands every field back as a string, so coerce each one to its real type.
function toIdea(raw: Record<string, unknown> | null): Idea | null {
  if (!raw || !raw.id) return null;
  const num = (v: unknown) => Number(v ?? 0) || 0;
  const bool = (v: unknown) => v === true || v === 1 || v === "1" || v === "true";
  return {
    id: String(raw.id),
    text: String(raw.text ?? ""),
    format: String(raw.format ?? "other") as FormatId,
    name: raw.name == null ? "" : String(raw.name),
    year: raw.year == null ? "" : String(raw.year),
    week: String(raw.week ?? ""),
    createdAt: num(raw.createdAt),
    up: num(raw.up),
    down: num(raw.down),
    reports: num(raw.reports),
    hidden: bool(raw.hidden),
    approved: bool(raw.approved),
    voter: raw.voter == null ? "" : String(raw.voter),
  };
}

function toVote(v: unknown): Vote {
  const n = Number(v);
  return n === 1 || n === -1 ? n : 0;
}

class RedisStore implements Store {
  kind = "redis" as const;
  private r: Redis;

  constructor(r: Redis) {
    this.r = r;
  }

  async getPrompt() {
    const raw = await this.r.get<string>(k.prompt);
    if (!raw) return DEFAULT_PROMPT;
    try {
      const parsed = JSON.parse(raw) as Prompt;
      return parsed.title ? parsed : DEFAULT_PROMPT;
    } catch {
      return DEFAULT_PROMPT;
    }
  }

  async setPrompt(prompt: Prompt) {
    await this.r.set(k.prompt, JSON.stringify(prompt));
  }

  async addIdea(input: NewIdea, fp: string): Promise<AddResult> {
    const id = newId();
    // hsetnx claims the fingerprint atomically, so two identical pitches can't both land.
    const claimed = await this.r.hsetnx(k.weekPrints(input.week), fp, id);
    if (!claimed) {
      const existing = await this.r.hget<string>(k.weekPrints(input.week), fp);
      return { ok: false, duplicateOf: String(existing) };
    }
    const idea: Idea = {
      ...input,
      id,
      createdAt: Date.now(),
      up: 0,
      down: 0,
      reports: 0,
      hidden: false,
      approved: false,
    };
    const tx = this.r.multi();
    tx.hset(k.idea(id), { ...idea, hidden: 0, approved: 0 });
    tx.zadd(k.week(input.week), { score: idea.createdAt, member: id });
    tx.sadd(k.weeks, input.week);
    tx.hincrby(k.stats, "pitches", 1);
    await tx.exec();
    return { ok: true, idea };
  }

  async getIdea(id: string) {
    return toIdea(await this.r.hgetall(k.idea(id)));
  }

  async listIdeas(week: string) {
    const ids = await this.r.zrange<string[]>(k.week(week), 0, -1);
    if (!ids.length) return [];
    const p = this.r.pipeline();
    ids.forEach((id) => p.hgetall(k.idea(String(id))));
    const rows = await p.exec<(Record<string, unknown> | null)[]>();
    return rows.map(toIdea).filter((i): i is Idea => i !== null);
  }

  async listWeeks() {
    const weeks = await this.r.smembers<string[]>(k.weeks);
    return weeks.map(String).sort().reverse();
  }

  async getVotes(ids: string[], voter: string) {
    if (!ids.length || !voter) return {};
    const p = this.r.pipeline();
    ids.forEach((id) => p.hget(k.votes(id), voter));
    const rows = await p.exec<unknown[]>();
    const out: Record<string, Vote> = {};
    ids.forEach((id, i) => {
      const v = toVote(rows[i]);
      if (v) out[id] = v;
    });
    return out;
  }

  async vote(id: string, voter: string, value: Vote) {
    const prev = toVote(await this.r.hget(k.votes(id), voter));
    if (prev !== value) {
      const tx = this.r.multi();
      if (value === 0) tx.hdel(k.votes(id), voter);
      else tx.hset(k.votes(id), { [voter]: value });
      const up = (value === 1 ? 1 : 0) - (prev === 1 ? 1 : 0);
      const down = (value === -1 ? 1 : 0) - (prev === -1 ? 1 : 0);
      if (up) tx.hincrby(k.idea(id), "up", up);
      if (down) tx.hincrby(k.idea(id), "down", down);
      tx.hincrby(k.stats, "votes", 1);
      await tx.exec();
    }
    return this.getIdea(id);
  }

  async report(id: string, voter: string) {
    const added = await this.r.sadd(k.reports(id), voter);
    if (!added) return;
    const count = await this.r.hincrby(k.idea(id), "reports", 1);
    const idea = await this.getIdea(id);
    if (idea && !idea.approved && count >= REPORT_THRESHOLD) {
      await this.r.hset(k.idea(id), { hidden: 1 });
    }
  }

  async setHidden(id: string, hidden: boolean) {
    // Un-hiding is a moderator decision, so reports can't auto-hide it again.
    await this.r.hset(k.idea(id), hidden ? { hidden: 1 } : { hidden: 0, approved: 1 });
  }

  async deleteIdea(id: string) {
    const idea = await this.getIdea(id);
    if (!idea) return;
    const tx = this.r.multi();
    tx.del(k.idea(id), k.votes(id), k.reports(id));
    tx.zrem(k.week(idea.week), id);
    await tx.exec();
    // Leave the fingerprint so the same pitch can't be immediately re-posted.
  }

  async addSubscriber(email: string) {
    const added = await this.r.hsetnx(k.subs, email, Date.now());
    return added === 1;
  }

  async listSubscribers() {
    const all = (await this.r.hgetall<Record<string, number>>(k.subs)) ?? {};
    return Object.entries(all)
      .map(([email, createdAt]) => ({ email, createdAt: Number(createdAt) }))
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async hit(counter: string) {
    await this.r.hincrby(k.stats, counter, 1);
  }

  async stats() {
    const raw = (await this.r.hgetall<Record<string, number>>(k.stats)) ?? {};
    return Object.fromEntries(Object.entries(raw).map(([key, v]) => [key, Number(v) || 0]));
  }

  async allow(key: string, limit: number, windowSeconds: number) {
    const count = await this.r.incr(k.rl(key));
    if (count === 1) await this.r.expire(k.rl(key), windowSeconds);
    return count <= limit;
  }
}

type MemoryState = {
  prompt: Prompt | null;
  ideas: Map<string, Idea>;
  prints: Map<string, string>;
  votes: Map<string, Map<string, Vote>>;
  reports: Map<string, Set<string>>;
  subs: Map<string, number>;
  stats: Map<string, number>;
  rl: Map<string, { count: number; resetAt: number }>;
};

class MemoryStore implements Store {
  kind = "memory" as const;
  private s: MemoryState;

  constructor() {
    const g = globalThis as unknown as { __olwMemory?: MemoryState };
    g.__olwMemory ??= {
      prompt: null,
      ideas: new Map(),
      prints: new Map(),
      votes: new Map(),
      reports: new Map(),
      subs: new Map(),
      stats: new Map(),
      rl: new Map(),
    };
    this.s = g.__olwMemory;
  }

  async getPrompt() {
    return this.s.prompt ?? DEFAULT_PROMPT;
  }

  async setPrompt(prompt: Prompt) {
    this.s.prompt = prompt;
  }

  async addIdea(input: NewIdea, fp: string): Promise<AddResult> {
    const printKey = `${input.week}:${fp}`;
    const existing = this.s.prints.get(printKey);
    if (existing) return { ok: false, duplicateOf: existing };
    const idea: Idea = {
      ...input,
      id: newId(),
      createdAt: Date.now(),
      up: 0,
      down: 0,
      reports: 0,
      hidden: false,
      approved: false,
    };
    this.s.prints.set(printKey, idea.id);
    this.s.ideas.set(idea.id, idea);
    await this.hit("pitches");
    return { ok: true, idea: { ...idea } };
  }

  async getIdea(id: string) {
    const idea = this.s.ideas.get(id);
    return idea ? { ...idea } : null;
  }

  async listIdeas(week: string) {
    return [...this.s.ideas.values()]
      .filter((i) => i.week === week)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((i) => ({ ...i }));
  }

  async listWeeks() {
    return [...new Set([...this.s.ideas.values()].map((i) => i.week))].sort().reverse();
  }

  async getVotes(ids: string[], voter: string) {
    const out: Record<string, Vote> = {};
    for (const id of ids) {
      const v = this.s.votes.get(id)?.get(voter);
      if (v) out[id] = v;
    }
    return out;
  }

  async vote(id: string, voter: string, value: Vote) {
    const idea = this.s.ideas.get(id);
    if (!idea) return null;
    const votes = this.s.votes.get(id) ?? new Map<string, Vote>();
    const prev = votes.get(voter) ?? 0;
    if (prev !== value) {
      idea.up += (value === 1 ? 1 : 0) - (prev === 1 ? 1 : 0);
      idea.down += (value === -1 ? 1 : 0) - (prev === -1 ? 1 : 0);
      if (value === 0) votes.delete(voter);
      else votes.set(voter, value);
      this.s.votes.set(id, votes);
      await this.hit("votes");
    }
    return { ...idea };
  }

  async report(id: string, voter: string) {
    const idea = this.s.ideas.get(id);
    if (!idea) return;
    const set = this.s.reports.get(id) ?? new Set<string>();
    if (set.has(voter)) return;
    set.add(voter);
    this.s.reports.set(id, set);
    idea.reports += 1;
    if (!idea.approved && idea.reports >= REPORT_THRESHOLD) idea.hidden = true;
  }

  async setHidden(id: string, hidden: boolean) {
    const idea = this.s.ideas.get(id);
    if (!idea) return;
    idea.hidden = hidden;
    if (!hidden) idea.approved = true;
  }

  async deleteIdea(id: string) {
    this.s.ideas.delete(id);
    this.s.votes.delete(id);
    this.s.reports.delete(id);
  }

  async addSubscriber(email: string) {
    if (this.s.subs.has(email)) return false;
    this.s.subs.set(email, Date.now());
    return true;
  }

  async listSubscribers() {
    return [...this.s.subs.entries()].map(([email, createdAt]) => ({ email, createdAt }));
  }

  async hit(counter: string) {
    this.s.stats.set(counter, (this.s.stats.get(counter) ?? 0) + 1);
  }

  async stats() {
    return Object.fromEntries(this.s.stats);
  }

  async allow(key: string, limit: number, windowSeconds: number) {
    const now = Date.now();
    const entry = this.s.rl.get(key);
    if (!entry || entry.resetAt < now) {
      this.s.rl.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  }
}

let cached: Store | null = null;

// Vercel's Upstash integration may add a custom prefix (e.g. STORAGE_KV_REST_API_URL),
// so match any URL/TOKEN pair that shares a prefix.
const PAIRS = [
  ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
  ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
] as const;

export function findRedisEnv(env: Record<string, string | undefined> = process.env) {
  for (const [urlSuffix, tokenSuffix] of PAIRS) {
    const urlKeys = Object.keys(env)
      .filter((key) => key.endsWith(urlSuffix) && env[key])
      .sort((a, b) => a.length - b.length);
    for (const urlKey of urlKeys) {
      const tokenKey = urlKey.slice(0, -urlSuffix.length) + tokenSuffix;
      if (env[tokenKey]) return { url: env[urlKey]!, token: env[tokenKey]!, urlKey, tokenKey };
    }
  }
  return null;
}

/** Names (never values) of env vars that look Redis-related, for the admin page. */
export function redisEnvNames(env: Record<string, string | undefined> = process.env): string[] {
  return Object.keys(env)
    .filter((key) => /KV_|REDIS|UPSTASH/i.test(key) && env[key])
    .sort();
}

export function getStore(): Store {
  if (cached) return cached;
  const found = findRedisEnv();
  cached = found
    ? new RedisStore(new Redis({ url: found.url, token: found.token, automaticDeserialization: false }))
    : new MemoryStore();
  return cached;
}

/** Public shape of an idea: no voter ids, no moderation internals. */
export function publicIdea(idea: Idea, myVote: Vote = 0, viewer = "") {
  return {
    id: idea.id,
    text: idea.text,
    format: idea.format,
    name: idea.name,
    year: idea.year,
    createdAt: idea.createdAt,
    score: idea.up - idea.down,
    up: idea.up,
    down: idea.down,
    myVote,
    mine: Boolean(viewer) && idea.voter === viewer,
  };
}

export type PublicIdea = ReturnType<typeof publicIdea>;
