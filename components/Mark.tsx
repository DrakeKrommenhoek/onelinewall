import type { CSSProperties, ReactNode } from "react";
import { MARKERS, type MarkerName } from "@/content/site";

/** A word with a hand-drawn marker underline that draws in on scroll. */
export default function Mark({ children, color = "red" }: { children: ReactNode; color?: MarkerName }) {
  return (
    <span className="mark" data-draw style={{ "--c": MARKERS[color] } as CSSProperties}>
      {children}
      <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M3 13 C 40 6, 84 4, 122 9 S 178 15, 197 6" />
      </svg>
    </span>
  );
}
