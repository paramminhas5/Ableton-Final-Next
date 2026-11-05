"use client";
/**
 * The dashboard, pointed out once, straight after onboarding (/dashboard?tour=1): a spotlight moves
 * over each part with one line on what it does, and the last step opens lesson one.
 */
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoPill } from "./controls";
import { TOUR_KEY } from "./Welcome";
import { missionBySlug } from "@/content/missions";

const STOPS: { sel: string; title: string; line: string }[] = [
  { sel: ".td-lessoncard, .td-upnext", title: "your next lesson", line: "always here. press play on it to start." },
  { sel: ".td-knobs", title: "turn to choose", line: "world, path and lesson. tap a knob to step it, or drag it." },
  { sel: ".td-all", title: "every lesson, by path", line: "paths are the chapters of a world. tap any lesson to pick it." },
  { sel: ".td-switch", title: "lesson or your song", line: "flip to your track to hear the song your lessons are building." },
  { sel: ".m1-modebar", title: "the rest of ccd school", line: "practice for ear games and reviews, studio to build your song out, library for every word and sound." },
];

/** The first element a selector list finds that is actually on the page (phones hide some cards). */
const visible = (sel: string): Element | null => [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }) ?? null;

export function DashTour() {
  const params = useSearchParams();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const on = params.get("tour") === "1";
  const stop = STOPS[i];
  useEffect(() => {
    if (!on) return;
    // Something else on the page (the lesson list finding your lesson) can scroll after we do; put the target back first.
    const place = () => {
      const el = visible(stop.sel);
      if (el && stop.sel !== ".m1-modebar") {
        const r = el.getBoundingClientRect();
        if (r.top < 60 || r.top > window.innerHeight * 0.5) { const y = window.scrollY + r.top - 76; window.scrollTo({ top: y < 140 ? 0 : y, behavior: "auto" }); }
      }
      // Every visible match together: on desktop the lesson card and its play key are two cards, and the
      // spotlight has to hold the key it tells you to press.
      const all = [...document.querySelectorAll(stop.sel)].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0);
      setBox(all.length ? all.reduce((u, r) => { const l = Math.min(u.left, r.left), t = Math.min(u.top, r.top); return new DOMRect(l, t, Math.max(u.right, r.right) - l, Math.max(u.bottom, r.bottom) - t); }) : null);
    };
    const el = visible(stop.sel);
    // Bring the target into the part of the screen the fixed bottom bar doesn't cover, with room
    // for the card. The bottom bar itself is always on screen, so it needs no scrolling.
    if (el && stop.sel !== ".m1-modebar") {
      // The target's top just under the header, so the card fits below it (or above, when it's tall).
      const r = el.getBoundingClientRect();
      // Near the top of the page, scroll to the very top so the header stays whole (phones cut it in half).
      const y = window.scrollY + r.top - 76;
      window.scrollTo({ top: y < 140 ? 0 : y, behavior: "auto" });
    }
    const first = window.setTimeout(place, 60);
    const id = window.setTimeout(place, 450);
    const late = window.setTimeout(place, 1200);
    window.addEventListener("resize", place);
    return () => { window.clearTimeout(first); window.clearTimeout(id); window.clearTimeout(late); window.removeEventListener("resize", place); };
  }, [on, stop]);
  if (!on) return null;
  const last = i === STOPS.length - 1;
  const end = () => {
    let first = "";
    try { first = sessionStorage.getItem(TOUR_KEY) ?? ""; sessionStorage.removeItem(TOUR_KEY); } catch { /* ignore */ }
    // The tour closes, then lesson one opens on its own screen.
    setLeaving(first ? (missionBySlug(first)?.title ?? "lesson one").toLowerCase() : "");
    window.setTimeout(() => router.replace(first ? `/learn/${first}` : "/dashboard"), 1100);
  };
  if (leaving !== null) return <div className="tr-go" role="status"><span>lesson one</span><b>{leaving}</b></div>;
  const pad = 8;
  // Below the target when it fits above the bottom bar, else above it, else pinned just over the bar.
  const barH = typeof document !== "undefined" ? document.querySelector(".m1-modebar")?.getBoundingClientRect().height ?? 0 : 0;
  const below = box ? box.bottom + 16 + 190 < window.innerHeight - barH : true;
  const above = box ? box.top - 16 - 190 > 0 : false;
  // A tall target with no room above or below (the lesson card on desktop): the card goes beside it, so it never covers the key it points at.
  const side = box && !below && !above ? (window.innerWidth - box.right > 372 ? box.right + 16 : box.left > 372 ? box.left - 356 : null) : null;
  const cardTop = !box ? 0 : side !== null ? Math.min(Math.max(16, box.top), window.innerHeight - barH - 206) : below ? box.bottom + 16 : above ? box.top - 206 : Math.max(16, window.innerHeight - barH - 206);
  return (
    <div className="tr" role="dialog" aria-label="A quick look around">
      {box && <div className="tr-hole" style={{ top: Math.max(4, box.top - pad), left: box.left - pad, width: box.width + pad * 2, height: Math.min(box.height + pad * 2, window.innerHeight - Math.max(4, box.top - pad) - 4) }} />}
      <div className="tr-card" style={box ? { top: cardTop, left: side ?? Math.min(Math.max(16, box.left), window.innerWidth - 356) } : { top: "40%", left: "50%", transform: "translateX(-50%)" }} key={i}>
        <div className="tr-n">{i + 1} of {STOPS.length}</div>
        <h2>{stop.title}</h2>
        <p>{stop.line}</p>
        <div className="tr-keys">
          <button type="button" className="ls-chip" onClick={() => router.replace("/dashboard")}>skip</button>
          <div style={{ flex: 1, height: 52 }}><GoPill onClick={() => (last ? end() : setI(i + 1))} style={{ height: 52, width: "100%" }}>{last ? "start lesson one" : "next"}</GoPill></div>
        </div>
      </div>
    </div>
  );
}
