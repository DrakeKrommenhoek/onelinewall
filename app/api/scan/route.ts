import { NextResponse } from "next/server";
import { clientIp } from "@/lib/request";
import { getStore } from "@/lib/store";

// Counts QR scans so we can tell which boards actually get used.
export async function POST() {
  const store = getStore();
  if (await store.allow(`scan:ip:${await clientIp()}`, 20, 60 * 60)) await store.hit("qr_scans");
  return NextResponse.json({ ok: true });
}
