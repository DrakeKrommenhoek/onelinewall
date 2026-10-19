import { NextResponse } from "next/server";
import { clientIp, getVoter, jsonError, withVoterCookie } from "@/lib/request";
import { getStore } from "@/lib/store";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const voter = await getVoter();
  const ip = await clientIp();
  if (!(await store.allow(`report:ip:${ip}`, 30, 60 * 60))) return jsonError("Slow down a little.", 429);
  if (!(await store.getIdea(id))) return jsonError("That pitch isn't on the wall anymore.", 404);
  await store.report(id, voter.id);
  return withVoterCookie(NextResponse.json({ ok: true }), voter);
}
