"use client";

import { type FormEvent, useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", password }),
    });
    if (res.ok) window.location.reload();
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't sign in.");
      setBusy(false);
    }
  }

  return (
    <form className="board-frame admin-card" onSubmit={submit} style={{ maxWidth: 440, margin: "40px auto" }}>
      <h2>Team sign-in</h2>
      <label className="field">
        <span className="field-label">Password</span>
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Checking…" : "Sign in"}
      </button>
      {error && (
        <p className="msg error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
