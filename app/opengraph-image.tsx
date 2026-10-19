import { ImageResponse } from "next/og";
import { MARKERS } from "@/content/site";
import { connectedLines, smoothPath } from "@/lib/lines";

export const alt = "The One-Line Wall: add one line, see what we make.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = [MARKERS.blue, MARKERS.red, MARKERS.green, MARKERS.orange, MARKERS.purple];

export default function OpengraphImage() {
  const lines = connectedLines(2026, 12, { width: 1200, height: 630, reach: 170 });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#d9dde2", padding: 18 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            position: "relative",
            background: "#fbfbf9",
            borderRadius: 22,
            overflow: "hidden",
          }}
        >
          <svg width="1164" height="594" viewBox="0 0 1200 630" style={{ position: "absolute", inset: 0 }}>
            {lines.map((pts, i) => (
              <path
                key={i}
                d={smoothPath(pts)}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={9}
                strokeLinecap="round"
                opacity={0.9}
              />
            ))}
          </svg>
          <div style={{ position: "absolute", left: 56, bottom: 56, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", background: "#fff", padding: "6px 22px", borderRadius: 10, fontSize: 92, fontWeight: 800, letterSpacing: -3, color: "#1b1c20", transform: "rotate(-1.5deg)" }}>
              Add one line.
            </div>
            <div style={{ display: "flex", background: "#fff", padding: "6px 22px", borderRadius: 10, fontSize: 92, fontWeight: 800, letterSpacing: -3, color: "#0b2a5b", marginLeft: 50, transform: "rotate(1deg)" }}>
              See what we make.
            </div>
            <div style={{ display: "flex", background: "#0b2a5b", color: "#fff", padding: "10px 20px", borderRadius: 999, fontSize: 28, fontWeight: 700, alignSelf: "flex-start", marginTop: 6 }}>
              The One-Line Wall · W&amp;L
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
