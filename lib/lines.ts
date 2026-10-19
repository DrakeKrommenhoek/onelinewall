// Deterministic "marker strokes": the same seed always draws the same lines, so the
// server-rendered SVG and the browser agree.

export type Pt = { x: number; y: number };

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(points: Pt[]): string {
  if (points.length < 2) return "";
  const f = (n: number) => Math.round(n * 10) / 10;
  let d = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

/** A wandering stroke that starts at `start` and stays inside the box. */
export function wander(
  start: Pt,
  rand: () => number,
  { width, height, steps = 5, reach = 160, pad = 30 }: { width: number; height: number; steps?: number; reach?: number; pad?: number },
): Pt[] {
  const pts: Pt[] = [start];
  let angle = rand() * Math.PI * 2;
  let { x, y } = start;
  for (let i = 0; i < steps; i++) {
    angle += (rand() - 0.5) * 2.2;
    const len = reach * (0.5 + rand() * 0.7);
    x += Math.cos(angle) * len;
    y += Math.sin(angle) * len;
    // Bounce off the edges of the board.
    if (x < pad || x > width - pad) {
      angle = Math.PI - angle;
      x = Math.min(width - pad, Math.max(pad, x));
    }
    if (y < pad || y > height - pad) {
      angle = -angle;
      y = Math.min(height - pad, Math.max(pad, y));
    }
    pts.push({ x, y });
  }
  return pts;
}

/** Many people, one board: each new line starts somewhere on a line that's already there. */
export function connectedLines(
  seed: number,
  count: number,
  box: { width: number; height: number; steps?: number; reach?: number },
): Pt[][] {
  const rand = rng(seed);
  const lines: Pt[][] = [];
  for (let i = 0; i < count; i++) {
    const start =
      lines.length && rand() < 0.85
        ? (() => {
            const host = lines[Math.floor(rand() * lines.length)];
            return { ...host[Math.floor(rand() * host.length)] };
          })()
        : { x: box.width * (0.2 + rand() * 0.6), y: box.height * (0.2 + rand() * 0.6) };
    lines.push(wander(start, rand, { ...box, steps: box.steps ?? 3 + Math.floor(rand() * 4) }));
  }
  return lines;
}
