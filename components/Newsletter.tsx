"use client";

import { type CSSProperties, type FormEvent, useState } from "react";
import { MARKERS } from "@/content/site";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [honey, setHoney] = useState("");
  const [state, setState] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setState(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setState({ kind: "error", text: data.error ?? "Something went wrong." });
      else {
        setState({
          kind: "ok",
          text: data.already ? "You're already on the list. See you Monday." : "You're in. First issue lands Monday.",
        });
        setEmail("");
      }
    } catch {
      setState({ kind: "error", text: "Couldn't reach the server. Try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="board-frame newsletter">
      <div data-reveal>
        <p className="kicker" style={{ "--kicker": MARKERS.purple } as CSSProperties}>
          Coming soon
        </p>
        <h2 className="h2">The Weekly Line.</h2>
        <p className="lede">
          A short email to the student body that turns the wall into something you can scroll through between classes.
        </p>
        <ul>
          <li style={{ "--c": MARKERS.blue } as CSSProperties}>A photo of last week&apos;s finished wall</li>
          <li style={{ "--c": MARKERS.red } as CSSProperties}>The best answers, from movies to study spots</li>
          <li style={{ "--c": MARKERS.green } as CSSProperties}>This week&apos;s prompt and where to find the boards</li>
        </ul>
      </div>
      <form onSubmit={submit} data-reveal style={{ "--d": "0.1s" } as CSSProperties}>
        <div className="field" style={{ marginBottom: 12 }}>
          <label className="field-label" htmlFor="nl-email">
            Your W&amp;L email
          </label>
          <div className="newsletter-form">
            <input
              id="nl-email"
              className="input"
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              placeholder="you@mail.wlu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn" type="submit" disabled={sending}>
              {sending ? "Adding…" : "Get it Mondays"}
            </button>
          </div>
        </div>
        <label className="hp" aria-hidden="true">
          Website
          <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
        </label>
        <p className="form-note">W&amp;L addresses only. One email a week, and we&apos;ll never share your address.</p>
        {state && (
          <p className={`msg ${state.kind}`} role={state.kind === "error" ? "alert" : "status"}>
            {state.text}
          </p>
        )}
      </form>
    </div>
  );
}
