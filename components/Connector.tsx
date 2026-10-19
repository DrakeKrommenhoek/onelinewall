import type { CSSProperties } from "react";
import { MARKERS, type MarkerName } from "@/content/site";

const PATHS = [
  "M-20 60 C 150 10, 260 110, 420 60 S 640 -10, 760 60 S 980 120, 1220 50",
  "M-20 80 C 200 80, 330 20, 470 40 C 610 60, 600 115, 540 105 C 470 95, 520 20, 640 25 C 800 30, 950 95, 1220 40",
  "M-20 30 C 120 30, 160 100, 280 95 S 420 20, 560 30 S 700 100, 840 90 S 1060 20, 1220 60",
  "M-20 60 C 300 60, 420 100, 560 70 C 680 45, 690 10, 640 12 C 590 14, 600 80, 700 90 C 860 105, 1000 30, 1220 70",
];

/** One person's line, drawn between two sections, joining the page together as you scroll. */
export default function Connector({ color, variant = 0 }: { color: MarkerName; variant?: number }) {
  return (
    <svg
      className="connector"
      data-draw
      viewBox="0 -20 1200 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ "--c": MARKERS[color] } as CSSProperties}
    >
      <path pathLength={1} d={PATHS[variant % PATHS.length]} />
    </svg>
  );
}
