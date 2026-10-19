import { NextResponse } from "next/server";
import { formats, type FormatId } from "@/content/site";
import { moderate } from "@/lib/moderation";
import {
  adminEnabled,
  checkAdminPassword,
  clientIp,
  isAdmin,
  jsonError,
  readJson,
  setAdminCookie,
} from "@/lib/request";
import { getStore } from "@/lib/store";
import { isWeekKey, weekKey, weekLabel } from "@/lib/week";

export async function GET(req: Request) {
  if (!(await isAdmin())) return jsonError("Not signed in.", 401);
  const store = getStore();
  const current = weekKey();
  const param = new URL(req.url).searchParams.get("week");
  const week = param && isWeekKey(param) ? param : current;
  const [ideas, weeks, prompt, stats, subscribers] = await Promise.all([
    store.listIdeas(week),
    store.listWeeks(),
    store.getPrompt(),
    store.stats(),
    store.listSubscribers(),
  ]);
  return NextResponse.json(
    {
      week,
      weekLabel: weekLabel(week),
      currentWeek: current,
      weeks: [...new Set([current, ...weeks])],
      storage: store.kind,
      prompt,
      stats: { ...stats, subscribers: subscribers.length },
      ideas: ideas
        .map(({ voter: _voter, ...rest }) => ({ ...rest, score: rest.up - rest.down }))
        .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const store = getStore();

  if (body.action === "login") {
    if (!adminEnabled()) return jsonError("Set ADMIN_PASSWORD in Vercel to turn on the admin page.", 503);
    if (!(await store.allow(`admin:ip:${await clientIp()}`, 10, 60 * 15))) {
      return jsonError("Too many tries. Wait 15 minutes.", 429);
    }
    if (!checkAdminPassword(body.password)) return jsonError("Wrong password.", 401);
    return setAdminCookie(NextResponse.json({ ok: true }), true);
  }

  if (body.action === "logout") return setAdminCookie(NextResponse.json({ ok: true }), false);

  if (!(await isAdmin())) return jsonError("Not signed in.", 401);

  const id = typeof body.id === "string" ? body.id : "";
  switch (body.action) {
    case "hide":
    case "unhide":
      await store.setHidden(id, body.action === "hide");
      return NextResponse.json({ ok: true });
    case "delete":
      await store.deleteIdea(id);
      return NextResponse.json({ ok: true });
    case "setPrompt": {
      const title = moderate(body.title, { min: 2, max: 120, field: "prompt" });
      if (!title.ok) return jsonError(title.reason);
      const detail = typeof body.detail === "string" ? body.detail.trim().slice(0, 160) : "";
      const format = (formats.some((f) => f.id === body.format) ? body.format : "other") as FormatId;
      await store.setPrompt({ title: title.text, detail, format });
      return NextResponse.json({ ok: true });
    }
    default:
      return jsonError("Unknown action.");
  }
}
