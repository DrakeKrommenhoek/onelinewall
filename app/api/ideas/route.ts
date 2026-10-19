import { NextResponse } from "next/server";
import { classYears, formats, type FormatId } from "@/content/site";
import { fingerprint, moderate } from "@/lib/moderation";
import { clientIp, getVoter, jsonError, readJson, withVoterCookie } from "@/lib/request";
import { getStore, publicIdea } from "@/lib/store";
import { isWeekKey, previousWeekKey, weekKey, weekLabel } from "@/lib/week";

const FORMAT_IDS = new Set<string>([...formats.map((f) => f.id), "other"]);

export async function GET(req: Request) {
  const store = getStore();
  const voter = await getVoter();
  const current = weekKey();
  const param = new URL(req.url).searchParams.get("week") ?? "current";
  const week =
    param === "current" ? current : param === "previous" ? previousWeekKey(current) : isWeekKey(param) ? param : current;

  const ideas = (await store.listIdeas(week)).filter((i) => !i.hidden);
  const votes = await store.getVotes(
    ideas.map((i) => i.id),
    voter.id,
  );
  const res = NextResponse.json(
    {
      week,
      weekLabel: weekLabel(week),
      isCurrent: week === current,
      storage: store.kind,
      ideas: ideas.map((i) => publicIdea(i, votes[i.id] ?? 0, voter.id)),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
  return withVoterCookie(res, voter);
}

export async function POST(req: Request) {
  const store = getStore();
  const voter = await getVoter();
  const body = await readJson(req);

  // Bots fill every field; people never see this one.
  if (typeof body.website === "string" && body.website) return jsonError("Something went wrong.");

  const pitch = moderate(body.text, { field: "pitch" });
  if (!pitch.ok) return jsonError(pitch.reason);

  let name = "";
  if (typeof body.name === "string" && body.name.trim()) {
    const checked = moderate(body.name, { min: 1, max: 24, field: "name" });
    if (!checked.ok) return jsonError(checked.reason);
    name = checked.text;
  }
  const year = typeof body.year === "string" && classYears.includes(body.year) ? body.year : "";
  const format = (typeof body.format === "string" && FORMAT_IDS.has(body.format) ? body.format : "other") as FormatId;

  const ip = await clientIp();
  const allowed =
    (await store.allow(`pitch:v:${voter.id}`, 5, 60 * 60 * 24)) &&
    (await store.allow(`pitch:ip:${ip}`, 20, 60 * 60));
  if (!allowed) return jsonError("That's a lot of pitches. Give the wall a breather and try later.", 429);

  const result = await store.addIdea(
    { text: pitch.text, format, name, year, week: weekKey(), voter: voter.id },
    fingerprint(pitch.text),
  );
  if (!result.ok) {
    return withVoterCookie(
      NextResponse.json(
        { error: "Someone already pitched that one. Give it an upvote instead.", duplicateOf: result.duplicateOf },
        { status: 409 },
      ),
      voter,
    );
  }

  // Your own pitch starts with your upvote.
  const idea = (await store.vote(result.idea.id, voter.id, 1)) ?? result.idea;
  return withVoterCookie(NextResponse.json({ idea: publicIdea(idea, 1, voter.id) }, { status: 201 }), voter);
}
