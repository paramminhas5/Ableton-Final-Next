/**
 * The School front page, current look (12 Nov, canvas page "Front pages: current vs v2", boards F51-current-*).
 * The Model 1 instrument is the hero: glass screen with your song, raised pads, knobs, numbered sections and a cue.
 * Copy: "From your first kick to your first set." v2 has its own page and its own words (FrontV2 on school/v2).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ccdHref } from "@/lib/ccd";
import "./front-current.css";

const START = "/start";
const LEVEL = "/placement";

const HOW = [
  ["Hear it", "It plays first, so you know what you're making before you touch anything."],
  ["Play it", "Pads and keys you play yourself. Ask it to show you first, as often as you like."],
  ["Shape it", "Turn the knobs and hear what each one does while you turn it."],
  ["Keep it", "It drops into your song. The next lesson builds on top of it."],
] as const;
const ROAD = [
  ["Basics", "22 lessons", "a beat", "Pulse, rhythm, notes and chords, played on the pads from day one."],
  ["Producer", "21 lessons", "a finished track", "Bass, synths, sound design, the mix and the drop."],
  ["DJ", "17 lessons", "a mix", "Beatmatch, eq and phrase, with your own track on deck A."],
] as const;
const APPS = [
  ["Learn", "Lessons that build one song, from your first kick to a finished track.", "/learn"],
  ["Practice", "Five minutes of ear training a day, picked from what you just learnt.", "/practice"],
  ["Studio", "Pads, keys and knobs, all playing your song. It only shows what you've learnt.", "/studio"],
  ["DJ decks", "Two decks and a mixer, laid out like the controllers in clubs.", "/dj"],
  ["Library", "Every device in Live. Describe the sound you want and it finds the device.", "/atlas"],
] as const;
const LANES: [string, number[], string][] = [["kick", [0, 4, 8, 12], "on"], ["clap", [4, 12], "on"], ["hats", [2, 6, 10, 14], "on"], ["bass", [0, 3, 8, 11], "ghost"]];
const LANE_C: Record<string, string> = { kick: "var(--led-mint)", clap: "var(--led-cobalt)", hats: "var(--led-lilac)", bass: "var(--led-mint)" };

const Arrow = () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Play = () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>;
export const APP_ICON: Record<string, ReactNode> = {
  Learn: <><path d="M4 6h10a4 4 0 0 1 4 4v9H8a4 4 0 0 1-4-4z" /><path d="M8 10h6M8 14h4" /></>,
  Practice: <path d="M3 12h3l2-6 4 12 2-6h7" />,
  Studio: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  "DJ decks": <><circle cx="8" cy="12" r="5" /><circle cx="8" cy="12" r="1" /><path d="M16 6v12M20 9v6" /></>,
  Library: <path d="M5 4v16M10 4v16M15 5l4 15" />,
};
export const AppIcon = ({ n, size = 22 }: { n: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{APP_ICON[n]}</svg>
);

function Instrument() {
  return (
    <div className="fc-panel" aria-label="Lesson one on the School instrument: your song on the screen, eight pads, four knobs">
      <div className="fc-glass">
        <div className="fc-lcd"><span>lesson 1 · your pulse</span><span>120 bpm</span></div>
        <div className="fc-lcdbig">Your song</div>
        <div className="fc-lanes">
          {LANES.map(([name, steps, kind]) => (
            <div key={name} className="fc-lane" style={{ ["--lc" as string]: LANE_C[name] }}>
              <span>{name}</span>
              {Array.from({ length: 16 }, (_, s) => <i key={s} className={steps.includes(s) ? `is-${kind}` : ""} />)}
            </div>
          ))}
        </div>
      </div>
      <div className="fc-silk"><b>1</b>play it</div>
      <div className="fc-pads">
        {["kick", "clap", "hat", "open hat", "tom", "rim", "shaker", "crash"].map((n, i) => <span key={n} className={`fc-pad${i === 0 ? " is-lit" : ""}`}>{n}</span>)}
      </div>
      <div className="fc-silk"><b>2</b>shape it</div>
      <div className="fc-knobs">
        {([["tune", -30], ["decay", 40], ["drive", -80], ["level", 20]] as const).map(([n, r]) => <span key={n} className="fc-knob"><i style={{ ["--r" as string]: `${r}deg` }} />{n}</span>)}
      </div>
      <div className="fc-silk"><b>3</b>record</div>
      <div className="fc-tport">
        <span className="fc-tk"><Play /></span><span className="fc-tk is-rec"><i /></span>
        <span className="fc-cue"><b>3</b>Press rec, then tap kick on every beat</span>
      </div>
    </div>
  );
}

export function FrontCurrent() {
  return (
    <div className="fc">
      <div className="fc-wrap">
        <header className="fc-bar">
          <Link href="/" className="fc-logo"><i><b /></i>ccd school</Link>
          <div className="fc-barr"><span className="fc-tag">Free, in your browser</span><Link href="/login" className="fc-key is-sm">Sign in</Link></div>
        </header>

        <section className="fc-hero">
          <div className="fc-heroc">
            <p className="fc-meta">School · part of Cats Can Dance</p>
            <h1>From your first kick to your first set.</h1>
            <p className="fc-lede">Short lessons on a real instrument, right in your browser. Every one adds a part to a song that&apos;s yours. When it&apos;s done, open it in Ableton Live or play it out on the decks.</p>
            <div className="fc-ctas">
              <Link href={START} className="fc-key is-go">Make your first beat<Arrow /></Link>
              <Link href={LEVEL} className="fc-key">I already make music</Link>
            </div>
            <ul className="fc-fine"><li>Free</li><li>Nothing to install</li><li>199 lessons</li></ul>
          </div>
          <Instrument />
        </section>

        <section className="fc-sec">
          <div className="fc-sh"><span className="fc-num">01</span><h2>Every lesson, the same four moves</h2></div>
          <div className="fc-grid is-4">
            {HOW.map(([t, d], i) => <div key={t} className="fc-card fc-step"><span className="fc-stepn">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </section>

        <section className="fc-sec">
          <div className="fc-sh"><span className="fc-num">02</span><h2>Where it takes you</h2></div>
          <div className="fc-grid is-3">
            {ROAD.map(([w, n, m, d]) => (
              <div key={w} className="fc-card fc-road">
                <div className="fc-rtop"><h3>{w}</h3><span className="fc-chip">{n}</span></div>
                <div className="fc-makes"><em>you make</em>{m}</div>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="fc-sec">
          <div className="fc-sh"><span className="fc-num">03</span><h2>Everything you need, in one place</h2></div>
          <div className="fc-grid is-5">
            {APPS.map(([n, d, href]) => <Link key={n} href={href} className="fc-card fc-app"><span className="fc-appi"><AppIcon n={n} /></span><h3>{n}</h3><p>{d}</p></Link>)}
          </div>
        </section>

        <section className="fc-sec">
          <div className="fc-by">
            <div className="fc-byt"><span className="fc-num">04</span><h2>Made by the people behind Episodes</h2><p>Cats Can Dance runs Episodes, our nights in Bengaluru. School teaches what our DJs and producers actually use, and every fact is checked against the Ableton Live and rekordbox manuals.</p></div>
            <a href={ccdHref("/events")} className="fc-key">See this week&apos;s nights</a>
          </div>
        </section>

        <section className="fc-end">
          <h2>Your first beat is four minutes away.</h2>
          <Link href={START} className="fc-key is-go">Make your first beat<Arrow /></Link>
        </section>
        <footer className="fc-foot"><span>ccd school · part of Cats Can Dance</span><span>Free · 199 lessons</span></footer>
      </div>
    </div>
  );
}
