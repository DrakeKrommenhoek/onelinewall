/** Absolute base URL of the site, used for the QR code and social cards. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Where the QR code on the physical whiteboard sends people. */
export function qrTarget(): string {
  return `${siteUrl()}/?from=qr#pitch`;
}
