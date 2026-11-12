/**
 * The School front page, v2 look (12 Nov, canvas page "Front pages: current vs v2", boards F51-v2-*).
 * Graphite and brushed metal, warm white for anything lit, pink only on go. Big centred headline over a wide deck,
 * big numbers for the four moves, a tile grid where Learn is the biggest tile.
 * Its own words: "Stop watching tutorials. Start making tracks." (the current School says "From your first kick...")
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ccdHref } from "@/lib/ccd";
import "./front-v2.css";

const START = "/start";
const LEVEL = "/placement";

const HOW = [
  ["It plays first", "You hear the part before you touch anything, so you know where you're going."],
  ["You play it", "On pads and keys, in time with the click. It shows you how first, if you want."],
  ["You make it yours", "Turn the knobs until it sounds like you. Every knob says what it's doing."],
  ["It joins your song", "Every lesson leaves something behind. Ten lessons in, you have a beat."],
] as const;
const ROAD = [
  ["Basics", "22 lessons", "A beat", "Start here if you've never made music. Pulse, rhythm, notes and chords."],
  ["Producer", "21 lessons", "A finished track", "Bass, synths, sound design, the mix and the drop."],
  ["DJ", "17 lessons", "A mix", "Play your track out on two decks, the way our DJs do."],
] as const;
const APPS = [
  ["Learn", "Lessons that leave a song behind, from the first kick to the drop.", "/learn"],
  ["Practice", "Five minutes a day keeps your ears sharp.", "/practice"],
  ["Studio", "Your song on pads, keys and knobs.", "/studio"],
  ["DJ decks", "Laid out like the decks in the club.", "/dj"],
  ["Library", "Every device in Live, playable.", "/atlas"],
] as const;
const LANES: [string, number[], string][] = [["kick", [0, 4, 8, 12], "on"], ["clap", [4, 12], "on"], ["hats", [2, 6, 10, 14], "on"], ["bass", [0, 3, 8, 11], "ghost"]];

const Arrow = () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Play = () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>;
const ICON: Record<string, ReactNode> = {
  Learn: <><path d="M4 6h10a4 4 0 0 1 4 4v9H8a4 4 0 0 1-4-4z" /><path d="M8 10h6M8 14h4" /></>,
  Practice: <path d="M3 12h3l2-6 4 12 2-6h7" />,
  Studio: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  "DJ decks": <><circle cx="8" cy="12" r="5" /><circle cx="8" cy="12" r="1" /><path d="M16 6v12M20 9v6" /></>,
  Library: <path d="M5 4v16M10 4v16M15 5l4 15" />,
};
const AppIcon = ({ n, size = 24 }: { n: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICON[n]}</svg>
);

function Deck() {
  return (
    <div className="fv-deck" aria-label="Lesson one: your song on the screen, eight pads, one lit to tap">
      <div className="fv-scr">
        <div className="fv-scrt"><span>lesson 1 · your pulse</span><span>120 bpm</span></div>
        <div className="fv-scrh">Your song</div>
        <div className="fv-lanes">
          {LANES.map(([name, steps, kind]) => (
            <div key={name} className="fv-lane"><span>{name}</span>{Array.from({ length: 16 }, (_, s) => <i key={s} className={steps.includes(s) ? `is-${kind}` : ""} />)}</div>
          ))}
        </div>
      </div>
      <div className="fv-pads">{Array.from({ length: 8 }, (_, i) => <span key={i} className={`fv-pad${i === 0 ? " is-lit" : ""}`} />)}</div>
      <div className="fv-doit"><b>Do this</b><span>Tap the lit pad on every beat</span><Link href={START} className="fv-gobtn" aria-label="Start lesson one"><Play /></Link></div>
    </div>
  );
}

export function FrontV2() {
  return (
    <div className="fv">
      <div className="fv-wrap">
        <header className="fv-bar">
          <Link href="/" className="fv-logo"><i />ccd school</Link>
          <nav className="fv-nav" aria-label="School"><Link href="/learn">Lessons</Link><Link href="/studio">Studio</Link><Link href="/dj">DJ decks</Link><Link href="/atlas">Library</Link><Link href="/login" className="fv-btn is-sm">Sign in</Link></nav>
        </header>

        <section className="fv-hero">
          <span className="fv-over">School · part of Cats Can Dance</span>
          <h1>Stop watching tutorials. Start making tracks.</h1>
          <p className="fv-lede">A real instrument in your browser, and a lesson for every part of a song: kick, bass, chords, the drop. By the end it&apos;s your track, and it opens in Ableton Live.</p>
          <div className="fv-ctas">
            <Link href={START} className="fv-btn is-go">Start lesson one<Arrow /></Link>
            <Link href={LEVEL} className="fv-btn">Find my level</Link>
          </div>
          <ul className="fv-fine"><li>Free</li><li>Works in your browser</li><li>199 lessons</li></ul>
        </section>
        <section className="fv-deckrow"><Deck /></section>

        <section className="fv-row">
          <div className="fv-lab"><span className="fv-no">01</span><h2>How every lesson goes</h2></div>
          <div className="fv-grid is-4">
            {HOW.map(([t, d], i) => <div key={t} className="fv-tile"><span className="fv-big">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </section>

        <section className="fv-row">
          <div className="fv-lab"><span className="fv-no">02</span><h2>Three roads, one song</h2></div>
          <div className="fv-grid is-3">
            {ROAD.map(([w, n, m, d]) => <div key={w} className="fv-road"><div className="fv-w"><span>{w}</span><span>{n}</span></div><div className="fv-mk">{m}</div><p>{d}</p></div>)}
          </div>
        </section>

        <section className="fv-row">
          <div className="fv-lab"><span className="fv-no">03</span><h2>Everything a producer uses, in one app</h2></div>
          <div className="fv-bento">
            {APPS.map(([n, d, href], i) => (
              <Link key={n} href={href} className={`fv-tile fv-app${i === 0 ? " is-big" : ""}`}><span className="fv-ai"><AppIcon n={n} size={i === 0 ? 30 : 24} /></span><h3>{n}</h3><p>{d}</p></Link>
            ))}
          </div>
        </section>

        <section className="fv-byrow">
          <div className="fv-by">
            <div className="fv-byt"><span className="fv-no">04</span><h2>From the people behind Episodes</h2><p>We run Episodes, the Cats Can Dance nights in Bengaluru. School teaches the same tools our DJs and producers use, checked against the Ableton Live and rekordbox manuals.</p><div><a href={ccdHref("/events")} className="fv-btn">See this week&apos;s nights</a></div></div>
            <div className="fv-art" aria-hidden="true"><i /></div>
          </div>
        </section>

        <section className="fv-end">
          <h2>Lesson one takes four minutes. Your first beat comes with it.</h2>
          <Link href={START} className="fv-btn is-go">Start lesson one<Arrow /></Link>
        </section>
        <footer className="fv-foot"><span>ccd school · part of Cats Can Dance</span><span>Free · 199 lessons</span></footer>
      </div>
    </div>
  );
}
