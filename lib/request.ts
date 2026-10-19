import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

const VOTER_COOKIE = "olw_vid";
const ADMIN_COOKIE = "olw_admin";
const YEAR = 60 * 60 * 24 * 365;

/** Anonymous per-browser id used for one-vote-per-pitch and rate limits. */
export async function getVoter(): Promise<{ id: string; isNew: boolean }> {
  const existing = (await cookies()).get(VOTER_COOKIE)?.value;
  if (existing && /^[a-f0-9]{24}$/.test(existing)) return { id: existing, isNew: false };
  return { id: crypto.randomUUID().replace(/-/g, "").slice(0, 24), isNew: true };
}

export function withVoterCookie<T extends NextResponse>(res: T, voter: { id: string; isNew: boolean }): T {
  if (voter.isNew) {
    res.cookies.set(VOTER_COOKIE, voter.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: YEAR,
      path: "/",
    });
  }
  return res;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// --- Admin -----------------------------------------------------------------------------------

export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function adminToken(): string {
  return createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update("olw-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkAdminPassword(password: unknown): boolean {
  return adminEnabled() && typeof password === "string" && safeEqual(password, process.env.ADMIN_PASSWORD!);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(value) && safeEqual(value!, adminToken());
}

export function setAdminCookie(res: NextResponse, on: boolean) {
  res.cookies.set(ADMIN_COOKIE, on ? adminToken() : "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: on ? 60 * 60 * 24 * 7 : 0,
    path: "/",
  });
  return res;
}
