import type { CSSProperties } from "react";
import Link from "next/link";
import Connector from "@/components/Connector";
import Hero from "@/components/Hero";
import Mark from "@/components/Mark";
import Newsletter from "@/components/Newsletter";
import PitchBoard from "@/components/PitchBoard";
import TryTheWall from "@/components/TryTheWall";
import { cadences, findings, formats, hesitations, MARKERS, quotes } from "@/content/site";
import { smoothPath, wander, rng } from "@/lib/lines";

const css = (vars: Record<string, string>) => vars as CSSProperties;

const NOTE_COLORS = ["--note-yellow", "--note-pink", "--note-blue", "--note-green", "--note-orange"];
const NOTE_TILT = [-2.2, 1.6, -0.8, 2.4, 1.2, -1.8, 2, -1.2];

const steps = [
  {
    color: MARKERS.blue,
    title: "Find a board.",
    body: "We put whiteboards where people already walk: the Commons, the library, the hallway you cut through every day.",
    path: "M4 30 C 20 4, 40 4, 60 22",
  },
  {
    color: MARKERS.red,
    title: "Add one line.",
    body: "One stroke. Straight, curly, tiny, huge. Hook it onto someone else's line or start somewhere empty.",
    path: "M4 20 C 14 36, 26 4, 36 20 S 56 36, 60 12",
  },
  {
    color: MARKERS.green,
    title: "Come back.",
    body: "By the end of the day it's something nobody planned and everybody made. We photograph every finished wall.",
    path: "M6 26 C 10 6, 30 4, 34 20 C 38 34, 54 30, 60 8",
  },
];

// Decorative lines in the mission band.
const missionLines = (() => {
  const rand = rng(7);
  const colors = [MARKERS.blue, MARKERS.red, MARKERS.green, MARKERS.orange, MARKERS.purple];
  let start = { x: 120, y: 120 };
  return colors.map((color, i) => {
    const pts = wander(start, rand, { width: 560, height: 420, steps: 4, reach: 110 });
    start = pts[pts.length - 1];
    return { d: smoothPath(pts), color, delay: `${i * 0.35}s` };
  });
})();

export default function Home() {
  return (
    <>
      <Hero />

      {/* ---------------- How it works ---------------- */}
      <section id="how" className="section">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker" style={css({ "--kicker": MARKERS.blue })}>
              How it works
            </p>
            <h2 className="h2">
              Five seconds. <Mark color="blue">No talent required.</Mark>
            </h2>
            <p className="lede">
              The One-Line Wall is the lowest-stakes way to make something with people you haven&apos;t met yet.
            </p>
          </div>
          <ol className="steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {steps.map((s, i) => (
              <li key={s.title} className="step" data-reveal style={css({ "--c": s.color, "--d": `${i * 0.1}s` })}>
                <span className="step-num">{i + 1}</span>
                <svg viewBox="0 0 64 40" aria-hidden="true">
                  <path d={s.path} />
                </svg>
                <h3 className="h3">{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Connector color="red" variant={1} />

      {/* ---------------- The problem ---------------- */}
      <section id="problem" className="section">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker">The problem</p>
            <h2 className="h2">
              Being creative here comes with <Mark color="red">a lot of questions.</Mark>
            </h2>
          </div>
          <div className="notes">
            {hesitations.map((q, i) => (
              <p
                key={q}
                className="note"
                data-reveal
                style={css({
                  "--bg": `var(${NOTE_COLORS[i % NOTE_COLORS.length]})`,
                  "--r": `${NOTE_TILT[i % NOTE_TILT.length]}deg`,
                  "--d": `${(i % 4) * 0.07}s`,
                })}
              >
                {q}
              </p>
            ))}
          </div>

          <h3 className="h2 so-what" data-reveal>
            So most of us just… <span className="strike">try something</span> don&apos;t.
          </h3>

          <div data-reveal>
            <p className="lede" style={{ marginBottom: 24 }}>
              We interviewed classmates about where creativity goes at W&amp;L. The answers kept landing in the same four
              places.
            </p>
          </div>
          <div className="findings">
            {findings.map((f, i) => (
              <div key={f.word} className="finding" data-reveal style={css({ "--c": MARKERS[f.color], "--d": `${i * 0.08}s` })}>
                <span className="word">{f.word}</span>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
          <div className="quotes">
            {quotes.map((q, i) => (
              <blockquote key={q} className="quote" data-reveal style={css({ "--d": `${i * 0.1}s` })}>
                {q}
                <footer>W&amp;L student, empathy interview</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <Connector color="green" variant={2} />

      {/* ---------------- Try it ---------------- */}
      <section id="try" className="section">
        <div className="wrap">
          <TryTheWall />
        </div>
      </section>

      {/* ---------------- Mission ---------------- */}
      <section id="mission" className="section mission">
        <svg className="mission-lines" data-draw viewBox="0 0 560 420" aria-hidden="true">
          {missionLines.map((l) => (
            <path key={l.color} d={l.d} pathLength={1} stroke={l.color} style={css({ "--delay": l.delay })} />
          ))}
        </svg>
        <div className="wrap" style={{ position: "relative" }}>
          <div data-reveal>
            <p className="kicker">Our mission</p>
            <p className="mission-statement">
              It starts as one line on a whiteboard. <span className="soft">Where we want it to go:</span> a campus that
              uses its spaces to make things together.
            </p>
            <p className="lede">
              Different colors, different people, one final design. The wall is a first step toward using our shared
              spaces to be more creative and more innovative, and toward a community where people share pieces of who
              they are and build off each other.
            </p>
          </div>
          <div className="pillars">
            {[
              {
                c: MARKERS.blue,
                t: "Low stakes",
                p: "One line takes five seconds. No sign-up, no skill, no wrong answer. Starting is the hard part, so we made it tiny.",
              },
              {
                c: MARKERS.orange,
                t: "Out in the open",
                p: "Boards go where lots of people walk by. Being seen is what keeps it kind, and it means anyone can join in.",
              },
              {
                c: MARKERS.green,
                t: "Better together",
                p: "Your line gets more interesting the second someone connects to it. Nobody makes the final picture alone.",
              },
            ].map((x, i) => (
              <div key={x.t} className="pillar" data-reveal style={css({ "--c": x.c, "--d": `${i * 0.1}s` })}>
                <h3>{x.t}</h3>
                <p>{x.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Formats ---------------- */}
      <section id="formats" className="section">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker" style={css({ "--kicker": MARKERS.orange })}>
              What the wall becomes
            </p>
            <h2 className="h2">
              One board. <Mark color="orange">A different game every week.</Mark>
            </h2>
            <p className="lede">
              The One-Line Wall is where it starts. Once people are used to grabbing a marker, the prompt can change.
            </p>
          </div>
          <div className="formats">
            {formats.map((f, i) => (
              <article
                key={f.id}
                className="format"
                data-reveal
                style={css({ "--c": MARKERS[f.color], "--d": `${(i % 3) * 0.08}s` })}
              >
                <svg viewBox="0 0 300 34" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    pathLength={1}
                    d={
                      [
                        "M4 22 C 60 4, 110 30, 160 16 S 250 4, 296 20",
                        "M4 18 C 40 30, 70 4, 110 18 S 180 32, 220 14 S 280 10, 296 22",
                        "M4 26 C 80 26, 120 6, 170 10 S 260 28, 296 12",
                        "M4 10 L 70 26 L 140 8 L 210 26 L 296 12",
                        "M4 20 C 30 4, 60 4, 80 20 S 130 34, 150 18 S 200 2, 230 18 S 280 30, 296 14",
                      ][i % 5]
                    }
                  />
                </svg>
                <h3 className="h3">{f.name}</h3>
                <p className="pitch">{f.pitch}</p>
                <p className="how">{f.how}</p>
                <p className="example">{f.example}</p>
              </article>
            ))}
            <Link href="#pitch" className="format format-yours" data-reveal style={css({ "--c": MARKERS.navy, "--d": "0.16s" })}>
              <h3 className="h3">Your idea here.</h3>
              <p className="how" style={{ flex: "none" }}>
                Got a better prompt? Pitch it below. The top-voted pitch goes up next week.
              </p>
              <p className="example">Pitch it →</p>
            </Link>
          </div>

          <div className="cadence" data-reveal>
            <span className="cadence-label">How often?</span>
            {cadences.map((c) => (
              <div key={c.name} className="cadence-item">
                <strong>{c.name}</strong>
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Connector color="blue" variant={3} />

      {/* ---------------- Pitch + vote ---------------- */}
      <section id="pitch" className="section" aria-labelledby="pitch-title">
        <div className="wrap">
          <PitchBoard />
        </div>
      </section>

      {/* ---------------- Newsletter ---------------- */}
      <section id="newsletter" className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Newsletter />
        </div>
      </section>
    </>
  );
}
