"use client";
/**
 * Side-column widgets (design pass, 9 Nov night). Each is a small working window onto another part of
 * ccd school, so a laptop screen is full of things to do instead of empty space: today's practice,
 * the studio, the dj decks, a word of the day, review. Every one opens its screen.
 */
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { TERMS } from "@/content/glossary";
import { loadGym } from "@/lib/gym/store";
import { weekStatus } from "@/lib/gym/week";
import { Icon } from "./controls";
import "./frame.css";
import "./widgets.css";

const DRILL_NAME: Record<string, string> = { eq: "eq ear", compression: "compression", groove: "tempo and groove", match: "match this sound", copy: "copy by ear", imagine: "imagine it first" };

export function PracticeWidget() {
  const [w, setW] = useState<{ filled: number; target: number; levels: [string, number][] } | null>(null);
  useEffect(() => {
    const g = loadGym();
    const s = weekStatus(g.week, new Date());
    const levels = (Object.entries(g.levels) as [string, { level: number }][]).map(([k, v]) => [k, v.level] as [string, number]).sort((a, b) => b[1] - a[1]).slice(0, 3);
    setW({ filled: s.filled, target: s.target, levels });
  }, []);
  return (
    <Link href="/gym" className="wg wg-practice">
      <div className="wg-h"><b>practice</b><span>this week</span></div>
      <div className="wg-row" style={{ justifyContent: "space-between" }}>
        <span className="wg-t">today&apos;s 5 minutes</span>
        <span className="wg-leds" role="img" aria-label={`${w?.filled ?? 0} of ${w?.target ?? 3} sessions this week`}>
          {Array.from({ length: w?.target ?? 3 }, (_, i) => <i key={i} className={i < (w?.filled ?? 0) ? "is-on" : ""} />)}
        </span>
      </div>
      <div className="wg-bars">
        {(w?.levels ?? [["groove", 1], ["copy", 1]]).map(([k, lv]) => (
          <div key={k} className="wg-bar"><span>{DRILL_NAME[k] ?? k}</span><i style={{ ["--w" as string]: `${Math.min(100, lv * 12)}%` } as CSSProperties} /><em>lv {lv}</em></div>
        ))}
      </div>
    </Link>
  );
}

const PADS = [[0, 5], [2], [0, 6], [2], [0, 5], [2, 7], [0, 6], [3, 4]];
export function StudioWidget({ parts }: { parts: number }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setT(x => x + 1), 260);
    return () => window.clearInterval(id);
  }, []);
  const on = PADS[t % 8];
  return (
    <Link href="/studio" className="wg wg-studio">
      <div className="wg-h"><b>studio</b><span>{parts ? `${parts} ${parts === 1 ? "part" : "parts"}` : "a starter loop"}</span></div>
      <div className="wg-pads" aria-hidden>{Array.from({ length: 8 }, (_, i) => <i key={i} className={on.includes(i) ? "is-on" : ""} />)}</div>
      <div className="wg-row" style={{ justifyContent: "space-between" }}>
        <span className="wg-t">build your song out</span>
        <span className="wg-chip"><Icon name="out" small />to live</span>
      </div>
    </Link>
  );
}

export function DecksWidget() {
  return (
    <Link href="/dj" className="wg wg-decks">
      <div className="wg-h"><b>dj decks</b><span>two decks and a mixer</span></div>
      <div className="wg-jogs" aria-hidden>
        <i style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} />
        <span className="wg-mixer"><em /><em /><b /></span>
        <i style={{ ["--c" as string]: "var(--led-cobalt)" } as CSSProperties} />
      </div>
      <span className="wg-t">play your song out</span>
    </Link>
  );
}

export function WordWidget() {
  const [i, setI] = useState(0);
  useEffect(() => setI(Math.floor(Date.now() / 86400000) % Math.max(1, TERMS.length)), []);
  const w = TERMS[i];
  if (!w) return null;
  return (
    <Link href="/atlas" className="wg wg-word">
      <div className="wg-h"><b>word of the day</b><span>library</span></div>
      <span className="wg-t">{w.term.toLowerCase()}</span>
      <span className="wg-s wg-clamp">{w.def}</span>
    </Link>
  );
}

export function ReviewWidget({ due, any }: { due: number; any: boolean }) {
  return (
    <Link href="/review" className="wg wg-review">
      <div className="wg-h"><b>review</b>{due ? <span className="wg-leds"><i className="is-on" /></span> : null}</div>
      <span className="wg-s" style={{ fontSize: "var(--fs-4)", color: "var(--ink)" }}>{due ? `${due} ${due === 1 ? "lesson is" : "lessons are"} ready for a quick refresh.` : any ? "nothing due. you're fresh." : "finished lessons come back here so they stick."}</span>
    </Link>
  );
}

/** Your last answers in practice, one light each: lit for right, dark for wrong. */
export function AnswersWidget() {
  const [h, setH] = useState<boolean[] | null>(null);
  useEffect(() => setH(loadGym().history.slice(-24).map(r => r.correct)), []);
  const right = (h ?? []).filter(Boolean).length;
  return (
    <div className="wg">
      <div className="wg-h"><b>your last answers</b><span>{h?.length ? `${right} of ${h.length} right` : "none yet"}</span></div>
      {h?.length ? (
        <span className="wg-leds wg-answers" role="img" aria-label={`${right} of ${h.length} right`}>{h.map((ok, i) => <i key={i} className={ok ? "is-on" : ""} />)}</span>
      ) : <span className="wg-s" style={{ fontSize: "var(--fs-4)", color: "var(--ink)" }}>your answers show up here after your first session.</span>}
    </div>
  );
}
