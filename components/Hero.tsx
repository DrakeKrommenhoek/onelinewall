"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { MARKERS, site } from "@/content/site";
import HeroLines from "./HeroLines";

const VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO || "/media/commons-timelapse.mp4";

export default function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      setPaused(true);
    }
    // The video may have loaded before hydration.
    if (v.readyState >= 2) setReady(true);
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="board-frame hero-board">
        <HeroLines />
        <video
          ref={video}
          className={`hero-video${ready ? " ready" : ""}`}
          src={VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={`Time-lapse of students adding one line at a time at our booth in ${site.booth.place}`}
          onLoadedData={() => setReady(true)}
        />
        <div className="hero-scrim" />

        <span className="hero-chip">
          <span className="dot" aria-hidden="true" />
          {ready ? "Time-lapse" : "Our first wall"} · {site.booth.place} · {site.booth.date}
        </span>
        {ready && (
          <button className="hero-pause" onClick={toggle} aria-label={paused ? "Play video" : "Pause video"}>
            {paused ? (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="3" y="2.5" width="3.5" height="11" rx="1" fill="currentColor" />
                <rect x="9.5" y="2.5" width="3.5" height="11" rx="1" fill="currentColor" />
              </svg>
            )}
          </button>
        )}

        <div className="hero-content">
          <h1 id="hero-title" className="h1">
            <span className="tape">Add one line.</span>
            <span className="tape">See what we make.</span>
          </h1>
          <p className="hero-sub">
            A whiteboard, a handful of markers, and one rule: <strong>you get one line.</strong> Connect it to someone
            else&apos;s or start something new. We&apos;re better together than we are alone.
          </p>
          <div className="hero-ctas">
            <Link href="#pitch" className="btn">
              Pitch next week&apos;s wall <span className="arrow">→</span>
            </Link>
            <Link href="#mission" className="btn btn-ghost">
              Why we built this
            </Link>
          </div>
        </div>
      </div>
      <div className="tray" aria-hidden="true">
        <div className="tray-markers">
          {[MARKERS.blue, MARKERS.red, MARKERS.green, MARKERS.black].map((c, i) => (
            <span
              key={c}
              className="marker-pen"
              style={{ "--c": c, "--r": `${[-2, 1.5, -1, 2][i]}deg` } as CSSProperties}
            >
              <span className="cap" />
              <span className="body" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
