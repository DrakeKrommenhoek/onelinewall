"use client";

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { MARKERS, type MarkerName } from "@/content/site";
import { connectedLines, rng, wander, type Pt } from "@/lib/lines";

const W = 800;
const H = 600;
const PICKS: MarkerName[] = ["blue", "red", "green", "orange", "purple"];

type Stroke = { pts: Pt[]; color: string; width: number; progress: number };
type Phase = "idle" | "drawing" | "joining" | "done";

const STATUS: Record<Phase, string> = {
  idle: "Your turn. Pick a marker, draw one line.",
  drawing: "Keep going…",
  joining: "Now watch what happens.",
  done: "That's the wall. Three people just built on your line.",
};

/** Densify a polyline into a smooth curve (Catmull-Rom), so lines animate evenly. */
function sample(points: Pt[], per = 14): Pt[] {
  if (points.length < 3) return points;
  const out: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    for (let s = 0; s < per; s++) {
      const t = s / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

function seedStrokes(): Stroke[] {
  const colors = [MARKERS.black, MARKERS.green, MARKERS.orange, MARKERS.purple];
  return connectedLines(200, 4, { width: W, height: H, reach: 130 }).map((pts, i) => ({
    pts: sample(pts),
    color: colors[i],
    width: 8,
    progress: 1,
  }));
}

export default function TryTheWall() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>(seedStrokes());
  const mine = useRef<Stroke | null>(null);
  const raf = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [color, setColor] = useState<MarkerName>("blue");

  const draw = useCallback(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const scale = c.width / W;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of strokes.current) {
      const n = Math.max(1, Math.floor(s.pts.length * s.progress));
      const pts = s.pts.slice(0, n);
      if (!pts.length) continue;
      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.globalAlpha = 0.94;
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, s.width / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      // Quadratic curves through midpoints: smooth, like a real marker.
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, []);

  // Keep the canvas sharp at any size.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const resize = () => {
      const rect = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(rect.width * dpr);
      c.height = Math.round(rect.width * dpr * (H / W));
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  const toBoard = (e: ReactPointerEvent): Pt => {
    const rect = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  };

  // Others arrive and build off your line.
  const join = useCallback(
    (yours: Stroke) => {
      setPhase("joining");
      const rand = rng(Math.floor(Math.random() * 1e9));
      const others = PICKS.filter((p) => MARKERS[p] !== yours.color);
      const anchors = [yours.pts[yours.pts.length - 1], yours.pts[Math.floor(yours.pts.length / 2)], yours.pts[0]];
      const newcomers: Stroke[] = anchors.map((a, i) => ({
        pts: sample(wander({ ...a }, rand, { width: W, height: H, steps: 3 + Math.floor(rand() * 3), reach: 110 })),
        color: MARKERS[others[i % others.length]],
        width: 8,
        progress: 0,
      }));
      strokes.current.push(...newcomers);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      const each = reduced ? 1 : 900;
      const gap = reduced ? 0 : 450;
      const tick = (now: number) => {
        let finished = true;
        newcomers.forEach((s, i) => {
          const t = (now - start - 500 - i * (each + gap)) / each;
          s.progress = Math.max(0, Math.min(1, t));
          if (s.progress < 1) finished = false;
        });
        draw();
        if (finished) {
          raf.current = null;
          setPhase("done");
        } else {
          raf.current = requestAnimationFrame(tick);
        }
      };
      raf.current = requestAnimationFrame(tick);
    },
    [draw],
  );

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (phase !== "idle") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    mine.current = { pts: [toBoard(e)], color: MARKERS[color], width: 9, progress: 1 };
    strokes.current.push(mine.current);
    setPhase("drawing");
    draw();
  };

  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (phase !== "drawing" || !mine.current) return;
    const p = toBoard(e);
    const last = mine.current.pts[mine.current.pts.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) > 2.5) {
      mine.current.pts.push(p);
      draw();
    }
  };

  const onUp = () => {
    if (phase !== "drawing" || !mine.current) return;
    const yours = mine.current;
    mine.current = null;
    join(yours);
  };

  // Keyboard and screen-reader friendly path to the same moment.
  const drawForMe = () => {
    if (phase !== "idle") return;
    const rand = rng(Math.floor(Math.random() * 1e9));
    const yours: Stroke = {
      pts: sample(wander({ x: 200 + rand() * 400, y: 180 + rand() * 240 }, rand, { width: W, height: H, steps: 4, reach: 120 })),
      color: MARKERS[color],
      width: 9,
      progress: 1,
    };
    strokes.current.push(yours);
    draw();
    join(yours);
  };

  const wipe = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    strokes.current = seedStrokes();
    mine.current = null;
    setPhase("idle");
    draw();
  };

  return (
    <div className="try">
      <div className="try-copy" data-reveal>
        <p className="kicker" style={{ "--kicker": MARKERS.green } as CSSProperties}>
          Try it
        </p>
        <h2 className="h2">You get one line.</h2>
        <p className="lede">
          That&apos;s the whole rule. It takes five seconds and zero talent. The magic is what happens after you walk
          away.
        </p>
        <p className="try-status" aria-live="polite">
          {STATUS[phase]}
        </p>
        <fieldset className="picker" disabled={phase !== "idle"}>
          <legend className="sr-only">Marker color</legend>
          {PICKS.map((p) => (
            <label key={p}>
              <input type="radio" name="marker" value={p} checked={color === p} onChange={() => setColor(p)} />
              <span className="swatch" style={{ "--c": MARKERS[p] } as CSSProperties} />
              <span className="sr-only">{p}</span>
            </label>
          ))}
        </fieldset>
        <div className="hero-ctas">
          {phase === "done" ? (
            <button className="btn" onClick={wipe}>
              Wipe the board
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={drawForMe} disabled={phase !== "idle"}>
              Draw one for me
            </button>
          )}
        </div>
      </div>
      <div className="board-frame try-board" data-reveal style={{ "--d": "0.1s" } as CSSProperties}>
        <canvas
          ref={canvas}
          className={phase === "idle" || phase === "drawing" ? "" : "locked"}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="img"
          aria-label="A shared whiteboard. Draw one line with your mouse or finger, then watch others connect to it."
        />
        <div className="try-hint" style={{ opacity: phase === "idle" ? 1 : 0 }} aria-hidden="true">
          draw one line here ✎
        </div>
      </div>
    </div>
  );
}
