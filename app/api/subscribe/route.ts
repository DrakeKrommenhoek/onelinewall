import { NextResponse } from "next/server";
import { clientIp, jsonError, readJson } from "@/lib/request";
import { getStore } from "@/lib/store";

const WLU_EMAIL = /^[a-z0-9._%+-]+@(?:mail\.)?wlu\.edu$/i;

export async function POST(req: Request) {
  const body = await readJson(req);
  if (typeof body.website === "string" && body.website) return jsonError("Something went wrong.");
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!WLU_EMAIL.test(email)) return jsonError("Use your W&L email (ends in wlu.edu).");

  const store = getStore();
  if (!(await store.allow(`sub:ip:${await clientIp()}`, 10, 60 * 60))) return jsonError("Try again in a bit.", 429);
  const added = await store.addSubscriber(email);
  return NextResponse.json({ ok: true, already: !added });
}
