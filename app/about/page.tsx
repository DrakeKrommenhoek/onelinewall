import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Connector from "@/components/Connector";
import Mark from "@/components/Mark";
import { MARKERS, site, team } from "@/content/site";

export const metadata: Metadata = {
  title: "About us",
  description: "Five W&L students, one design thinking class, and one question: where did the creativity go?",
};

const css = (vars: Record<string, string>) => vars as CSSProperties;

const timeline = [
  {
    color: MARKERS.blue,
    stage: "Empathize",
    title: "We asked around.",
    body: "We sat down with classmates and asked what creativity means to them and where they feel it. Most could define it. Almost nobody could say where on campus it happens.",
  },
  {
    color: MARKERS.red,
    stage: "Define",
    title: "We found the pattern.",
    body: "Everything we heard fell into four buckets: place, people, pressure, and access. Creativity isn't only something inside a person. The space, the people around you, your time, and what you have access to either block it or help it grow.",
  },
  {
    color: MARKERS.green,
    stage: "Ideate",
    title: "We went wide.",
    body: "Each of us chased a different idea and built out what it could look like. Then we got feedback, and the advice was clear: pick one and go deep.",
  },
  {
    color: MARKERS.orange,
    stage: "Prototype",
    title: "We picked the one people could start in five seconds.",
    body: `The One-Line Wall. We set up a booth in ${site.booth.place} on ${site.booth.date} with a whiteboard and markers and asked people for one line each. The time-lapse on our home page is that afternoon.`,
  },
  {
    color: MARKERS.purple,
    stage: "Test",
    title: "Now we put boards out and see what happens.",
    body: "Whiteboards in high-traffic spots. Weekly prompts that students pitch and vote on. We watch what gets used, where, and when, and keep what works.",
  },
];

const goals = [
  {
    color: MARKERS.blue,
    title: "Lower the stakes",
    body: "Take away the questions that stop people: where can I write, will it be embarrassing, do I have time.",
  },
  {
    color: MARKERS.red,
    title: "Make shared space feel like ours",
    body: "Turn hallways and lobbies into places where it's normal to leave a mark.",
  },
  {
    color: MARKERS.green,
    title: "Mix people up",
    body: "Your line connects to a stranger's. Your favorite movie reminds someone else of theirs. That's how new circles start.",
  },
  {
    color: MARKERS.orange,
    title: "Build a weekly habit",
    body: "A new prompt every Monday, chosen by students, with a newsletter that brings the answers to everyone.",
  },
];

const tilt = ["-1.5deg", "1deg", "-0.6deg", "1.4deg", "-1deg"];

export default function About() {
  return (
    <>
      <header className="page-head">
        <div className="wrap" data-reveal>
          <p className="kicker">About us</p>
          <h1 className="h1">
            Five students. One class. <Mark color="blue">One question.</Mark>
          </h1>
          <p className="lede">
            Where did the creativity go at W&amp;L, and what would it take to bring it back? This is our answer, or at
            least the first line of it.
          </p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap story">
          <div className="story-text" data-reveal>
            <p>
              We&apos;re a team in <strong>{site.course}</strong> at Washington and Lee. The assignment was to find a
              real problem on campus, understand the people living it, and do something about it.
            </p>
            <p>
              The problem we kept running into was <strong>creativity, or the lack of room for it.</strong> Not because
              people here aren&apos;t creative. Because there are so many small reasons not to try: you don&apos;t know
              where you&apos;re allowed to write, you&apos;re worried it&apos;ll be embarrassing, you don&apos;t have
              time, you don&apos;t have a group. So you stick to the same music, the same shows, the same three places
              to eat, and you rarely step outside your comfort zone.
            </p>
            <p>
              The One-Line Wall is our push in the other direction. It&apos;s small on purpose. One line is easy. One line
              next to someone else&apos;s is the start of something neither of you would have made alone.
            </p>
          </div>
          <aside className="board-frame case-card" data-reveal style={css({ "--d": "0.1s" })}>
            <dl>
              <div>
                <dt>Course</dt>
                <dd>{site.course}</dd>
              </div>
              <div>
                <dt>Professor</dt>
                <dd>{site.professor}</dd>
              </div>
              <div>
                <dt>First wall</dt>
                <dd>
                  {site.booth.place}, {site.booth.date}
                </dd>
              </div>
              <div>
                <dt>Our question</dt>
                <dd style={{ color: MARKERS.navy }}>How might we make creativity easier to start?</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <Connector color="orange" variant={0} />

      <section className="section">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker" style={css({ "--kicker": MARKERS.green })}>
              How we got here
            </p>
            <h2 className="h2">The design thinking, start to now.</h2>
          </div>
          <ol className="timeline">
            {timeline.map((t, i) => (
              <li key={t.stage} data-reveal style={css({ "--c": t.color, "--d": `${i * 0.06}s` })}>
                <span className="pin">{i + 1}</span>
                <div>
                  <h3>
                    {t.title}
                    <span className="stage">{t.stage}</span>
                  </h3>
                  <p>{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker" style={css({ "--kicker": MARKERS.orange })}>
              What we want out of it
            </p>
            <h2 className="h2">Small boards. Bigger goals.</h2>
          </div>
          <div className="goals">
            {goals.map((g, i) => (
              <div key={g.title} className="goal" data-reveal style={css({ "--c": g.color, "--d": `${i * 0.08}s` })}>
                <span className="n">{i + 1}</span>
                <h3>{g.title}</h3>
                <p>{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Connector color="purple" variant={2} />

      <section className="section" id="team">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker" style={css({ "--kicker": MARKERS.purple })}>
              The team
            </p>
            <h2 className="h2">Five markers, one wall.</h2>
            <p className="lede">Each of us has a color. Look for them on the boards.</p>
          </div>
          <div className="team">
            {team.map((m, i) => (
              <article
                key={m.name}
                className="member"
                data-reveal
                style={css({ "--c": MARKERS[m.color], "--r": tilt[i % tilt.length], "--d": `${i * 0.06}s` })}
              >
                <div className="avatar" aria-hidden={!m.photo}>
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} />
                  ) : (
                    m.name[0]
                  )}
                </div>
                <h3>{m.name}</h3>
                {(m.role || m.year || m.major) && (
                  <p className="meta">{[m.role, m.major, m.year].filter(Boolean).join(" · ")}</p>
                )}
                {m.line ? (
                  <p className="line">“{m.line}”</p>
                ) : (
                  <svg viewBox="0 0 100 18" preserveAspectRatio="none" aria-hidden="true">
                    <path d={["M2 12 C 30 2, 60 18, 98 6", "M2 6 C 25 18, 55 0, 98 12", "M2 14 C 20 2, 45 2, 60 10 S 90 16, 98 4"][i % 3]} />
                  </svg>
                )}
              </article>
            ))}
          </div>
          <p className="form-note" style={{ textAlign: "center", marginTop: 28 }}>
            Thanks to {site.professor} and everyone who stopped by the booth and picked up a marker.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="board-frame cta-band" data-reveal>
            <h2 className="h2">Your line goes next.</h2>
            <p className="lede" style={{ marginInline: "auto" }}>
              Find a board on campus, or pitch what next week&apos;s wall should be.
            </p>
            <div className="hero-ctas">
              <Link href="/#pitch" className="btn">
                Pitch a prompt <span className="arrow">→</span>
              </Link>
              <Link href="/#formats" className="btn btn-ghost">
                See the formats
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
