"use client";

import { type CSSProperties, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { classYears, formatLabel, formats, MARKERS, promptStarters, type FormatId } from "@/content/site";
import type { PublicIdea } from "@/lib/store";

type Feed = {
  week: string;
  weekLabel: string;
  isCurrent: boolean;
  storage: "redis" | "memory";
  ideas: PublicIdea[];
};

const MAX = 120;

const formatColor = (id: string) => {
  const f = formats.find((x) => x.id === id);
  return f ? MARKERS[f.color] : MARKERS.navy;
};

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={down ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M9 3 L15 11 H11 V15 H7 V11 H3 Z" fill="currentColor" strokeLinejoin="round" />
    </svg>
  );
}

export default function PitchBoard() {
  // ---- Form state
  const [text, setText] = useState("");
  const [format, setFormat] = useState<FormatId>("favorites");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [honey, setHoney] = useState("");
  const [sending, setSending] = useState(false);
  const [formMsg, setFormMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // ---- Feed state
  const [which, setWhich] = useState<"current" | "previous">("current");
  const [sort, setSort] = useState<"top" | "new">("top");
  const [feed, setFeed] = useState<Feed | null>(null);
  const [feedError, setFeedError] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [hiddenForMe, setHiddenForMe] = useState<Set<string>>(new Set());
  const [fromQr, setFromQr] = useState(false);
  const inFlight = useRef(new Set<string>());

  const load = useCallback(async (week: "current" | "previous") => {
    try {
      const res = await fetch(`/api/ideas?week=${week}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Feed;
      // Don't clobber an optimistic vote that's still on its way.
      setFeed((prev) => {
        if (!prev || inFlight.current.size === 0 || prev.week !== data.week) return data;
        const mine = new Map(prev.ideas.map((i) => [i.id, i]));
        return {
          ...data,
          ideas: data.ideas.map((i) => (inFlight.current.has(i.id) ? (mine.get(i.id) ?? i) : i)),
        };
      });
      setFeedError("");
    } catch {
      setFeedError("Couldn't load the wall. Refresh to try again.");
    }
  }, []);

  useEffect(() => {
    setFeed(null);
    void load(which);
  }, [which, load]);

  // Live-ish: refresh every 20s while the tab is visible.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(which);
    }, 20000);
    return () => window.clearInterval(id);
  }, [which, load]);

  // People who scanned the QR on a physical board get a hello, and we count the scan.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("from") !== "qr") return;
    setFromQr(true);
    let counted = false;
    try {
      counted = sessionStorage.getItem("olw-scan") === "1";
      sessionStorage.setItem("olw-scan", "1");
    } catch {
      /* private mode: count it anyway */
    }
    if (!counted) void fetch("/api/scan", { method: "POST" }).catch(() => {});
  }, []);

  const ideas = useMemo(() => {
    const list = (feed?.ideas ?? []).filter((i) => !hiddenForMe.has(i.id));
    return [...list].sort((a, b) =>
      sort === "top" ? b.score - a.score || b.createdAt - a.createdAt : b.createdAt - a.createdAt,
    );
  }, [feed, sort, hiddenForMe]);

  const leaderId = useMemo(() => {
    const top = [...(feed?.ideas ?? [])].sort((a, b) => b.score - a.score || a.createdAt - b.createdAt)[0];
    return top && top.score > 0 ? top.id : null;
  }, [feed]);

  const flashIdea = (id: string) => {
    setFlash(id);
    window.setTimeout(() => setFlash(null), 1500);
    document.getElementById(`idea-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setFormMsg(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, format, name, year, website: honey }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data.duplicateOf) {
        setFormMsg({ kind: "error", text: data.error });
        if (which !== "current") setWhich("current");
        else flashIdea(data.duplicateOf);
        return;
      }
      if (!res.ok) {
        setFormMsg({ kind: "error", text: data.error ?? "Something went wrong. Try again." });
        return;
      }
      setText("");
      setFormMsg({ kind: "ok", text: "It's on the wall. Send this page to a friend so they can vote." });
      setSort("new");
      if (which !== "current") setWhich("current");
      else {
        setFeed((prev) => (prev ? { ...prev, ideas: [data.idea, ...prev.ideas] } : prev));
        window.setTimeout(() => flashIdea(data.idea.id), 50);
      }
    } catch {
      setFormMsg({ kind: "error", text: "Couldn't reach the wall. Check your connection." });
    } finally {
      setSending(false);
    }
  }

  async function vote(idea: PublicIdea, dir: 1 | -1) {
    if (!feed?.isCurrent || inFlight.current.has(idea.id)) return;
    const value = idea.myVote === dir ? 0 : dir;
    const apply = (i: PublicIdea, v: -1 | 0 | 1): PublicIdea => {
      const up = i.up - (i.myVote === 1 ? 1 : 0) + (v === 1 ? 1 : 0);
      const down = i.down - (i.myVote === -1 ? 1 : 0) + (v === -1 ? 1 : 0);
      return { ...i, up, down, score: up - down, myVote: v };
    };
    const replace = (next: PublicIdea) =>
      setFeed((prev) => (prev ? { ...prev, ideas: prev.ideas.map((i) => (i.id === next.id ? next : i)) } : prev));

    inFlight.current.add(idea.id);
    replace(apply(idea, value));
    try {
      const res = await fetch(`/api/ideas/${idea.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      replace(data.idea);
    } catch (err) {
      replace(idea);
      setFeedError(err instanceof Error && err.message ? err.message : "Your vote didn't go through. Try again.");
    } finally {
      inFlight.current.delete(idea.id);
    }
  }

  async function report(idea: PublicIdea) {
    if (!window.confirm("Report this pitch? It's hidden for you now, and pitches with a few reports come down until we review them.")) {
      return;
    }
    setHiddenForMe((s) => new Set(s).add(idea.id));
    await fetch(`/api/ideas/${idea.id}/report`, { method: "POST" }).catch(() => {});
  }

  return (
    <div className="board-frame pitch-wrap">
      <div className="pitch-grid">
        {/* ---------- Form ---------- */}
        <div>
          {fromQr && (
            <div className="welcome" role="status">
              <span className="hand">Hey, you found the wall!</span>
              <span>Pitch a prompt, or vote on the ones below.</span>
            </div>
          )}
          <p className="kicker" style={{ "--kicker": MARKERS.blue } as CSSProperties}>
            Your turn
          </p>
          <h2 className="h2" id="pitch-title">
            Pitch next week&apos;s wall.
          </h2>
          <p className="lede" style={{ marginBottom: 26 }}>
            Suggest a prompt and vote on everyone else&apos;s. Whatever&apos;s on top Sunday night goes up on the boards
            Monday.
          </p>

          <form onSubmit={submit} noValidate>
            <label className="field">
              <span className="field-label">
                Your prompt
                <small>
                  {text.length}/{MAX}
                </small>
              </span>
              <textarea
                className="textarea"
                value={text}
                maxLength={MAX}
                required
                placeholder="Favorite place to eat in town…"
                onChange={(e) => setText(e.target.value)}
                style={{ color: formatColor(format) }}
              />
            </label>

            <div className="field">
              <span className="field-label">Need a starter?</span>
              <div className="chips">
                {promptStarters.map((s) => (
                  <button
                    type="button"
                    key={s.text}
                    className="chip"
                    onClick={() => {
                      setText(s.text);
                      setFormat(s.format);
                    }}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="field" role="group" aria-labelledby="format-label">
              <span className="field-label" id="format-label">
                What kind of wall?
              </span>
              <div className="chips">
                {[...formats.map((f) => ({ id: f.id, color: MARKERS[f.color] })), { id: "other" as FormatId, color: MARKERS.navy }].map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    className="chip"
                    aria-pressed={format === f.id}
                    onClick={() => setFormat(f.id)}
                  >
                    <span className="chip-dot" style={{ "--c": f.color } as CSSProperties} />
                    {formatLabel(f.id)}
                  </button>
                ))}
              </div>
            </div>

            <div className="row">
              <label className="field">
                <span className="field-label">
                  Sign it <small>optional</small>
                </span>
                <input
                  className="input"
                  value={name}
                  maxLength={24}
                  placeholder="First name or initials"
                  autoComplete="given-name"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">
                  Class <small>optional</small>
                </span>
                <select className="select" value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">—</option>
                  {classYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="hp" aria-hidden="true">
              Website
              <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
            </label>

            <button className="btn" type="submit" disabled={sending || text.trim().length < 3}>
              {sending ? "Adding…" : "Put it on the wall"} <span className="arrow">→</span>
            </button>
            <p className="form-note">
              Basic filter on: slurs, profanity, links, and phone numbers don&apos;t make it up. Keep it something
              you&apos;d write in the Commons.
            </p>
            {formMsg && (
              <p className={`msg ${formMsg.kind}`} role={formMsg.kind === "error" ? "alert" : "status"}>
                {formMsg.text}
              </p>
            )}
          </form>
        </div>

        {/* ---------- Live feed ---------- */}
        <div aria-labelledby="feed-title">
          <div className="feed-head">
            <div>
              <h3 className="h3" id="feed-title">
                {which === "current" ? "This week's pitches" : "Last week's pitches"}
              </h3>
              <p className="feed-sub">
                {feed ? feed.weekLabel : "Loading…"}
                {feed && !feed.isCurrent ? " · voting closed" : " · voting closes Sunday night"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div className="seg" role="group" aria-label="Sort">
                <button aria-pressed={sort === "top"} onClick={() => setSort("top")}>
                  Top
                </button>
                <button aria-pressed={sort === "new"} onClick={() => setSort("new")}>
                  New
                </button>
              </div>
              <div className="seg" role="group" aria-label="Week">
                <button aria-pressed={which === "current"} onClick={() => setWhich("current")}>
                  This week
                </button>
                <button aria-pressed={which === "previous"} onClick={() => setWhich("previous")}>
                  Last week
                </button>
              </div>
            </div>
          </div>

          {feedError && (
            <p className="msg error" role="alert" style={{ marginBottom: 12 }}>
              {feedError}
            </p>
          )}

          {!feed ? (
            <div className="feed" aria-busy="true">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ) : ideas.length === 0 ? (
            <div className="empty">
              <span className="hand">The board&apos;s blank.</span>
              {feed.isCurrent ? "Be the first line. Pitch a prompt and the rest will follow." : "Nothing was pitched that week."}
            </div>
          ) : (
            <ol className="feed" aria-live="polite">
              {ideas.map((idea) => (
                <li
                  key={idea.id}
                  id={`idea-${idea.id}`}
                  className={`idea${idea.id === leaderId ? " lead" : ""}${flash === idea.id ? " flash" : ""}`}
                >
                  <div className="vote">
                    <button
                      className="up"
                      aria-pressed={idea.myVote === 1}
                      aria-label={`Upvote “${idea.text}”`}
                      disabled={!feed.isCurrent}
                      onClick={() => vote(idea, 1)}
                    >
                      <Arrow />
                    </button>
                    <span className="score" aria-label={`Score ${idea.score}`}>
                      {idea.score}
                    </span>
                    <button
                      className="down"
                      aria-pressed={idea.myVote === -1}
                      aria-label={`Downvote “${idea.text}”`}
                      disabled={!feed.isCurrent}
                      onClick={() => vote(idea, -1)}
                    >
                      <Arrow down />
                    </button>
                  </div>
                  <div>
                    <p className="idea-text" style={{ "--c": formatColor(idea.format) } as CSSProperties}>
                      {idea.text}
                    </p>
                    <div className="idea-meta">
                      {idea.id === leaderId && <span className="badge">{feed.isCurrent ? "Leading" : "Winner"}</span>}
                      {idea.mine && <span className="badge you">Yours</span>}
                      <span className="tag">
                        <span className="chip-dot" style={{ "--c": formatColor(idea.format) } as CSSProperties} />
                        {formatLabel(idea.format)}
                      </span>
                      {(idea.name || idea.year) && (
                        <span>
                          {idea.name || "Anonymous"}
                          {idea.year ? ` ${idea.year}` : ""}
                        </span>
                      )}
                      <span>{timeAgo(idea.createdAt)}</span>
                      {!idea.mine && (
                        <button className="report" onClick={() => report(idea)}>
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {feed?.storage === "memory" && (
            <p className="storage-note">
              Preview mode: pitches are stored in memory and reset when the server restarts. Connect Upstash Redis in
              Vercel to keep them.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
