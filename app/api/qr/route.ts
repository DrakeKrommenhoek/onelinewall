import QRCode from "qrcode";
import { qrTarget } from "@/lib/siteUrl";

// /api/qr -> SVG, /api/qr?format=png -> 1200px PNG. Handy for Canva or a printed sign.
export async function GET(req: Request) {
  const format = new URL(req.url).searchParams.get("format");
  const opts = { margin: 2, color: { dark: "#0b2a5b", light: "#ffffff" }, errorCorrectionLevel: "M" as const };
  if (format === "png") {
    const png = await QRCode.toBuffer(qrTarget(), { ...opts, width: 1200 });
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="one-line-wall-qr.png"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  const svg = await QRCode.toString(qrTarget(), { ...opts, type: "svg" });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
  });
}
