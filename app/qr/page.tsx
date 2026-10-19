import type { Metadata } from "next";
import QRCode from "qrcode";
import PrintButton from "@/components/PrintButton";
import { qrTarget, siteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "QR poster",
  description: "Print this and tape it next to a whiteboard.",
  robots: { index: false },
};

export default async function QrPoster() {
  const svg = await QRCode.toString(qrTarget(), {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0b2a5b", light: "#ffffff" },
  });
  const display = siteUrl().replace(/^https?:\/\//, "");

  return (
    <section className="section page-print" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="poster-tools no-print">
          <p className="form-note" style={{ margin: 0 }}>
            Print on letter paper and tape it next to a board. Scans are counted on the admin page.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="btn btn-ghost btn-sm" href="/api/qr?format=png" download="one-line-wall-qr.png">
              Download PNG
            </a>
            <a className="btn btn-ghost btn-sm" href="/api/qr" download="one-line-wall-qr.svg">
              Download SVG
            </a>
            <PrintButton />
          </div>
        </div>

        <div className="board-frame poster">
          <div>
            <h1 className="poster-title">
              Add one line.
              <br />
              <span className="navy">See what we make.</span>
            </h1>
            <p className="poster-rule">One stroke each. Connect it to someone else&apos;s, or start something new.</p>
          </div>
          <div className="poster-qr" dangerouslySetInnerHTML={{ __html: svg }} />
          <div>
            <p className="poster-cta">Scan to pitch next week&apos;s wall →</p>
            <p className="poster-url">{display}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
