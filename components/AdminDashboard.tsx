"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { formatLabel, formats, type FormatId } from "@/content/site";
import type { Idea, Prompt } from "@/lib/store";

type AdminIdea = Omit<Idea, "voter"> & { score: number };
type Data = {
  week: string;
  weekLabel: string;
  currentWeek: string;
  weeks: string[];
  storage: "redis" | "memory";
  prompt: Prompt;
  stats: Record<string, number>;
  ideas: AdminIdea[];
};

async function post(body: Record<string, unknown>) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed.");
  return data;
}

export default function AdminDashboard() {
  const [week, setWeek] = useState<string>("");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [prompt, setPrompt] = useState<Prompt>({ title: "", detail: "", format: "one-line" });

  const load = useCallback(async (w: string) => {
    const res = await fetch(`/api/admin${w ? `?week=${w}` : ""}`, { cache: "no-store" });
    if (res.status === 401) return window.location.reload();
    const d = (await res.json()) as Data;
    setData(d);
    setPrompt((p) => (p.title ? p : d.prompt));
  }, []);

  useEffect(() => {
    void load(week);
  }, [week, load]);

  async function act(action: string, id: string) {
    if (action === "delete" && !window.confirm("Delete this pitch for good?")) return;
    try {
      await post({ action, id });
      await load(week);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function savePrompt(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await post({ action: "setPrompt", ...prompt });
      setSaved("Saved. The banner updates within a minute.");
      window.setTimeout(() => setSaved(""), 4000);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function logout() {
    await post({ action: "logout" }).catch(() => {});
    window.location.href = "/";
  }

  if (!data) return <div className="skeleton" style={{ height: 300 }} />;

  const s = data.stats;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <h1 className="h2" style={{ fontSize: "2.2rem" }}>
          Wall admin
        </h1>
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Sign out
        </button>
      </div>

      {data.storage === "memory" && (
        <p className="msg error" style={{ marginBottom: 20 }}>
          Storage is in memory, so everything resets on redeploy. Connect Upstash Redis in Vercel → Storage, then
          redeploy.
        </p>
      )}
      {error && (
        <p className="msg error" role="alert" style={{ marginBottom: 20 }}>
          {error}
        </p>
      )}

      <div className="board-frame admin-card">
        <h2>Numbers</h2>
        <div className="stats">
          {[
            ["QR scans", s.qr_scans],
            ["Pitches", s.pitches],
            ["Votes cast", s.votes],
            ["Newsletter sign-ups", s.subscribers],
          ].map(([label, n]) => (
            <div className="stat" key={label as string}>
              <b>{(n as number) ?? 0}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <form className="board-frame admin-card" onSubmit={savePrompt}>
        <h2>This week&apos;s prompt (top banner)</h2>
        <div className="row">
          <label className="field">
            <span className="field-label">Prompt</span>
            <input className="input" value={prompt.title} maxLength={120} onChange={(e) => setPrompt({ ...prompt, title: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">Format</span>
            <select className="select" value={prompt.format} onChange={(e) => setPrompt({ ...prompt, format: e.target.value as FormatId })}>
              {formats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span className="field-label">
            Detail <small>optional</small>
          </span>
          <input className="input" value={prompt.detail} maxLength={160} onChange={(e) => setPrompt({ ...prompt, detail: e.target.value })} />
        </label>
        <button className="btn btn-sm">Save prompt</button>
        {saved && <p className="msg ok">{saved}</p>}
      </form>

      <div className="board-frame admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Pitches · {data.weekLabel}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="select" style={{ width: "auto" }} value={data.week} onChange={(e) => setWeek(e.target.value)}>
              {data.weeks.map((w) => (
                <option key={w} value={w}>
                  Week of {w}
                  {w === data.currentWeek ? " (now)" : ""}
                </option>
              ))}
            </select>
            <a className="btn btn-ghost btn-sm" href={`/api/admin/export?type=ideas&week=${data.week}`}>
              Export week CSV
            </a>
            <a className="btn btn-ghost btn-sm" href="/api/admin/export?type=ideas">
              Export all
            </a>
            <a className="btn btn-ghost btn-sm" href="/api/admin/export?type=subscribers">
              Export emails
            </a>
          </div>
        </div>
        {data.ideas.length === 0 ? (
          <p className="form-note">No pitches this week yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Pitch</th>
                  <th>By</th>
                  <th>Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.ideas.map((i) => (
                  <tr key={i.id} className={i.hidden ? "is-hidden" : ""}>
                    <td>
                      <b>{i.score}</b>
                      <br />
                      <small>
                        +{i.up} / −{i.down}
                      </small>
                    </td>
                    <td>
                      {i.text}
                      <br />
                      <small>{formatLabel(i.format)}</small>
                      {i.hidden && <span className="badge" style={{ marginLeft: 8 }}>Hidden</span>}
                    </td>
                    <td>
                      {i.name || "—"} {i.year}
                    </td>
                    <td>{i.reports}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="link-btn"
                          onClick={async () => {
                            try {
                              await post({ action: "setPrompt", title: i.text, detail: "", format: i.format });
                              setPrompt({ title: i.text, detail: "", format: i.format });
                              setSaved("Made it this week's prompt.");
                              window.setTimeout(() => setSaved(""), 4000);
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        >
                          Make it the prompt
                        </button>
                        <button className="link-btn" onClick={() => act(i.hidden ? "unhide" : "hide", i.id)}>
                          {i.hidden ? "Unhide" : "Hide"}
                        </button>
                        <button className="link-btn danger" onClick={() => act("delete", i.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
