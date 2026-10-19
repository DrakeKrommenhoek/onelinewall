import type { CSSProperties } from "react";
import { MARKERS } from "@/content/site";
import { connectedLines, rng, smoothPath } from "@/lib/lines";

const W = 1600;
const H = 1000;
const COLORS = [MARKERS.blue, MARKERS.red, MARKERS.green, MARKERS.orange, MARKERS.purple, MARKERS.black];

// Computed once per server/client module load; seeded, so both sides draw the same picture.
const strokes = (() => {
  const rand = rng(19);
  return connectedLines(2026, 18, { width: W, height: H, reach: 210 }).map((pts, i) => ({
    d: smoothPath(pts),
    color: COLORS[i % COLORS.length],
    width: 7 + Math.round(rand() * 4),
    delay: 0.3 + i * 0.32,
    dur: 1 + rand() * 0.8,
  }));
})();

/** Lines appearing one at a time, each person building on someone else's. */
export default function HeroLines() {
  return (
    <svg className="hero-lines" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          pathLength={1}
          stroke={s.color}
          strokeWidth={s.width}
          style={{ "--delay": `${s.delay}s`, "--dur": `${s.dur}s` } as CSSProperties}
        />
      ))}
    </svg>
  );
}
