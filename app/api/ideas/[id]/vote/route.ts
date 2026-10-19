import { NextResponse } from "next/server";
import { clientIp, getVoter, jsonError, readJson, withVoterCookie } from "@/lib/request";
import { getStore, publicIdea, type Vote } from "@/lib/store";
import { weekKey } from "@/lib/week";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const voter = await getVoter();
  const body = await readJson(req);
  const value = Number(body.value);
  if (![1, 0, -1].includes(value)) return jsonError("Votes are up, down, or nothing.");

  const idea = await store.getIdea(id);
  if (!idea || idea.hidden) return jsonError("That pitch isn't on the wall anymore.", 404);
  if (idea.week !== weekKey()) return jsonError("Voting on that week is closed.", 409);

  const ip = await clientIp();
  if (!(await store.allow(`vote:ip:${ip}`, 300, 60 * 60))) return jsonError("Slow down a little.", 429);

  const updated = await store.vote(id, voter.id, value as Vote);
  if (!updated) return jsonError("That pitch isn't on the wall anymore.", 404);
  return withVoterCookie(NextResponse.json({ idea: publicIdea(updated, value as Vote, voter.id) }), voter);
}
