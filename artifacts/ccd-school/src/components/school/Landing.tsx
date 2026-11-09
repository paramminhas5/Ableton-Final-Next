"use client";
/**
 * The School front page (10 Nov), built from the Cats Can Dance suite design (canvas "CCD Products: Identities",
 * board F38-LandSchool): true black, Bricolage Grotesque display type, one pink panel, numbered steps, mono labels.
 * Every picture on it is the real app: the clips the first-visit walkthrough plays (public/tour).
 * "Start your song" opens the walkthrough at /start.
 */
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CCD_LINKS, CCD_URL } from "@/lib/ccd";
import "./landing.css";

const START = "/start";
const FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=JetBrains+Mono:wght@500&display=swap";
const CAT = "/brand/ccd-cat.png";

/** A recording of the real app. Plays, muted, only while it is on screen; with reduced motion it shows its first frame. */
function Clip({ k, label, eager = false }: { k: string; label: string; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) void v.play().catch(() => {}); else v.pause(); }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className="ld-clip" src={`/tour/${k}.mp4`} poster={`/tour/${k}.jpg`} muted loop playsInline preload={eager ? "auto" : "none"} aria-label={`${label}: a recording of ccd school`} />;
}

/** Fades sections up as they scroll in. Anything already on screen when the page opens stays put, so nothing starts hidden. */
function useReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-rv]")].filter(e => e.getBoundingClientRect().top > window.innerHeight * 0.92);
    els.forEach(e => e.classList.add("rv-wait"));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove("rv-wait"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, []);
}

/** The hero phone drifts a little as you scroll, the way the CCD home's art does. */
function useDrift() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => ref.current?.style.setProperty("--sy", String(Math.min(1, window.scrollY / 700)))); };
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return ref;
}

const HOW = [
  { n: "01", k: "learn-a", h: "Play a part in", p: "Each lesson teaches one idea on a real instrument. Then you play it, and it goes into your song." },
  { n: "02", k: "learn-b", h: "Shape what you made", p: "Turn the knobs the lesson just taught you. Every control has the name Ableton Live gives it." },
  { n: "03", k: "studio-b", h: "Build it out", p: "Arrange your loop into sections in the studio, then send the whole song to Live." },
  { n: "04", k: "dj-a", h: "Play it out", p: "Two decks and a mixer, laid out like a real controller. Your song is on deck a." },
];

const LESSONS = [
  { t: "Your kick", s: "the first loop of your song", m: 8, done: true },
  { t: "Sound, and your first synth", s: "a lead line over the kick", m: 9, done: true },
  { t: "Hats", s: "open hats on the off-beat", m: 7, done: true },
  { t: "Clap and snare", s: "the backbeat on two and four", m: 6 },
  { t: "Your first bass line", s: "notes that sit under the kick", m: 7 },
];

const FAQ: { q: string; a: ReactNode }[] = [
  { q: "Do I need any gear?", a: "No. A laptop or a phone is enough. Headphones help you hear the low end." },
  { q: "Is it free?", a: "Yes. Every lesson, the studio and the decks are free while we build it." },
  { q: "Is it for DJs too?", a: "Yes. After the basics there is a whole dj world: beatmatching, eq, phrasing and mixing your own song." },
  { q: "Does it work with Ableton Live?", a: "Your song goes to Live as a file it opens. The library explains the devices that come with Live, and lets you play each one." },
  { q: "I've made music before.", a: "Take the three-minute placement. It listens to you play and starts you where you are." },
  { q: "Who makes it?", a: <>Cats Can Dance, the people behind the Episodes nights in Bengaluru. Facts are checked against the Live and rekordbox manuals.</> },
];

function Check({ children }: { children: ReactNode }) {
  return <li><svg viewBox="0 0 16 16" aria-hidden><path d="M3.5 8.5l3 3 6-7" /></svg>{children}</li>;
}

export function Landing() {
  useReveal();
  const drift = useDrift();
  const [parts, setParts] = useState(1);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setParts(3); return; }
    const id = window.setInterval(() => setParts(p => (p % 4) + 1), 1600);
    return () => window.clearInterval(id);
  }, []);
  const events = CCD_LINKS.find(l => l.key === "events");
  const artists = CCD_LINKS.find(l => l.key === "artists");

  return (
    <div className="ld">
      {/* React puts this in the head; only the front page needs the display face */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <div className="ld-strip">
        <a href={CCD_URL} className="ld-mark">Cats Can Dance</a>
        <nav aria-label="Cats Can Dance">
          {events ? <a href={events.href}><i style={{ background: "#3D6BFF" }} />Nights</a> : null}
          {artists ? <a href={artists.href}><i style={{ background: "#B6EF36" }} />Artists</a> : null}
          <span aria-current="page"><i style={{ background: "#FF4F9A" }} />School</span>
        </nav>
      </div>

      <header className="ld-nav">
        <Link href="/" className="ld-brand"><i aria-hidden />School<small>learn</small></Link>
        <nav aria-label="On this page" className="ld-links">
          <a href="#how">How it works</a>
          <a href="#inside">What&apos;s in it</a>
          <a href="#questions">Questions</a>
        </nav>
        <div className="ld-acts">
          <Link href="/login" className="ld-ghost is-sm">Sign in</Link>
          <Link href={START} className="ld-key is-sm">Start your song</Link>
        </div>
      </header>

      <section className="ld-hero">
        <div className="ld-hero-t">
          <p className="ld-meta">School <span>/</span> part of Cats Can Dance</p>
          <h1 className="ld-d ld-h1">Learn to make music by making it.</h1>
          <p className="ld-lede">Short lessons on a real instrument, in your browser. Every lesson adds a part to a song that&apos;s yours, and the song opens in Ableton Live.</p>
          <div className="ld-row">
            <Link href={START} className="ld-key">Start your song</Link>
            <a href="#how" className="ld-ghost">How it works</a>
          </div>
          <p className="ld-meta ld-fine">Free <span>/</span> no gear needed <span>/</span> 198 lessons</p>
        </div>
        <div className="ld-panel" ref={drift}>
          <div className="ld-phone"><Clip k="learn-a" label="A lesson: playing hats into your song" eager /></div>
          <div className="ld-song" aria-hidden>
            <div className="ld-song-h"><b>night bus</b><span>122 bpm</span></div>
            {[["kick", "#4FE3B6", [0, 2, 4, 6]], ["clap", "#4FE3B6", [1, 3, 5, 7]], ["hats", "#FFC21A", [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5]], ["lead", "#B79CFF", [0, 1.5, 3, 4, 5.5]]].map(([n, c, at], i) => (
              <div key={n as string} className={`ld-lane ${i < parts ? "is-in" : ""}`} style={{ ["--c" as string]: c as string }}>
                <span>{n as string}</span>
                <em>{(at as number[]).map(x => <i key={x} style={{ left: `${(x / 8) * 100}%` }} />)}</em>
              </div>
            ))}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAT} alt="" className="ld-cat" />
        </div>
      </section>

      <section id="how" className="ld-sec">
        <h2 className="ld-d ld-h2" data-rv>How it works</h2>
        <ol className="ld-how">
          {HOW.map(s => (
            <li key={s.n} data-rv>
              <div className="ld-mini"><Clip k={s.k} label={s.h} /></div>
              <span className="ld-num">{s.n}</span>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="inside" className="ld-sec">
        <h2 className="ld-d ld-h2" data-rv>What&apos;s in it</h2>
        <div className="ld-three">
          <article data-rv>
            <p className="ld-eyebrow">A real instrument</p>
            <h3 className="ld-d ld-h3">Not videos. An instrument.</h3>
            <p className="ld-p">Drum pads, synths and keys on a sound engine built for this. You hear every change the moment you make it.</p>
            <ul className="ld-checks"><Check>Pads, keys, knobs and a step grid</Check><Check>Live&apos;s names for every control</Check><Check>Your song opens in Ableton Live</Check></ul>
            <div className="ld-card"><div className="ld-mini is-card"><Clip k="studio-a" label="The studio" /></div></div>
          </article>
          <article data-rv>
            <p className="ld-eyebrow">Short lessons</p>
            <h3 className="ld-d ld-h3">A few minutes, then you&apos;ve made something.</h3>
            <p className="ld-p">57 lessons build one song, from your first kick to a finished track. 138 deeper ones are there when you want more.</p>
            <ul className="ld-checks"><Check>Basics, producing and djing</Check><Check>Five minutes of ear practice a day</Check><Check>Placement in three minutes</Check></ul>
            <div className="ld-card">
              <ol className="ld-list">
                {LESSONS.map((l, i) => (
                  <li key={l.t} className={l.done ? "is-done" : i === 3 ? "is-next" : ""}>
                    <b>{i + 1}</b>
                    <span>{l.t}<small>{l.s}</small></span>
                    <em>{l.done ? <><i />done</> : `${l.m} min`}</em>
                  </li>
                ))}
              </ol>
            </div>
          </article>
          <article data-rv>
            <p className="ld-eyebrow">Play it out</p>
            <h3 className="ld-d ld-h3">From your room to the decks.</h3>
            <p className="ld-p">When your song is ready, mix it on two decks the way the DJs at our nights do.</p>
            <ul className="ld-checks"><Check>Beatmatch, eq and phrase</Check><Check>Your song on deck a</Check><Check>Live&apos;s devices, explained</Check></ul>
            <div className="ld-card"><div className="ld-mini is-card"><Clip k="dj-b" label="The dj decks" /></div></div>
          </article>
        </div>
      </section>

      <section id="questions" className="ld-sec ld-faq">
        <h2 className="ld-d ld-h2" data-rv>Questions</h2>
        <dl>
          {FAQ.map(f => <div key={f.q} data-rv><dt>{f.q}</dt><dd>{f.a}</dd></div>)}
        </dl>
      </section>

      <section className="ld-cta" data-rv>
        <h2 className="ld-d">Make your first song tonight.</h2>
        <Link href={START} className="ld-key is-white">Start your song</Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT} alt="" className="ld-cta-cat" />
      </section>

      <footer className="ld-foot">
        <a href={CCD_URL} className="ld-mark">Cats Can Dance</a>
        <p className="ld-meta">School is part of Cats Can Dance</p>
        <nav aria-label="More from Cats Can Dance">{CCD_LINKS.filter(l => l.key !== "home").map(l => <a key={l.key} href={l.href}>{l.label}</a>)}</nav>
      </footer>
    </div>
  );
}
